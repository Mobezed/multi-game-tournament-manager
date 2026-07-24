import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
    import { Tournament, TournamentState, TournamentAction, GameId, TournamentFormat, MatchFormat, Team, Match, Group } from '../types';

    const STORAGE_KEY = 'tournament-manager-data';

    // Seed demo data
    const seedDemoTournaments = (): Tournament[] => {
      const now = new Date().toISOString();
      return [
        {
          id: 'demo-lol',
          name: 'LoL Championship Series',
          gameId: 'league-of-legends',
          format: 'single-elimination',
          status: 'in-progress',
          startDate: new Date(Date.now() - 86400000).toISOString(),
          maxTeams: 8,
          matchFormat: 'BO3',
          checkinRequired: false,
          prizePool: '500 USD',
          teams: [
            { id: 't1', name: 'T1', players: Array(5).fill(null).map((_,i) => ({ username: `Player${i+1}` })), accentColor: '#00C2FF' },
            { id: 't2', name: 'Gen.G', players: Array(5).fill(null).map((_,i) => ({ username: `Gamer${i+1}` })), accentColor: '#F0B429' },
            { id: 't3', name: 'DRX', players: Array(5).fill(null).map((_,i) => ({ username: `Pro${i+1}` })), accentColor: '#FF3B3B' },
            { id: 't4', name: 'KT Rolster', players: Array(5).fill(null).map((_,i) => ({ username: `Ace${i+1}` })), accentColor: '#00C2FF' },
          ],
          matches: [
            { id: 'm1', round: 1, teamAId: 't1', teamBId: 't3', teamAScore: 2, teamBScore: 0, winnerId: 't1', matchFormat: 'BO3', isCompleted: true },
            { id: 'm2', round: 1, teamAId: 't2', teamBId: 't4', teamAScore: null, teamBScore: null, winnerId: null, matchFormat: 'BO3', isCompleted: false },
          ],
          groups: [],
          createdAt: now,
        },
        {
          id: 'demo-valo',
          name: 'Valorant Open Cup',
          gameId: 'valorant',
          format: 'group-stage',
          status: 'registration',
          startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          maxTeams: 8,
          matchFormat: 'BO3',
          checkinRequired: true,
          prizePool: '200 USD',
          teams: [
            { id: 'v1', name: 'Sentinels', players: Array(5).fill(null).map((_,i) => ({ username: `Sentinel${i+1}` })), accentColor: '#00C2FF' },
            { id: 'v2', name: 'Fnatic', players: Array(5).fill(null).map((_,i) => ({ username: `Fnatic${i+1}` })), accentColor: '#F0B429' },
            { id: 'v3', name: 'LOUD', players: Array(5).fill(null).map((_,i) => ({ username: `LOUD${i+1}` })), accentColor: '#FF3B3B' },
            { id: 'v4', name: 'PRX', players: Array(5).fill(null).map((_,i) => ({ username: `PRX${i+1}` })), accentColor: '#00C2FF' },
          ],
          matches: [],
          groups: [
            { id: 'g1', name: 'Group A', teamIds: ['v1', 'v2'] },
            { id: 'g2', name: 'Group B', teamIds: ['v3', 'v4'] },
          ],
          createdAt: now,
        },
      ];
    };

    const initialState: TournamentState = (() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {}
      return { tournaments: seedDemoTournaments() };
    })();

    function tournamentReducer(state: TournamentState, action: TournamentAction): TournamentState {
      switch (action.type) {
        case 'CREATE_TOURNAMENT': {
          return { ...state, tournaments: [...state.tournaments, action.payload] };
        }
        case 'UPDATE_TOURNAMENT': {
          return {
            ...state,
            tournaments: state.tournaments.map(t =>
              t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
            ),
          };
        }
        case 'REGISTER_TEAM': {
          return {
            ...state,
            tournaments: state.tournaments.map(t => {
              if (t.id !== action.payload.tournamentId) return t;
              if (t.teams.length >= t.maxTeams) return t;
              return { ...t, teams: [...t.teams, action.payload.team] };
            }),
          };
        }
        case 'REMOVE_TEAM': {
          return {
            ...state,
            tournaments: state.tournaments.map(t => {
              if (t.id !== action.payload.tournamentId) return t;
              return { ...t, teams: t.teams.filter(team => team.id !== action.payload.teamId) };
            }),
          };
        }
        case 'UPDATE_MATCH': {
          return {
            ...state,
            tournaments: state.tournaments.map(t => {
              if (t.id !== action.payload.tournamentId) return t;
              return {
                ...t,
                matches: t.matches.map(m =>
                  m.id === action.payload.matchId ? { ...m, ...action.payload.updates } : m
                ),
              };
            }),
          };
        }
        case 'START_TOURNAMENT': {
          return {
            ...state,
            tournaments: state.tournaments.map(t => {
              if (t.id !== action.payload.tournamentId) return t;
              // Generate bracket matches based on format and teams
              const teams = t.teams;
              let matches: Match[] = [];
              if (t.format === 'single-elimination') {
                // Generate first round
                const numTeams = teams.length;
                const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(numTeams)));
                const byes = powerOfTwo - numTeams;
                let currentRoundTeams = [...teams.map(t => t.id)];
                // Add null for byes
                for (let i = 0; i < byes; i++) {
                  currentRoundTeams.push(null as any);
                }
                // Create first round matches
                for (let i = 0; i < currentRoundTeams.length / 2; i++) {
                  const a = currentRoundTeams[i * 2];
                  const b = currentRoundTeams[i * 2 + 1];
                  matches.push({
                    id: `m-${Date.now()}-${i}`,
                    round: 1,
                    teamAId: a,
                    teamBId: b,
                    teamAScore: null,
                    teamBScore: null,
                    winnerId: null,
                    matchFormat: t.matchFormat,
                    isCompleted: false,
                    isBye: !a || !b,
                  });
                }
              }
              // For now, just set status
              return { ...t, status: 'in-progress', matches };
            }),
          };
        }
        default:
          return state;
      }
    }

    interface TournamentContextType {
      state: TournamentState;
      dispatch: React.Dispatch<TournamentAction>;
      getTournament: (id: string) => Tournament | undefined;
    }

    const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

    export function TournamentProvider({ children }: { children: React.ReactNode }) {
      const [state, dispatch] = useReducer(tournamentReducer, initialState);

      useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }, [state]);

      const getTournament = useCallback((id: string) => {
        return state.tournaments.find(t => t.id === id);
      }, [state.tournaments]);

      return (
        <TournamentContext.Provider value={{ state, dispatch, getTournament }}>
          {children}
        </TournamentContext.Provider>
      );
    }

    export function useTournament() {
      const ctx = useContext(TournamentContext);
      if (!ctx) throw new Error('useTournament must be used within TournamentProvider');
      return ctx;
    }

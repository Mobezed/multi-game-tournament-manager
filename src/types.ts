export type GameId = 'league-of-legends' | 'valorant' | 'cs2' | 'rocket-league' | 'fc25';

    export interface GameConfig {
      id: GameId;
      name: string;
      icon: string; // emoji or icon name
      teamSize: number;
      scoreType: 'maps' | 'maps+rounds' | 'games' | 'goals';
      formats: ('single-elimination' | 'double-elimination' | 'group-stage')[];
      maxTeamsOptions: number[];
    }

    export const GAMES: GameConfig[] = [
      {
        id: 'league-of-legends',
        name: 'League of Legends',
        icon: '🏆',
        teamSize: 5,
        scoreType: 'maps',
        formats: ['single-elimination', 'double-elimination'],
        maxTeamsOptions: [4, 8, 16],
      },
      {
        id: 'valorant',
        name: 'Valorant',
        icon: '🔫',
        teamSize: 5,
        scoreType: 'maps',
        formats: ['single-elimination', 'double-elimination'],
        maxTeamsOptions: [4, 8],
      },
      {
        id: 'cs2',
        name: 'CS2',
        icon: '🎯',
        teamSize: 5,
        scoreType: 'maps+rounds',
        formats: ['single-elimination', 'double-elimination'],
        maxTeamsOptions: [4, 8, 16],
      },
      {
        id: 'rocket-league',
        name: 'Rocket League',
        icon: '⚽',
        teamSize: 3,
        scoreType: 'games',
        formats: ['single-elimination', 'double-elimination', 'group-stage'],
        maxTeamsOptions: [4, 8],
      },
      {
        id: 'fc25',
        name: 'FC 25',
        icon: '⚡',
        teamSize: 1,
        scoreType: 'goals',
        formats: ['single-elimination'],
        maxTeamsOptions: [4, 8, 16],
      },
    ];

    export type TournamentFormat = 'single-elimination' | 'double-elimination' | 'group-stage';
    export type TournamentStatus = 'registration' | 'in-progress' | 'finished';
    export type MatchFormat = 'BO1' | 'BO3' | 'BO5';

    export interface Team {
      id: string;
      name: string;
      players: Player[];
      accentColor: string;
    }

    export interface Player {
      username: string;
      role?: string;
    }

    export interface Match {
      id: string;
      round: number;
      bracket?: 'winners' | 'losers' | 'grand-final';
      groupId?: string;
      teamAId: string | null;
      teamBId: string | null;
      teamAScore: number | null;
      teamBScore: number | null;
      winnerId: string | null;
      matchFormat: MatchFormat;
      isCompleted: boolean;
      isBye?: boolean;
    }

    export interface Group {
      id: string;
      name: string;
      teamIds: string[];
    }

    export interface Tournament {
      id: string;
      name: string;
      gameId: GameId;
      format: TournamentFormat;
      status: TournamentStatus;
      startDate: string;
      maxTeams: number;
      matchFormat: MatchFormat;
      checkinRequired: boolean;
      prizePool?: string;
      teams: Team[];
      matches: Match[];
      groups: Group[];
      createdAt: string;
    }

    export interface TournamentState {
      tournaments: Tournament[];
    }

    export type TournamentAction =
      | { type: 'CREATE_TOURNAMENT'; payload: Tournament }
      | { type: 'UPDATE_TOURNAMENT'; payload: { id: string; updates: Partial<Tournament> } }
      | { type: 'REGISTER_TEAM'; payload: { tournamentId: string; team: Team } }
      | { type: 'REMOVE_TEAM'; payload: { tournamentId: string; teamId: string } }
      | { type: 'UPDATE_MATCH'; payload: { tournamentId: string; matchId: string; updates: Partial<Match> } }
      | { type: 'START_TOURNAMENT'; payload: { tournamentId: string } };

import React, { useState, useMemo } from 'react'
    import { useParams, Link, useNavigate } from 'react-router-dom'
    import { ArrowLeft, Users, Trophy, Settings, Play, CheckCircle, X } from 'lucide-react'
    import { useTournament } from '../context/TournamentContext'
    import { GAMES, Match, MatchFormat } from '../types'

    export default function TournamentPage() {
      const { id } = useParams<{ id: string }>()
      const navigate = useNavigate()
      const { state, dispatch, getTournament } = useTournament()
      const tournament = getTournament(id || '')

      if (!tournament) {
        return (
          <div className="flex flex-col items-center justify-center py-20 text-game-muted">
            <X className="w-16 h-16 mb-4 opacity-30" />
            <h3 className="text-xl font-semibold text-white mb-2">Tournament not found</h3>
            <Link to="/" className="btn-primary mt-4">Go Home</Link>
          </div>
        )
      }

      const game = GAMES.find(g => g.id === tournament.gameId)
      const [modalOpen, setModalOpen] = useState(false)
      const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
      const [scoreA, setScoreA] = useState('')
      const [scoreB, setScoreB] = useState('')

      const handleStart = () => {
        dispatch({ type: 'START_TOURNAMENT', payload: { tournamentId: tournament.id } })
      }

      const handleScoreSubmit = () => {
        if (!selectedMatch) return
        const a = parseInt(scoreA)
        const b = parseInt(scoreB)
        if (isNaN(a) || isNaN(b)) return
        const winnerId = a > b ? selectedMatch.teamAId : b > a ? selectedMatch.teamBId : null
        dispatch({
          type: 'UPDATE_MATCH',
          payload: {
            tournamentId: tournament.id,
            matchId: selectedMatch.id,
            updates: { teamAScore: a, teamBScore: b, winnerId, isCompleted: true },
          },
        })
        setModalOpen(false)
        setScoreA('')
        setScoreB('')
      }

      const matchesByRound = useMemo(() => {
        const rounds: { [round: number]: Match[] } = {}
        tournament.matches.forEach(m => {
          if (!rounds[m.round]) rounds[m.round] = []
          rounds[m.round].push(m)
        })
        return rounds
      }, [tournament.matches])

      const teamName = (teamId: string | null) => {
        if (!teamId) return 'TBD'
        return tournament.teams.find(t => t.id === teamId)?.name || 'TBD'
      }

      return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="text-game-muted hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">{tournament.name}</h1>
                  <span className="text-2xl">{game?.icon}</span>
                </div>
                <p className="text-sm text-game-muted">
                  {game?.name} · {tournament.format === 'single-elimination' ? 'Single Elimination' : tournament.format === 'double-elimination' ? 'Double Elimination' : 'Group Stage'} · {tournament.matchFormat}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to={`/tournament/${tournament.id}/teams`} className="btn-secondary flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                Teams ({tournament.teams.length}/{tournament.maxTeams})
              </Link>
              <Link to={`/tournament/${tournament.id}/standings`} className="btn-secondary flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4" />
                Standings
              </Link>
              {tournament.status === 'registration' && tournament.teams.length >= 2 && (
                <button onClick={handleStart} className="btn-primary flex items-center gap-2 text-sm">
                  <Play className="w-4 h-4" />
                  Start Tournament
                </button>
              )}
            </div>
          </div>

          {/* Bracket / Matches View */}
          <div className="glass-card p-6">
            {tournament.status === 'registration' ? (
              <div className="text-center py-10 text-game-muted">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold text-white mb-2">Registration Open</h3>
                <p className="mb-2">Waiting for teams to register...</p>
                <p className="text-sm">{tournament.teams.length}/{tournament.maxTeams} teams registered</p>
              </div>
            ) : tournament.matches.length === 0 ? (
              <div className="text-center py-10 text-game-muted">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold text-white mb-2">No matches yet</h3>
                <p>Matches will appear here once the tournament starts.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(matchesByRound).map(([round, matches]) => (
                  <div key={round}>
                    <h3 className="text-lg font-heading font-semibold text-game-electric mb-4 flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Round {round}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {matches.map(m => (
                        <div
                          key={m.id}
                          className={`glass-card p-4 cursor-pointer hover:border-game-electric/50 transition-all ${
                            m.isCompleted ? 'border-green-500/30' : ''
                          }`}
                          onClick={() => {
                            if (tournament.status === 'in-progress' && !m.isCompleted && m.teamAId && m.teamBId) {
                              setSelectedMatch(m)
                              setScoreA('')
                              setScoreB('')
                              setModalOpen(true)
                            }
                          }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-game-muted uppercase tracking-wider">{m.matchFormat}</span>
                            {m.isCompleted ? (
                              <span className="text-xs text-green-400 font-semibold">Completed</span>
                            ) : m.isBye ? (
                              <span className="text-xs text-yellow-400 font-semibold">Bye</span>
                            ) : (
                              <span className="text-xs text-game-electric font-semibold">Upcoming</span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${m.winnerId === m.teamAId ? 'text-game-electric' : m.isCompleted ? 'text-game-muted' : 'text-white'}`}>
                                {teamName(m.teamAId)}
                              </span>
                              {m.teamAScore !== null && (
                                <span className="text-sm font-bold text-game-text">{m.teamAScore}</span>
                              )}
                            </div>
                            <div className="border-t border-game-border" />
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${m.winnerId === m.teamBId ? 'text-game-electric' : m.isCompleted ? 'text-game-muted' : 'text-white'}`}>
                                {teamName(m.teamBId)}
                              </span>
                              {m.teamBScore !== null && (
                                <span className="text-sm font-bold text-game-text">{m.teamBScore}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Score Modal */}
          {modalOpen && selectedMatch && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setModalOpen(false)}>
              <div className="glass-card p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-heading font-semibold text-white">Enter Score</h3>
                  <button onClick={() => setModalOpen(false)} className="text-game-muted hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="block text-sm text-game-muted mb-1">{teamName(selectedMatch.teamAId)}</label>
                      <input
                        type="number"
                        min="0"
                        value={scoreA}
                        onChange={e => setScoreA(e.target.value)}
                        className="w-full bg-game-surface border border-game-border rounded-lg px-4 py-2.5 text-game-text text-center focus:outline-none focus:border-game-electric/50"
                      />
                    </div>
                    <span className="text-game-muted text-lg font-bold">vs</span>
                    <div className="flex-1">
                      <label className="block text-sm text-game-muted mb-1">{teamName(selectedMatch.teamBId)}</label>
                      <input
                        type="number"
                        min="0"
                        value={scoreB}
                        onChange={e => setScoreB(e.target.value)}
                        className="w-full bg-game-surface border border-game-border rounded-lg px-4 py-2.5 text-game-text text-center focus:outline-none focus:border-game-electric/50"
                      />
                    </div>
                  </div>
                  <button onClick={handleScoreSubmit} className="btn-primary w-full">
                    <CheckCircle className="w-4 h-4" />
                    Submit Score
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

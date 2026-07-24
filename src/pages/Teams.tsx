import React, { useState } from 'react'
    import { useParams, Link, useNavigate } from 'react-router-dom'
    import { ArrowLeft, Plus, Users, User, Trash2, Shield, Gauge, X } from 'lucide-react'
    import { useTournament } from '../context/TournamentContext'
    import { GAMES, Team, Player } from '../types'

    export default function TeamsPage() {
      const { id } = useParams<{ id: string }>()
      const navigate = useNavigate()
      const { dispatch, getTournament } = useTournament()
      const tournament = getTournament(id || '')

      const [showForm, setShowForm] = useState(false)
      const [teamName, setTeamName] = useState('')
      const [players, setPlayers] = useState<{ username: string; role: string }[]>([])

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
      const teamSize = game?.teamSize || 5

      const initPlayers = () => {
        setPlayers(Array.from({ length: teamSize }, (_, i) => ({
          username: '',
          role: game?.id === 'league-of-legends' 
            ? ['Top', 'Jungle', 'Mid', 'ADC', 'Support'][i] || ''
            : game?.id === 'valorant'
            ? ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'Flex'][i] || ''
            : ''
        })))
        setShowForm(true)
      }

      const handleRegister = () => {
        if (!teamName || players.some(p => !p.username)) return
        const newTeam: Team = {
          id: `team-${Date.now()}`,
          name: teamName,
          players: players.map(p => ({ username: p.username, role: p.role || undefined })),
          accentColor: ['#00C2FF', '#F0B429', '#FF3B3B', '#10B981', '#8B5CF6', '#EC4899'][Math.floor(Math.random() * 6)],
        }
        dispatch({ type: 'REGISTER_TEAM', payload: { tournamentId: tournament.id, team: newTeam } })
        setShowForm(false)
        setTeamName('')
        setPlayers([])
      }

      const handleRemove = (teamId: string) => {
        dispatch({ type: 'REMOVE_TEAM', payload: { tournamentId: tournament.id, teamId } })
      }

      return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(`/tournament/${tournament.id}`)} className="text-game-muted hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Teams</h1>
                <p className="text-sm text-game-muted">{tournament.name} · {tournament.teams.length}/{tournament.maxTeams} registered</p>
              </div>
            </div>
            {tournament.status === 'registration' && tournament.teams.length < tournament.maxTeams && (
              <button onClick={initPlayers} className="btn-primary flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Register Team
              </button>
            )}
          </div>

          {/* Registration Form */}
          {showForm && (
            <div className="glass-card p-6 mb-6 border-game-electric/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-semibold text-white">Register New Team</h3>
                <button onClick={() => setShowForm(false)} className="text-game-muted hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-game-muted mb-1.5">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full bg-game-surface border border-game-border rounded-lg px-4 py-2.5 text-game-text placeholder-game-muted focus:outline-none focus:border-game-electric/50 transition-colors"
                />
              </div>
              <div className="space-y-3">
                {players.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-game-electric/10 flex items-center justify-center text-xs font-bold text-game-electric">
                      {idx + 1}
                    </div>
                    <input
                      type="text"
                      value={p.username}
                      onChange={e => {
                        const newPlayers = [...players]
                        newPlayers[idx] = { ...newPlayers[idx], username: e.target.value }
                        setPlayers(newPlayers)
                      }}
                      placeholder={`Player ${idx + 1} username`}
                      className="flex-1 bg-game-surface border border-game-border rounded-lg px-3 py-2 text-sm text-game-text placeholder-game-muted focus:outline-none focus:border-game-electric/50"
                    />
                    {p.role && (
                      <span className="text-xs text-game-muted w-20 text-right">{p.role}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleRegister}
                  disabled={!teamName || players.some(p => !p.username)}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Register Team
                </button>
              </div>
            </div>
          )}

          {/* Teams Grid */}
          {tournament.teams.length === 0 ? (
            <div className="glass-card p-10 text-center text-game-muted">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold text-white mb-2">No teams registered</h3>
              <p className="mb-4">Be the first to register your team!</p>
              {tournament.status === 'registration' && (
                <button onClick={initPlayers} className="btn-primary">Register Now</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournament.teams.map((team, idx) => (
                <div key={team.id} className="glass-card p-4 relative group">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                      style={{ backgroundColor: team.accentColor + '20', color: team.accentColor }}
                    >
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-semibold text-white truncate">{team.name}</h4>
                      <div className="mt-2 space-y-1">
                        {team.players.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-game-muted">
                            <User className="w-3 h-3" />
                            <span>{p.username}</span>
                            {p.role && <span className="text-game-electric">({p.role})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    {tournament.status === 'registration' && (
                      <button
                        onClick={() => handleRemove(team.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-game-red hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="absolute top-0 left-0 w-1 h-full rounded-l-lg" style={{ backgroundColor: team.accentColor }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

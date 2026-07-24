import React, { useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Medal, Users, X } from 'lucide-react'
import { useTournament } from '../context/TournamentContext'
import { GAMES } from '../types'

export default function StandingsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTournament } = useTournament()
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

  // Build standings from matches
  const standings = useMemo(() => {
    const teamStats: { [teamId: string]: { wins: number; losses: number; points: number } } = {}
    tournament.teams.forEach(t => {
      teamStats[t.id] = { wins: 0, losses: 0, points: 0 }
    })
    tournament.matches.forEach(m => {
      if (!m.isCompleted || !m.winnerId) return
      if (m.teamAId && teamStats[m.teamAId]) {
        if (m.winnerId === m.teamAId) {
          teamStats[m.teamAId].wins += 1
          teamStats[m.teamAId].points += 3
        } else {
          teamStats[m.teamAId].losses += 1
          teamStats[m.teamAId].points += 1
        }
      }
      if (m.teamBId && teamStats[m.teamBId]) {
        if (m.winnerId === m.teamBId) {
          teamStats[m.teamBId].wins += 1
          teamStats[m.teamBId].points += 3
        } else {
          teamStats[m.teamBId].losses += 1
          teamStats[m.teamBId].points += 1
        }
      }
    })
    // Sort by points, then wins
    return tournament.teams
      .map(t => ({
        team: t,
        ...teamStats[t.id],
      }))
      .sort((a, b) => b.points - a.points || b.wins - a.wins)
  }, [tournament.teams, tournament.matches])

  const rankIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="w-5 h-5 text-game-gold" />
    if (rank === 1) return <Medal className="w-5 h-5 text-gray-300" />
    if (rank === 2) return <Medal className="w-5 h-5 text-amber-600" />
    return <span className="text-sm text-game-muted">{rank + 1}</span>
  }

  // Group standings if applicable
  const hasGroups = tournament.groups.length > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/tournament/${tournament.id}`)} className="text-game-muted hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Standings</h1>
            <p className="text-sm text-game-muted">{tournament.name} · {game?.name}</p>
          </div>
        </div>
      </div>

      {hasGroups ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournament.groups.map(group => {
            const groupTeams = group.teamIds
              .map(id => tournament.teams.find(t => t.id === id))
              .filter(Boolean)
            const groupStats = groupTeams.map(t => {
              const stats = standings.find(s => s.team.id === t!.id)
              return { team: t, ...stats }
            }).sort((a, b) => (b?.points || 0) - (a?.points || 0))
            return (
              <div key={group.id} className="glass-card p-5">
                <h3 className="font-heading text-lg font-semibold text-game-electric mb-4">{group.name}</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-game-muted text-xs uppercase tracking-wider border-b border-game-border">
                      <th className="text-left py-2 pr-2">#</th>
                      <th className="text-left py-2 px-2">Team</th>
                      <th className="text-center py-2 px-2">W</th>
                      <th className="text-center py-2 px-2">L</th>
                      <th className="text-center py-2 px-2">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupStats.map((s, idx) => (
                      <tr key={s?.team?.id} className="border-b border-game-border/50">
                        <td className="py-3 pr-2">{rankIcon(idx)}</td>
                        <td className="py-3 px-2 font-medium text-white">{s?.team?.name || 'Unknown'}</td>
                        <td className="py-3 px-2 text-center text-green-400">{s?.wins || 0}</td>
                        <td className="py-3 px-2 text-center text-game-red">{s?.losses || 0}</td>
                        <td className="py-3 px-2 text-center font-bold text-game-gold">{s?.points || 0}</td>
                      </tr>
                    ))}
                    {groupStats.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-game-muted">No teams in group</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="glass-card p-5">
          {standings.length === 0 ? (
            <div className="text-center py-10 text-game-muted">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold text-white mb-2">No standings yet</h3>
              <p>Standings will appear once matches are played.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-game-muted text-xs uppercase tracking-wider border-b border-game-border">
                  <th className="text-left py-3 pr-2">#</th>
                  <th className="text-left py-3 px-2">Team</th>
                  <th className="text-center py-3 px-2">W</th>
                  <th className="text-center py-3 px-2">L</th>
                  <th className="text-center py-3 px-2">Win Rate</th>
                  <th className="text-center py-3 px-2">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, idx) => (
                  <tr key={s.team.id} className="border-b border-game-border/50 hover:bg-game-surface/50 transition-colors">
                    <td className="py-3 pr-2">{rankIcon(idx)}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.team.accentColor }} />
                        <span className="font-medium text-white">{s.team.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center text-green-400">{s.wins}</td>
                    <td className="py-3 px-2 text-center text-game-red">{s.losses}</td>
                    <td className="py-3 px-2 text-center text-game-muted">
                      {s.wins + s.losses > 0 ? `${Math.round((s.wins / (s.wins + s.losses)) * 100)}%` : '-'}
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-game-gold">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

import React, { useState, useMemo } from 'react'
    import { Link } from 'react-router-dom'
    import { Plus, Search, Filter, Calendar, Users, Gamepad2, Trophy } from 'lucide-react'
    import { useTournament } from '../context/TournamentContext'
    import { GAMES, TournamentStatus } from '../types'

    export default function Home() {
      const { state } = useTournament()
      const [search, setSearch] = useState('')
      const [statusFilter, setStatusFilter] = useState<TournamentStatus | 'all'>('all')
      const [gameFilter, setGameFilter] = useState<string>('all')

      const filteredTournaments = useMemo(() => {
        return state.tournaments.filter(t => {
          const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
          const matchStatus = statusFilter === 'all' || t.status === statusFilter
          const matchGame = gameFilter === 'all' || t.gameId === gameFilter
          return matchSearch && matchStatus && matchGame
        })
      }, [state.tournaments, search, statusFilter, gameFilter])

      const statusBadge = (status: TournamentStatus) => {
        switch (status) {
          case 'registration':
            return <span className="status-pill status-pill-upcoming"><Users className="w-3 h-3" /> Registration</span>
          case 'in-progress':
            return <span className="status-pill status-pill-live"><Trophy className="w-3 h-3" /> Live</span>
          case 'finished':
            return <span className="status-pill status-pill-finished"><Trophy className="w-3 h-3" /> Finished</span>
        }
      }

      const formatLabel = (format: string) => {
        const labels: Record<string, string> = { 'single-elimination': 'Single Elim', 'double-elimination': 'Double Elim', 'group-stage': 'Group Stage' }
        return labels[format] || format
      }

      return (
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Tournaments</h1>
              <p className="text-game-muted mt-1">Manage and view all your tournaments</p>
            </div>
            <Link to="/create" className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Tournament
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-game-muted" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-game-surface border border-game-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-game-text placeholder-game-muted focus:outline-none focus:border-game-electric/50 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-game-muted" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as TournamentStatus | 'all')}
                className="bg-game-surface border border-game-border rounded-lg px-3 py-2.5 text-sm text-game-muted focus:outline-none focus:border-game-electric/50 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="registration">Registration</option>
                <option value="in-progress">In Progress</option>
                <option value="finished">Finished</option>
              </select>
              <select
                value={gameFilter}
                onChange={e => setGameFilter(e.target.value)}
                className="bg-game-surface border border-game-border rounded-lg px-3 py-2.5 text-sm text-game-muted focus:outline-none focus:border-game-electric/50 appearance-none cursor-pointer"
              >
                <option value="all">All Games</option>
                {GAMES.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tournament Grid */}
          {filteredTournaments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-game-muted">
              <Gamepad2 className="w-16 h-16 mb-4 opacity-30" />
              <h3 className="text-xl font-semibold text-white mb-2">No tournaments found</h3>
              <p className="mb-6">Create your first tournament to get started</p>
              <Link to="/create" className="btn-primary">Create Tournament</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map(tournament => {
                const game = GAMES.find(g => g.id === tournament.gameId)
                return (
                  <Link
                    key={tournament.id}
                    to={`/tournament/${tournament.id}`}
                    className="glass-card glass-card-hover p-5 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-game-electric/10 flex items-center justify-center text-xl">
                          {game?.icon || '🎮'}
                        </div>
                        <div>
                          <h3 className="font-heading text-lg font-semibold text-white group-hover:text-game-electric transition-colors">
                            {tournament.name}
                          </h3>
                          <p className="text-xs text-game-muted">{game?.name}</p>
                        </div>
                      </div>
                      {statusBadge(tournament.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-game-muted">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {tournament.teams.length}/{tournament.maxTeams}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(tournament.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-game-surface border border-game-border text-game-muted">
                        {formatLabel(tournament.format)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-game-surface border border-game-border text-game-muted">
                        {tournament.matchFormat}
                      </span>
                      {tournament.prizePool && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-game-gold/20 border border-game-gold/30 text-game-gold">
                          Prize: {tournament.prizePool}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

import React, { useState } from 'react'
    import { useNavigate } from 'react-router-dom'
    import { ArrowLeft, ArrowRight, Check, Gamepad2, Users, Calendar, Trophy } from 'lucide-react'
    import { useTournament } from '../context/TournamentContext'
    import { GAMES, GameId, TournamentFormat, MatchFormat, Tournament } from '../types'

    export default function CreateTournament() {
      const navigate = useNavigate()
      const { dispatch } = useTournament()
      const [step, setStep] = useState(1)
      const [name, setName] = useState('')
      const [gameId, setGameId] = useState<GameId | ''>('')
      const [startDate, setStartDate] = useState('')
      const [maxTeams, setMaxTeams] = useState(8)
      const [format, setFormat] = useState<TournamentFormat>('single-elimination')
      const [matchFormat, setMatchFormat] = useState<MatchFormat>('BO3')
      const [checkinRequired, setCheckinRequired] = useState(false)
      const [prizePool, setPrizePool] = useState('')

      const selectedGame = GAMES.find(g => g.id === gameId)
      const gameFormats = selectedGame?.formats || []

      const handleCreate = () => {
        if (!name || !gameId || !startDate) return
        const newTournament: Tournament = {
          id: `t-${Date.now()}`,
          name,
          gameId: gameId as GameId,
          format,
          status: 'registration',
          startDate: new Date(startDate).toISOString(),
          maxTeams,
          matchFormat,
          checkinRequired,
          prizePool: prizePool || undefined,
          teams: [],
          matches: [],
          groups: [],
          createdAt: new Date().toISOString(),
        }
        dispatch({ type: 'CREATE_TOURNAMENT', payload: newTournament })
        navigate(`/tournament/${newTournament.id}`)
      }

      const canProceed = (s: number) => {
        if (s === 1) return name && gameId && startDate && maxTeams >= 2
        if (s === 2) return true
        if (s === 3) return true
        return false
      }

      return (
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Create Tournament</h1>
            <p className="text-game-muted mt-1">Set up a new tournament in three easy steps</p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${step >= s ? 'text-game-electric' : 'text-game-muted'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    step >= s ? 'border-game-electric bg-game-electric/10' : 'border-game-border'
                  }`}>
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">
                    {s === 1 ? 'Info' : s === 2 ? 'Format' : 'Rules'}
                  </span>
                </div>
                {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-game-electric' : 'bg-game-border'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-game-muted mb-1.5">Tournament Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Summer Championship"
                  className="w-full bg-game-surface border border-game-border rounded-lg px-4 py-2.5 text-game-text placeholder-game-muted focus:outline-none focus:border-game-electric/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-game-muted mb-1.5">Game</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {GAMES.map(g => (
                    <button
                      key={g.id}
                      onClick={() => { setGameId(g.id); setMaxTeams(g.maxTeamsOptions[0]); setFormat(g.formats[0]) }}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                        gameId === g.id
                          ? 'border-game-electric bg-game-electric/10 shadow-neon'
                          : 'border-game-border bg-game-surface hover:border-game-electric/30'
                      }`}
                    >
                      <span className="text-2xl">{g.icon}</span>
                      <span className="text-xs font-medium text-game-text">{g.name}</span>
                      <span className="text-xs text-game-muted">{g.teamSize}v{g.teamSize}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-game-muted mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-game-surface border border-game-border rounded-lg px-4 py-2.5 text-game-text focus:outline-none focus:border-game-electric/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-game-muted mb-1.5">Max Teams</label>
                  <select
                    value={maxTeams}
                    onChange={e => setMaxTeams(Number(e.target.value))}
                    className="w-full bg-game-surface border border-game-border rounded-lg px-4 py-2.5 text-game-text focus:outline-none focus:border-game-electric/50 appearance-none cursor-pointer"
                  >
                    {selectedGame?.maxTeamsOptions.map(n => (
                      <option key={n} value={n}>{n} teams</option>
                    )) || <option value={8}>8 teams</option>}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Format */}
          {step === 2 && (
            <div className="space-y-5">
              <label className="block text-sm font-medium text-game-muted mb-1.5">Tournament Format</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['single-elimination', 'double-elimination', 'group-stage'].map(f => {
                  const disabled = gameFormats.length > 0 && !gameFormats.includes(f as TournamentFormat)
                  return (
                    <button
                      key={f}
                      disabled={disabled}
                      onClick={() => setFormat(f as TournamentFormat)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                        disabled ? 'opacity-30 cursor-not-allowed' :
                        format === f
                          ? 'border-game-electric bg-game-electric/10 shadow-neon'
                          : 'border-game-border bg-game-surface hover:border-game-electric/30'
                      }`}
                    >
                      <Trophy className="w-6 h-6" />
                      <span className="text-sm font-medium">
                        {f === 'single-elimination' ? 'Single Elim' : f === 'double-elimination' ? 'Double Elim' : 'Group Stage'}
                      </span>
                      {disabled && <span className="text-xs text-game-muted">Not supported</span>}
                    </button>
                  )
                })}
              </div>
              {format === 'group-stage' && (
                <div className="glass-card p-4 text-sm text-game-muted">
                  Groups will be auto-generated after teams register. Top teams advance to playoffs.
                </div>
              )}
            </div>
          )}

          {/* Step 3: Rules */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-game-muted mb-1.5">Match Format</label>
                <div className="flex gap-3">
                  {['BO1', 'BO3', 'BO5'].map(mf => (
                    <button
                      key={mf}
                      onClick={() => setMatchFormat(mf as MatchFormat)}
                      className={`px-5 py-2.5 rounded-lg border transition-all ${
                        matchFormat === mf
                          ? 'border-game-electric bg-game-electric/10 shadow-neon text-game-electric'
                          : 'border-game-border bg-game-surface hover:border-game-electric/30 text-game-muted'
                      }`}
                    >
                      {mf}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="checkin"
                  checked={checkinRequired}
                  onChange={e => setCheckinRequired(e.target.checked)}
                  className="w-5 h-5 rounded border-game-border bg-game-surface accent-game-electric"
                />
                <label htmlFor="checkin" className="text-sm text-game-text">Require check-in before tournament start</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-game-muted mb-1.5">Prize Pool (optional)</label>
                <input
                  type="text"
                  value={prizePool}
                  onChange={e => setPrizePool(e.target.value)}
                  placeholder="e.g. 500 USD"
                  className="w-full bg-game-surface border border-game-border rounded-lg px-4 py-2.5 text-game-text placeholder-game-muted focus:outline-none focus:border-game-electric/50 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-game-border">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/')}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed(step)}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={!canProceed(3)}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Create Tournament
              </button>
            )}
          </div>
        </div>
      )
    }

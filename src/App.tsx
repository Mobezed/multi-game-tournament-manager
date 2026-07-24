import React from 'react'
    import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
    import { Home, Swords, Plus, Users, Trophy, Gamepad2 } from 'lucide-react'
    import HomePage from './pages/Home'
    import TournamentPage from './pages/Tournament'
    import CreateTournament from './pages/CreateTournament'
    import TeamsPage from './pages/Teams'
    import StandingsPage from './pages/Standings'

    function App() {
      const location = useLocation();
      const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/create', icon: Plus, label: 'Create' },
        { path: '/tournament', icon: Swords, label: 'Tournament', disabled: true }, // placeholder
      ];

      return (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-game-surface border-r border-game-border flex flex-col shrink-0">
            <div className="p-5 border-b border-game-border flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-game-electric" />
              <span className="font-heading text-xl font-bold tracking-wider">TOURNAMENT</span>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              <NavItem to="/" icon={Home} label="Home" currentPath={location.pathname} />
              <NavItem to="/create" icon={Plus} label="Create Tournament" currentPath={location.pathname} />
              {location.pathname.startsWith('/tournament') && (
                <NavItem to={location.pathname} icon={Swords} label="Current Tournament" currentPath={location.pathname} />
              )}
              <div className="pt-4">
                <p className="px-3 text-xs uppercase tracking-widest text-game-muted font-semibold">Games</p>
                <div className="mt-2 space-y-1">
                  <GameLabel label="League of Legends" color="bg-blue-500" />
                  <GameLabel label="Valorant" color="bg-red-500" />
                  <GameLabel label="CS2" color="bg-yellow-500" />
                  <GameLabel label="Rocket League" color="bg-cyan-500" />
                  <GameLabel label="FC 25" color="bg-green-500" />
                </div>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-6 bg-game-bg">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreateTournament />} />
              <Route path="/tournament/:id" element={<TournamentPage />} />
              <Route path="/tournament/:id/teams" element={<TeamsPage />} />
              <Route path="/tournament/:id/standings" element={<StandingsPage />} />
            </Routes>
          </main>
        </div>
      );
    }

    function NavItem({ to, icon: Icon, label, currentPath }: { to: string; icon: React.ElementType; label: string; currentPath: string }) {
      const isActive = currentPath === to || (to !== '/' && currentPath.startsWith(to));
      return (
        <NavLink
          to={to}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            isActive
              ? 'bg-game-electric/10 text-game-electric border border-game-electric/30 shadow-neon'
              : 'text-game-muted hover:text-game-text hover:bg-game-card'
          }`}
        >
          <Icon className="w-5 h-5" />
          <span className="font-medium text-sm">{label}</span>
          {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-game-electric" />}
        </NavLink>
      );
    }

    function GameLabel({ label, color }: { label: string; color: string }) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-game-muted">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <span>{label}</span>
        </div>
      );
    }

    export default App

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const LogoMark = () => (
  <svg width="32" height="32" viewBox="0 0 80 80" fill="none">
    <rect x="4" y="4" width="72" height="72" rx="10" stroke="url(#nl1)" strokeWidth="3" fill="none"/>
    <line x1="40" y1="4" x2="40" y2="76" stroke="url(#nl1)" strokeWidth="2.5"/>
    <line x1="4" y1="40" x2="76" y2="40" stroke="url(#nl1)" strokeWidth="2.5"/>
    <rect x="8" y="8" width="28" height="28" rx="4" fill="url(#ng1)" opacity="0.7"/>
    <rect x="44" y="44" width="28" height="28" rx="4" fill="url(#ng1)" opacity="0.7"/>
    <circle cx="40" cy="40" r="4" fill="url(#nl1)"/>
    <defs>
      <linearGradient id="nl1" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a5b4fc"/><stop offset="1" stopColor="#c084fc"/>
      </linearGradient>
      <linearGradient id="ng1" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#6366f1" stopOpacity="0.6"/>
        <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.1"/>
      </linearGradient>
    </defs>
  </svg>
)

const navLinks = [
  { to: '/factory',  label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6"
      style={{
        background: 'rgba(10,10,26,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/factory" className="flex items-center gap-3 group">
          <motion.div whileHover={{ rotate: 15 }} transition={{ type: 'spring', stiffness: 300 }}>
            <LogoMark />
          </motion.div>
          <div className="leading-tight">
            <span className="block text-sm font-black bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              DreamDecorators
            </span>
            <span className="block text-[10px] text-white/30 uppercase tracking-widest">
              Factory Suite
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ to, label }) => {
            const active = location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'text-white' : 'text-white/50 hover:text-white/80'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'rgba(99,102,241,0.2)',
                      border: '1px solid rgba(99,102,241,0.3)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative">{label}</span>
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <Link to="/projects/new" className="btn-primary text-xs py-2 px-4">
            + New Project
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 rounded-lg text-white/60 hover:text-white"
          onClick={() => setMenuOpen(o => !o)}
        >
          <span className="block w-5 h-0.5 bg-current mb-1 transition-all" />
          <span className="block w-5 h-0.5 bg-current mb-1 transition-all" />
          <span className="block w-5 h-0.5 bg-current transition-all" />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="sm:hidden overflow-hidden border-t border-white/5 pb-4"
          >
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="block px-4 py-3 text-sm text-white/70 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/projects/new"
              className="block mx-4 mt-2 btn-primary justify-center"
              onClick={() => setMenuOpen(false)}
            >
              + New Project
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

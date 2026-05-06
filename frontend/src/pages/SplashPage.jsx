import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Floating orb component ─────────────────────────────────────────────── */
const Orb = ({ style, delay = 0, color = '#6366f1' }) => (
  <motion.div
    className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
    style={style}
    animate={{
      y: [0, -40, 0],
      scale: [1, 1.15, 1],
      opacity: [0.15, 0.3, 0.15],
    }}
    transition={{ duration: 7 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
)

/* ── Window/door SVG logo mark ──────────────────────────────────────────── */
const LogoMark = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    {/* Outer frame */}
    <rect x="4" y="4" width="72" height="72" rx="10" stroke="url(#lg1)" strokeWidth="3" fill="none"/>
    {/* Center cross */}
    <line x1="40" y1="4" x2="40" y2="76" stroke="url(#lg1)" strokeWidth="2.5"/>
    <line x1="4" y1="40" x2="76" y2="40" stroke="url(#lg1)" strokeWidth="2.5"/>
    {/* Glass shine */}
    <rect x="8" y="8" width="28" height="28" rx="4" fill="url(#glass1)" opacity="0.6"/>
    <rect x="44" y="8" width="28" height="28" rx="4" fill="url(#glass2)" opacity="0.4"/>
    <rect x="8" y="44" width="28" height="28" rx="4" fill="url(#glass2)" opacity="0.4"/>
    <rect x="44" y="44" width="28" height="28" rx="4" fill="url(#glass1)" opacity="0.6"/>
    {/* Handle dot */}
    <circle cx="40" cy="40" r="4" fill="url(#lg1)"/>
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a5b4fc"/>
        <stop offset="1" stopColor="#c084fc"/>
      </linearGradient>
      <linearGradient id="glass1" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#6366f1" stopOpacity="0.5"/>
        <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.1"/>
      </linearGradient>
      <linearGradient id="glass2" x1="1" y1="0" x2="0" y2="1">
        <stop stopColor="#818cf8" stopOpacity="0.3"/>
        <stop offset="1" stopColor="#6366f1" stopOpacity="0.05"/>
      </linearGradient>
    </defs>
  </svg>
)

/* ── Particle dots ──────────────────────────────────────────────────────── */
const Particle = ({ x, y, delay }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-indigo-400/60"
    style={{ left: `${x}%`, top: `${y}%` }}
    animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
    transition={{ duration: 3, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
)

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 5,
}))

/* ── Letter-by-letter text animation ───────────────────────────────────── */
const AnimatedText = ({ text, className, stagger = 0.04, delay = 0 }) => (
  <span className={className} style={{ display: 'inline-block' }}>
    {text.split('').map((char, i) => (
      <motion.span
        key={i}
        style={{ display: 'inline-block', whiteSpace: 'pre' }}
        initial={{ opacity: 0, y: 30, rotateX: -90 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{
          duration: 0.5,
          delay: delay + i * stagger,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {char}
      </motion.span>
    ))}
  </span>
)

/* ── Tagline words ──────────────────────────────────────────────────────── */
const taglineWords = ['Crafting', 'Windows', '&', 'Doors', 'with', 'Precision']

/* ════════════════════════════════════════════════════════════════════════════
   MAIN SPLASH PAGE
════════════════════════════════════════════════════════════════════════════ */
export default function SplashPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('logo')   // logo → text → ready
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'),  900)
    const t2 = setTimeout(() => setPhase('ready'), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleEnter = () => {
    setExiting(true)
    setTimeout(() => navigate('/factory'), 700)
  }

  // Auto-navigate after 6 s
  useEffect(() => {
    const t = setTimeout(handleEnter, 6000)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="splash"
          className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #050510 0%, #0d0d2b 40%, #0a0a20 100%)',
          }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          {/* ── Background orbs ── */}
          <Orb style={{ width: 600, height: 600, background: '#6366f1', top: '-20%', left: '-15%' }} delay={0} />
          <Orb style={{ width: 500, height: 500, background: '#8b5cf6', bottom: '-15%', right: '-10%' }} delay={2} />
          <Orb style={{ width: 300, height: 300, background: '#3b82f6', top: '40%', left: '60%' }} delay={4} />

          {/* ── Grid overlay ── */}
          <div
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />

          {/* ── Particles ── */}
          {particles.map(p => <Particle key={p.id} {...p} />)}

          {/* ── Spinning ring ── */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full border border-indigo-500/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute w-[700px] h-[700px] rounded-full border border-purple-500/8"
            animate={{ rotate: -360 }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          />

          {/* ── Main glass card ── */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo mark with glow pulse */}
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6), transparent 70%)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Glass card behind logo */}
              <div
                className="relative w-28 h-28 rounded-3xl flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  boxShadow: '0 20px 60px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                <LogoMark size={72} />
              </div>
            </motion.div>

            {/* Company name */}
            <motion.div className="mb-2" style={{ perspective: '600px' }}>
              <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none">
                <AnimatedText
                  text="Dream"
                  className="bg-gradient-to-r from-indigo-300 via-purple-300 to-violet-300 bg-clip-text text-transparent"
                  delay={0.3}
                />
                <AnimatedText
                  text="Decorators"
                  className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent"
                  delay={0.8}
                  stagger={0.045}
                />
              </h1>
            </motion.div>

            {/* Divider line */}
            <motion.div
              className="h-px w-0 my-5"
              style={{ background: 'linear-gradient(90deg, transparent, #818cf8, #c084fc, transparent)' }}
              animate={phase !== 'logo' ? { width: 280 } : { width: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            />

            {/* Tagline */}
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 mb-10 h-8">
              {taglineWords.map((word, i) => (
                <motion.span
                  key={i}
                  className="text-lg sm:text-xl font-medium text-white/60"
                  initial={{ opacity: 0, y: 15 }}
                  animate={phase !== 'logo' ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
                >
                  {word}
                </motion.span>
              ))}
            </div>

            {/* Feature pills */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={phase === 'ready' ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {['BOQ Generation', 'Bar Optimisation', 'Quotation PDF', 'Project Management'].map((feat) => (
                <span
                  key={feat}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-200"
                  style={{
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.3)',
                  }}
                >
                  {feat}
                </span>
              ))}
            </motion.div>

            {/* CTA button */}
            <motion.button
              onClick={handleEnter}
              className="relative group overflow-hidden rounded-2xl px-10 py-4 text-base font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                boxShadow: '0 10px 40px rgba(99,102,241,0.5)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={phase === 'ready' ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(99,102,241,0.7)' }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              />
              <span className="relative flex items-center gap-3">
                Enter Factory
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>

            {/* Skip hint */}
            <motion.p
              className="mt-6 text-xs text-white/25"
              initial={{ opacity: 0 }}
              animate={phase === 'ready' ? { opacity: 1 } : {}}
              transition={{ delay: 1 }}
            >
              Auto-entering in a few seconds…
            </motion.p>
          </motion.div>

          {/* Bottom bar */}
          <motion.div
            className="absolute bottom-6 left-0 right-0 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3, duration: 0.6 }}
          >
            <p className="text-xs text-white/20 tracking-widest uppercase">
              Window & Door Fabrication Management System
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

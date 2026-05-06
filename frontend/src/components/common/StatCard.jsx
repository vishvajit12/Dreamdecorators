import { motion } from 'framer-motion'

export default function StatCard({ label, value, icon: Icon, color = '#6366f1', delay = 0 }) {
  return (
    <motion.div
      className="glass-card p-6 flex items-center gap-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}22`, border: `1px solid ${color}44` }}
      >
        {Icon && <Icon size={22} style={{ color }} />}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/50 mt-0.5">{label}</p>
      </div>
    </motion.div>
  )
}

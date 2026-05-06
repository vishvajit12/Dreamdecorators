import { motion } from 'framer-motion'

export default function LoadingSpinner({ text = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <motion.div
        className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-400"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-sm text-white/40">{text}</p>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper from '../components/common/PageWrapper'

export default function NotFoundPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-8xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4"
        >
          404
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-white/50 text-lg mb-8"
        >
          Page not found.
        </motion.p>
        <Link to="/factory" className="btn-primary">← Back to Factory</Link>
      </div>
    </PageWrapper>
  )
}

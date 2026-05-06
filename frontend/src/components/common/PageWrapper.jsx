import { motion } from 'framer-motion'
import Navbar from './Navbar'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export default function PageWrapper({ children, className = '' }) {
  return (
    <div className="page-bg min-h-screen">
      <Navbar />
      <motion.main
        className={`pt-20 pb-12 px-4 sm:px-6 max-w-7xl mx-auto ${className}`}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.main>
    </div>
  )
}

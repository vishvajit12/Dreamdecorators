import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FolderOpen, CheckCircle, Clock, Layers,
  TrendingUp, Plus, ArrowRight, Factory
} from 'lucide-react'

import PageWrapper  from '../components/common/PageWrapper'
import StatCard     from '../components/common/StatCard'
import StatusBadge  from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { fetchDashboard } from '../services/api'
import { formatDate, formatINR } from '../utils/helpers'

/* ── Animated hero banner ──────────────────────────────────────────────── */
function HeroBanner() {
  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl mb-8 p-8 sm:p-10"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 50%, rgba(168,85,247,0.1) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        backdropFilter: 'blur(20px)',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background shimmer */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
        }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
      />

      {/* Decorative window SVG, top-right */}
      <motion.div
        className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10"
        animate={{ rotate: [0, 5, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="160" height="160" viewBox="0 0 80 80" fill="none">
          <rect x="4" y="4" width="72" height="72" rx="8" stroke="white" strokeWidth="2" fill="none"/>
          <line x1="40" y1="4" x2="40" y2="76" stroke="white" strokeWidth="2"/>
          <line x1="4" y1="40" x2="76" y2="40" stroke="white" strokeWidth="2"/>
          <rect x="8" y="8" width="28" height="28" rx="3" fill="white" opacity="0.3"/>
          <rect x="44" y="44" width="28" height="28" rx="3" fill="white" opacity="0.3"/>
          <circle cx="40" cy="40" r="4" fill="white" opacity="0.8"/>
        </svg>
      </motion.div>

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Factory size={18} className="text-indigo-300" />
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">Factory Dashboard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
            DreamDecorators
          </span>
        </h1>
        <p className="text-white/50 text-sm max-w-lg">
          Manage your window &amp; door fabrication projects — from quotation to bar optimisation and BOQ generation.
        </p>
        <div className="flex gap-3 mt-6">
          <Link to="/projects/new" className="btn-primary">
            <Plus size={16} /> New Project
          </Link>
          <Link to="/projects" className="btn-secondary">
            All Projects <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Recent project row ────────────────────────────────────────────────── */
function RecentProjectRow({ project, index }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <td>
        <Link to={`/projects/${project.id}`} className="font-medium text-white hover:text-indigo-300 transition-colors">
          {project.project_name}
        </Link>
      </td>
      <td className="text-white/60">{project.customer_name}</td>
      <td><StatusBadge status={project.status} /></td>
      <td className="text-white/50 text-xs">{formatDate(project.project_date)}</td>
      <td className="text-white/60 text-center">{project.items_count ?? 0}</td>
      <td>
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 transition-colors font-medium"
        >
          View <ArrowRight size={12} />
        </Link>
      </td>
    </motion.tr>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   FACTORY PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function FactoryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 30_000,
  })

  const stats = data?.stats || {}
  const recent = data?.recent_projects || []

  const statCards = [
    { label: 'Total Projects',      value: stats.total_projects   ?? '—', icon: FolderOpen,  color: '#6366f1', delay: 0    },
    { label: 'Draft',               value: stats.draft_projects   ?? '—', icon: Clock,       color: '#fbbf24', delay: 0.07 },
    { label: 'Confirmed',           value: stats.confirmed_projects ?? '—', icon: CheckCircle, color: '#818cf8', delay: 0.14 },
    { label: 'Total Units (Items)', value: stats.total_items      ?? '—', icon: Layers,      color: '#34d399', delay: 0.21 },
    { label: 'In Production',       value: stats.in_production    ?? '—', icon: TrendingUp,  color: '#fb923c', delay: 0.28 },
    { label: 'Completed',           value: stats.completed_projects ?? '—', icon: CheckCircle, color: '#34d399', delay: 0.35 },
  ]

  return (
    <PageWrapper>
      <HeroBanner />

      {/* Stats grid */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Overview</h2>
        {isLoading ? (
          <LoadingSpinner text="Loading stats…" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map(s => <StatCard key={s.label} {...s} />)}
          </div>
        )}
      </section>

      {/* Recent projects */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Recent Projects</h2>
          <Link to="/projects" className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="glass-card overflow-hidden">
          {isLoading ? (
            <LoadingSpinner text="Loading projects…" />
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-sm">
              Failed to load — is the backend running?
            </div>
          ) : recent.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen size={40} className="mx-auto text-white/15 mb-3" />
              <p className="text-white/40 text-sm">No projects yet.</p>
              <Link to="/projects/new" className="btn-primary mt-4 mx-auto w-fit">
                <Plus size={15} /> Create first project
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-center">Items</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p, i) => (
                    <RecentProjectRow key={p.id} project={p} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Plus, FolderOpen, ArrowRight, Trash2, Edit2, Filter } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import PageWrapper    from '../components/common/PageWrapper'
import StatusBadge    from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { fetchProjects, deleteProject } from '../services/api'
import { formatDate } from '../utils/helpers'

const STATUS_OPTIONS = [
  { value: '',             label: 'All Statuses' },
  { value: 'draft',        label: 'Draft' },
  { value: 'quoted',       label: 'Quoted' },
  { value: 'confirmed',    label: 'Confirmed' },
  { value: 'in_production',label: 'In Production' },
  { value: 'completed',    label: 'Completed' },
]

function ProjectCard({ project, onDelete }) {
  return (
    <motion.div
      className="glass-card p-5 flex flex-col gap-4 hover:border-indigo-500/30 transition-colors"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      layout
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/projects/${project.id}`}
            className="font-semibold text-white hover:text-indigo-300 transition-colors block truncate"
          >
            {project.project_name}
          </Link>
          <p className="text-sm text-white/50 mt-0.5 truncate">{project.customer_name}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-white/30 mb-0.5">Date</p>
          <p className="text-white/70">{formatDate(project.project_date)}</p>
        </div>
        <div>
          <p className="text-white/30 mb-0.5">Phone</p>
          <p className="text-white/70">{project.customer_phone || '—'}</p>
        </div>
        <div>
          <p className="text-white/30 mb-0.5">Items</p>
          <p className="text-white/70">{project.items_count ?? 0} entries</p>
        </div>
        <div>
          <p className="text-white/30 mb-0.5">Units</p>
          <p className="text-white/70">{project.total_items ?? 0} pcs</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <Link to={`/projects/${project.id}`} className="btn-primary flex-1 justify-center py-2 text-xs">
          Open <ArrowRight size={12} />
        </Link>
        <Link to={`/projects/${project.id}/edit`} className="btn-secondary px-3 py-2">
          <Edit2 size={14} />
        </Link>
        <button
          className="btn-danger px-3 py-2"
          onClick={() => onDelete(project)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  )
}

export default function ProjectListPage() {
  const qc = useQueryClient()
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('')
  const [toDelete, setToDelete] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['projects', search, status],
    queryFn: () => fetchProjects({ search, status }),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => deleteProject(id),
    onSuccess: () => {
      toast.success('Project deleted')
      qc.invalidateQueries(['projects'])
      qc.invalidateQueries(['dashboard'])
      setToDelete(null)
    },
    onError: (e) => toast.error(e.message),
  })

  const projects = data?.results || data || []

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-white/40 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/projects/new" className="btn-primary">
          <Plus size={16} /> New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className="glass-input pl-10"
            placeholder="Search by project or customer name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative sm:w-48">
          <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <select
            className="glass-select pl-9"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingSpinner text="Loading projects…" />
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/40">No projects found.</p>
          <Link to="/projects/new" className="btn-primary mt-4 mx-auto w-fit">
            <Plus size={15} /> Create Project
          </Link>
        </div>
      ) : (
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          layout
        >
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} onDelete={setToDelete} />
          ))}
        </motion.div>
      )}

      {/* Delete modal */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setToDelete(null)}
          />
          <motion.div
            className="glass-card-dark relative z-10 p-8 max-w-sm w-full text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Trash2 size={32} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Delete Project?</h3>
            <p className="text-sm text-white/50 mb-6">
              "{toDelete.project_name}" will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setToDelete(null)}>Cancel</button>
              <button
                className="btn-danger flex-1"
                onClick={() => deleteMut.mutate(toDelete.id)}
                disabled={deleteMut.isPending}
              >
                {deleteMut.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  )
}

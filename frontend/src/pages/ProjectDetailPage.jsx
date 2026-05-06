import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ChevronLeft, Edit2, Trash2, User, Phone,
  Mail, MapPin, Calendar, Percent, ChevronDown
} from 'lucide-react'

import PageWrapper      from '../components/common/PageWrapper'
import StatusBadge      from '../components/common/StatusBadge'
import LoadingSpinner   from '../components/common/LoadingSpinner'
import ItemsTable       from '../components/items/ItemsTable'
import BOQPanel         from '../components/boq/BOQPanel'
import ReportDownloads  from '../components/projects/ReportDownloads'
import { fetchProject, deleteProject, updateProjectStatus } from '../services/api'
import { formatDate } from '../utils/helpers'

const STATUS_OPTIONS = [
  { value: 'draft',         label: 'Draft' },
  { value: 'quoted',        label: 'Quoted' },
  { value: 'confirmed',     label: 'Confirmed' },
  { value: 'in_production', label: 'In Production' },
  { value: 'completed',     label: 'Completed' },
]

/* ── Info chip ───────────────────────────────────────────────────────────── */
function InfoChip({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon size={14} className="text-white/30 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-white/70 leading-snug">{value}</p>
      </div>
    </div>
  )
}

/* ── Status dropdown ─────────────────────────────────────────────────────── */
function StatusDropdown({ projectId, current }) {
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()

  const mut = useMutation({
    mutationFn: (s) => updateProjectStatus(projectId, s),
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries(['project', String(projectId)])
      qc.invalidateQueries(['projects'])
      setOpen(false)
    },
    onError: e => toast.error(e.message),
  })

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-colors"
        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        onClick={() => setOpen(o => !o)}
      >
        <StatusBadge status={current} />
        <ChevronDown size={13} className="text-white/40" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <motion.div
            className="absolute top-full mt-2 left-0 z-20 rounded-xl overflow-hidden py-1 min-w-40"
            style={{
              background: 'rgba(14,14,35,0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          >
            {STATUS_OPTIONS.map(o => (
              <button
                key={o.value}
                className="w-full text-left px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                onClick={() => mut.mutate(o.value)}
                disabled={o.value === current}
              >
                <StatusBadge status={o.value} />
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   PROJECT DETAIL PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function ProjectDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const qc       = useQueryClient()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id),
  })

  const delMut = useMutation({
    mutationFn: () => deleteProject(id),
    onSuccess: () => {
      toast.success('Project deleted')
      qc.invalidateQueries(['projects'])
      qc.invalidateQueries(['dashboard'])
      navigate('/projects')
    },
    onError: e => toast.error(e.message),
  })

  if (isLoading) return <PageWrapper><LoadingSpinner text="Loading project…" /></PageWrapper>
  if (error || !project) return (
    <PageWrapper>
      <p className="text-red-400 text-center py-20">Project not found or server error.</p>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      {/* Breadcrumb */}
      <div className="mb-5">
        <Link to="/projects" className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 mb-4 transition-colors">
          <ChevronLeft size={14} /> All Projects
        </Link>

        {/* Title row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{project.project_name}</h1>
            <p className="text-sm text-white/50 mt-1">{project.customer_name}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <StatusDropdown projectId={id} current={project.status} />
            <Link to={`/projects/${id}/edit`} className="btn-secondary text-xs py-2 px-4">
              <Edit2 size={13} /> Edit
            </Link>
            <button className="btn-danger text-xs py-2 px-4" onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — project info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Customer info card */}
          <motion.div
            className="glass-card p-5 space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Customer Info</h3>
            <InfoChip icon={User}     label="Customer"  value={project.customer_name} />
            <InfoChip icon={Phone}    label="Phone"     value={project.customer_phone} />
            <InfoChip icon={Mail}     label="Email"     value={project.customer_email} />
            <InfoChip icon={MapPin}   label="Address"   value={project.customer_address} />
            <InfoChip icon={MapPin}   label="Site"      value={project.site_address} />
            <InfoChip icon={Calendar} label="Date"      value={formatDate(project.project_date)} />
          </motion.div>

          {/* Financials */}
          <motion.div
            className="glass-card p-5 space-y-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Financials</h3>
            <div className="flex justify-between text-sm">
              <span className="text-white/50 flex items-center gap-1"><Percent size={12} /> Discount</span>
              <span className="text-white/80 font-medium">{project.discount_percent}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50 flex items-center gap-1"><Percent size={12} /> GST</span>
              <span className="text-white/80 font-medium">{project.gst_percent}%</span>
            </div>
          </motion.div>

          {/* Notes */}
          {project.notes && (
            <motion.div
              className="glass-card p-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Notes</h3>
              <p className="text-sm text-white/60 leading-relaxed">{project.notes}</p>
            </motion.div>
          )}

          {/* Report downloads */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
          >
            <ReportDownloads projectId={id} />
          </motion.div>
        </div>

        {/* Right column — items + BOQ */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ItemsTable items={project.items || []} projectId={id} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <BOQPanel projectId={id} />
          </motion.div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setShowDeleteModal(false)}
          />
          <motion.div
            className="relative z-10 glass-card-dark p-8 max-w-sm w-full text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Trash2 size={32} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Delete Project?</h3>
            <p className="text-sm text-white/50 mb-6">
              "{project.project_name}" and all its items will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button
                className="btn-danger flex-1"
                onClick={() => delMut.mutate()}
                disabled={delMut.isPending}
              >
                {delMut.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </PageWrapper>
  )
}

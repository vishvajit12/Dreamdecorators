import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { fetchBOQPreview } from '../../services/api'
import { formatINR } from '../../utils/helpers'
import LoadingSpinner from '../common/LoadingSpinner'

const TABS = ['Profiles', 'Hardware', 'Glass', 'Bar Optimisation', 'Summary']

function TableWrap({ children, cols }) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <table className="glass-table min-w-full">{children}</table>
    </div>
  )
}

function ProfilesTab({ data }) {
  if (!data?.length) return <Empty text="No profile data — add items first." />
  return (
    <TableWrap>
      <thead><tr>
        <th>Item</th><th>Description</th><th>Cut (mm)</th><th className="text-right">Qty</th>
        <th className="text-right">Total (mm)</th><th className="text-right">Amount (₹)</th>
      </tr></thead>
      <tbody>
        {data.map((r, i) => (
          <tr key={i}>
            <td className="font-mono text-xs text-indigo-300">{r.item}</td>
            <td className="text-white/70">{r.description}</td>
            <td className="text-white/60">{r.cut_length}</td>
            <td className="text-right text-white/70">{r.qty}</td>
            <td className="text-right text-white/60">{r.total_length?.toFixed(0)}</td>
            <td className="text-right font-medium text-emerald-300">{formatINR(r.amount)}</td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  )
}

function HardwareTab({ data }) {
  if (!data?.length) return <Empty text="No hardware data." />
  return (
    <TableWrap>
      <thead><tr>
        <th>Item</th><th>Description</th><th className="text-right">Qty</th><th className="text-right">Amount (₹)</th>
      </tr></thead>
      <tbody>
        {data.map((r, i) => (
          <tr key={i}>
            <td className="font-mono text-xs text-amber-300">{r.item}</td>
            <td className="text-white/70">{r.description}</td>
            <td className="text-right text-white/70">{r.qty}</td>
            <td className="text-right font-medium text-emerald-300">{formatINR(r.amount)}</td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  )
}

function GlassTab({ data }) {
  if (!data?.length) return <Empty text="No glass data." />
  return (
    <TableWrap>
      <thead><tr>
        <th>Item</th><th>Description</th><th className="text-right">Qty</th>
        <th className="text-right">Area (sqft)</th><th className="text-right">Amount (₹)</th>
      </tr></thead>
      <tbody>
        {data.map((r, i) => (
          <tr key={i}>
            <td className="font-mono text-xs text-sky-300">{r.item}</td>
            <td className="text-white/70">{r.description}</td>
            <td className="text-right text-white/70">{r.qty}</td>
            <td className="text-right text-white/60">{r.area_sqft}</td>
            <td className="text-right font-medium text-emerald-300">{formatINR(r.amount)}</td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  )
}

function BarTab({ data }) {
  if (!data?.length) return <Empty text="No bar optimisation data." />
  return (
    <TableWrap>
      <thead><tr>
        <th>Profile</th><th className="text-right">Bars Used</th>
        <th className="text-right">Efficiency %</th><th className="text-right">Waste (mm)</th>
      </tr></thead>
      <tbody>
        {data.map((r, i) => (
          <tr key={i}>
            <td className="font-medium text-white/80">{r.profile}</td>
            <td className="text-right text-white/70">{r.bars}</td>
            <td className="text-right">
              <span className={`font-semibold ${r.efficiency >= 85 ? 'text-emerald-300' : r.efficiency >= 70 ? 'text-amber-300' : 'text-red-400'}`}>
                {r.efficiency}%
              </span>
            </td>
            <td className="text-right text-white/50">{r.waste_mm?.toFixed(0)}</td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  )
}

function SummaryTab({ s }) {
  if (!s) return <Empty text="No summary yet." />
  const rows = [
    { label: 'Profiles',   val: s.profiles,  color: '#818cf8' },
    { label: 'Hardware',   val: s.hardware,  color: '#fbbf24' },
    { label: 'Glass',      val: s.glass,     color: '#38bdf8' },
    { label: 'Labour',     val: s.labour,    color: '#a78bfa' },
    { label: 'Discount',   val: -s.discount, color: '#f87171' },
    { label: 'GST',        val: s.gst,       color: '#fb923c' },
  ]
  return (
    <div className="space-y-3">
      {rows.map(r => (
        <div key={r.label} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
            <span className="text-sm text-white/70">{r.label}</span>
          </div>
          <span className="font-semibold text-sm" style={{ color: r.color }}>{formatINR(Math.abs(r.val))}</span>
        </div>
      ))}
      <div
        className="flex items-center justify-between px-5 py-4 rounded-2xl mt-2"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))', border: '1px solid rgba(99,102,241,0.3)' }}
      >
        <span className="font-bold text-white">Grand Total (incl. GST)</span>
        <span className="text-xl font-black text-white">{formatINR(s.grand_total)}</span>
      </div>
    </div>
  )
}

function Empty({ text }) {
  return <p className="text-center text-white/30 text-sm py-10">{text}</p>
}

export default function BOQPanel({ projectId }) {
  const [tab, setTab] = useState(0)

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['boq', String(projectId)],
    queryFn: () => fetchBOQPreview(projectId),
    enabled: !!projectId,
    staleTime: 60_000,
  })

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <h3 className="font-semibold text-white text-sm">Live BOQ Preview</h3>
        <button
          onClick={() => refetch()}
          className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors"
          title="Refresh BOQ"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-white/8 px-2">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`relative px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
              tab === i ? 'text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab === i && (
              <motion.div
                layoutId="boq-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        {isLoading ? (
          <LoadingSpinner text="Calculating BOQ…" />
        ) : error ? (
          <div className="flex items-center gap-2 text-amber-400 text-sm py-6 justify-center">
            <AlertTriangle size={16} />
            {error.message || 'Failed to load BOQ. Add items and try again.'}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 0 && <ProfilesTab  data={data?.profiles} />}
              {tab === 1 && <HardwareTab  data={data?.hardware} />}
              {tab === 2 && <GlassTab     data={data?.glass}    />}
              {tab === 3 && <BarTab       data={data?.bar_summary} />}
              {tab === 4 && <SummaryTab   s={data?.summary}    />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

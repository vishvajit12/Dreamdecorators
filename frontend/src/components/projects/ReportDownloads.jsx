import { motion } from 'framer-motion'
import { FileText, Table, Download } from 'lucide-react'
import { reportUrls } from '../../services/api'

const REPORTS = [
  { key: 'quotationPDF',  label: 'Quotation',          sub: 'Customer-facing PDF',      icon: FileText, color: '#6366f1' },
  { key: 'boqPDF',        label: 'Material BOQ',        sub: 'Bill of Quantities PDF',   icon: FileText, color: '#8b5cf6' },
  { key: 'barOptPDF',     label: 'Bar Optimisation',    sub: 'Cutting plan PDF',         icon: FileText, color: '#a855f7' },
  { key: 'boqExcel',      label: 'BOQ Excel',           sub: 'Spreadsheet format',       icon: Table,    color: '#10b981' },
  { key: 'barOptExcel',   label: 'Bar Opt. Excel',      sub: 'Cutting plan spreadsheet', icon: Table,    color: '#059669' },
]

export default function ReportDownloads({ projectId }) {
  const urls = reportUrls(projectId)

  return (
    <div className="glass-card p-5">
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
        Download Reports
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {REPORTS.map((r, i) => (
          <motion.a
            key={r.key}
            href={urls[r.key]}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl transition-all group"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${r.color}22` }}
            >
              <r.icon size={16} style={{ color: r.color }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white/80 truncate">{r.label}</p>
              <p className="text-[10px] text-white/35">{r.sub}</p>
            </div>
            <Download size={13} className="text-white/20 group-hover:text-white/60 transition-colors flex-shrink-0" />
          </motion.a>
        ))}
      </div>
    </div>
  )
}

// ── Currency ─────────────────────────────────────────────────────────────────
export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)

// ── Status helpers ────────────────────────────────────────────────────────────
export const STATUS_META = {
  draft:         { label: 'Draft',         cls: 'badge-draft',      color: '#94a3b8' },
  quoted:        { label: 'Quoted',        cls: 'badge-quoted',     color: '#fbbf24' },
  confirmed:     { label: 'Confirmed',     cls: 'badge-confirmed',  color: '#818cf8' },
  in_production: { label: 'In Production', cls: 'badge-production', color: '#fb923c' },
  completed:     { label: 'Completed',     cls: 'badge-completed',  color: '#34d399' },
}

export const getStatusMeta = (status) =>
  STATUS_META[status] || { label: status, cls: 'badge-draft', color: '#94a3b8' }

// ── Date ──────────────────────────────────────────────────────────────────────
export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// ── Clamp ─────────────────────────────────────────────────────────────────────
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

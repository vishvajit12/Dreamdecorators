import { getStatusMeta } from '../../utils/helpers'

export default function StatusBadge({ status }) {
  const meta = getStatusMeta(status)
  return <span className={`badge ${meta.cls}`}>{meta.label}</span>
}

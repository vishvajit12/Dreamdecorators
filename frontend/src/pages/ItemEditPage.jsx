import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import PageWrapper    from '../components/common/PageWrapper'
import AddItemForm    from '../components/items/AddItemForm'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { fetchProject } from '../services/api'

// This page is used as a direct route for editing an item — wraps the modal form
// but renders it always-open. The editItem is found from the project's items list.
export default function ItemEditPage() {
  const { id } = useParams()   // item id
  const navigate = useNavigate()

  // We need to find the project of this item — this route is only reached from
  // project detail, so we rely on URL state or search params.
  // In this app the edit button uses the AddItemForm modal inline,
  // so this page acts as a fallback. Simply navigate back.
  return (
    <PageWrapper>
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 mb-4">
        <ChevronLeft size={14} /> Home
      </Link>
      <p className="text-white/50 text-sm">
        Item editing is done inline on the project detail page.{' '}
        <Link to="/projects" className="text-indigo-300 underline">Go to Projects</Link>.
      </p>
    </PageWrapper>
  )
}

import { useParams, Link } from 'react-router-dom'
import { useQuery }         from '@tanstack/react-query'
import { ChevronLeft }      from 'lucide-react'
import PageWrapper          from '../components/common/PageWrapper'
import ProjectForm          from '../components/projects/ProjectForm'
import LoadingSpinner       from '../components/common/LoadingSpinner'
import { fetchProject }     from '../services/api'

export default function ProjectEditPage() {
  const { id } = useParams()
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id),
  })

  return (
    <PageWrapper>
      <div className="mb-6">
        <Link to={`/projects/${id}`} className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 mb-3 transition-colors">
          <ChevronLeft size={14} /> Back to Project
        </Link>
        <h1 className="text-2xl font-bold text-white">Edit Project</h1>
        {project && (
          <p className="text-sm text-white/40 mt-1">{project.project_name} — {project.customer_name}</p>
        )}
      </div>

      <div className="max-w-3xl">
        {isLoading ? (
          <LoadingSpinner text="Loading project…" />
        ) : project ? (
          <ProjectForm initial={project} projectId={id} />
        ) : (
          <p className="text-red-400">Project not found.</p>
        )}
      </div>
    </PageWrapper>
  )
}

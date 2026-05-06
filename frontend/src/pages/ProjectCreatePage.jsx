import PageWrapper  from '../components/common/PageWrapper'
import ProjectForm  from '../components/projects/ProjectForm'
import { Link }     from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function ProjectCreatePage() {
  return (
    <PageWrapper>
      <div className="mb-6">
        <Link to="/projects" className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 mb-3 transition-colors">
          <ChevronLeft size={14} /> Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-white">New Project</h1>
        <p className="text-sm text-white/40 mt-1">Fill in the details to create a new fabrication project.</p>
      </div>
      <div className="max-w-3xl">
        <ProjectForm />
      </div>
    </PageWrapper>
  )
}

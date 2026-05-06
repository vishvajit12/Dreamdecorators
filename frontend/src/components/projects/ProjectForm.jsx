import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Save, X } from 'lucide-react'
import { createProject, updateProject } from '../../services/api'

const FIELD_GROUPS = [
  {
    title: 'Project Info',
    fields: [
      { name: 'project_name',   label: 'Project Name',   type: 'text',   placeholder: 'e.g. Sharma Residence', required: true, col: 2 },
      { name: 'status',         label: 'Status',          type: 'select', col: 1,
        options: [
          { value: 'draft',         label: 'Draft' },
          { value: 'quoted',        label: 'Quoted' },
          { value: 'confirmed',     label: 'Confirmed' },
          { value: 'in_production', label: 'In Production' },
          { value: 'completed',     label: 'Completed' },
        ]
      },
    ]
  },
  {
    title: 'Customer Details',
    fields: [
      { name: 'customer_name',    label: 'Customer Name',    type: 'text',     placeholder: 'Full name',          required: true, col: 2 },
      { name: 'customer_phone',   label: 'Phone',            type: 'text',     placeholder: '+91 XXXXX XXXXX',    col: 1 },
      { name: 'customer_email',   label: 'Email',            type: 'email',    placeholder: 'customer@email.com', col: 1 },
      { name: 'customer_address', label: 'Customer Address', type: 'textarea', placeholder: 'Billing address',    col: 2 },
      { name: 'site_address',     label: 'Site Address',     type: 'textarea', placeholder: 'Installation site',  col: 2 },
    ]
  },
  {
    title: 'Financials',
    fields: [
      { name: 'discount_percent', label: 'Discount %',  type: 'number', placeholder: '0', col: 1 },
      { name: 'gst_percent',      label: 'GST %',       type: 'number', placeholder: '18', col: 1 },
      { name: 'notes',            label: 'Notes',       type: 'textarea', placeholder: 'Any additional notes…', col: 2 },
    ]
  }
]

const defaultValues = {
  project_name: '', customer_name: '', customer_address: '',
  customer_phone: '', customer_email: '', site_address: '',
  status: 'draft', notes: '', discount_percent: 0, gst_percent: 18,
}

export default function ProjectForm({ initial = {}, projectId = null }) {
  const navigate   = useNavigate()
  const qc         = useQueryClient()
  const isEdit     = !!projectId
  const [form, setForm] = useState({ ...defaultValues, ...initial })

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateProject(projectId, data) : createProject(data),
    onSuccess: (project) => {
      toast.success(isEdit ? 'Project updated!' : 'Project created!')
      qc.invalidateQueries(['projects'])
      qc.invalidateQueries(['dashboard'])
      navigate(`/projects/${project.id ?? projectId}`)
    },
    onError: (e) => toast.error(e.message),
  })

  const set = (name, value) => setForm(f => ({ ...f, [name]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {FIELD_GROUPS.map(group => (
        <div key={group.title} className="glass-card p-6">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">
            {group.title}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {group.fields.map(field => (
              <div key={field.name} className={field.col === 2 ? 'col-span-2' : 'col-span-2 sm:col-span-1'}>
                <label className="block text-xs font-medium text-white/60 mb-1.5">
                  {field.label}{field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="glass-input resize-none"
                    rows={2}
                    placeholder={field.placeholder}
                    value={form[field.name] || ''}
                    onChange={e => set(field.name, e.target.value)}
                  />
                ) : field.type === 'select' ? (
                  <select
                    className="glass-select"
                    value={form[field.name] || ''}
                    onChange={e => set(field.name, e.target.value)}
                  >
                    {field.options.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    className="glass-input"
                    placeholder={field.placeholder}
                    required={field.required}
                    value={form[field.name] ?? ''}
                    onChange={e => set(field.name, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button
          type="submit"
          className="btn-primary"
          disabled={mutation.isPending}
        >
          <Save size={15} />
          {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate(-1)}
        >
          <X size={15} /> Cancel
        </button>
      </div>
    </motion.form>
  )
}

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// ── Interceptors ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.detail
      || err.response?.data?.error
      || err.message
      || 'Network error'
    return Promise.reject(new Error(msg))
  }
)

// ── Dashboard ──────────────────────────────────────────────────────────────
export const fetchDashboard = () =>
  api.get('/dashboard/').then(r => r.data)

// ── Reference Data ──────────────────────────────────────────────────────────
export const fetchTypologies  = () => api.get('/typologies/').then(r => r.data.results || r.data)
export const fetchGlassTypes  = () => api.get('/glass-types/').then(r => r.data.results || r.data)
export const fetchFinishTypes = () => api.get('/finish-types/').then(r => r.data.results || r.data)
export const fetchProfiles    = () => api.get('/profiles/').then(r => r.data.results || r.data)
export const fetchHardware    = () => api.get('/hardware/').then(r => r.data.results || r.data)

// ── Projects ────────────────────────────────────────────────────────────────
export const fetchProjects = (params = {}) =>
  api.get('/projects/', { params }).then(r => r.data)

export const fetchProject = (id) =>
  api.get(`/projects/${id}/`).then(r => r.data)

export const createProject = (data) =>
  api.post('/projects/', data).then(r => r.data)

export const updateProject = (id, data) =>
  api.put(`/projects/${id}/`, data).then(r => r.data)

export const patchProject = (id, data) =>
  api.patch(`/projects/${id}/`, data).then(r => r.data)

export const deleteProject = (id) =>
  api.delete(`/projects/${id}/`)

export const updateProjectStatus = (id, status) =>
  api.patch(`/projects/${id}/status/`, { status }).then(r => r.data)

// ── BOQ Preview ─────────────────────────────────────────────────────────────
export const fetchBOQPreview = (id) =>
  api.get(`/projects/${id}/boq-preview/`).then(r => r.data)

// ── Items ────────────────────────────────────────────────────────────────────
export const fetchItems = (projectId) =>
  api.get(`/projects/${projectId}/items/`).then(r => r.data.results || r.data)

export const createItem = (projectId, data) =>
  api.post(`/projects/${projectId}/items/`, data).then(r => r.data)

export const updateItem = (projectId, itemId, data) =>
  api.put(`/projects/${projectId}/items/${itemId}/`, data).then(r => r.data)

export const deleteItem = (projectId, itemId) =>
  api.delete(`/projects/${projectId}/items/${itemId}/`)

// ── Report URLs (direct links) ───────────────────────────────────────────────
const BASE = api.defaults.baseURL
export const reportUrls = (id) => ({
  quotationPDF:    `${BASE}/projects/${id}/reports/quotation.pdf`,
  boqPDF:         `${BASE}/projects/${id}/reports/boq.pdf`,
  barOptPDF:      `${BASE}/projects/${id}/reports/bar-optimisation.pdf`,
  boqExcel:       `${BASE}/projects/${id}/reports/boq.xlsx`,
  barOptExcel:    `${BASE}/projects/${id}/reports/bar-optimisation.xlsx`,
})

export default api

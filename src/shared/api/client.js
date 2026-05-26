const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:4000'
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || 'smart-admin-demo'

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.admin ? { 'X-Admin-Token': ADMIN_TOKEN } : {}),
      ...(options.headers || {})
    }
  })

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload.error || 'Gagal memuat data API.')
  }

  return payload.data
}

export const api = {
  baseUrl: API_BASE_URL,
  getPublicTraffic: () => requestJson('/api/public/traffic'),
  getPublicRoutes: () => requestJson('/api/public/routes'),
  getPublicReports: () => requestJson('/api/public/reports'),
  createReport: (report) => requestJson('/api/public/reports', {
    method: 'POST',
    body: JSON.stringify(report)
  }),
  getAdminReports: () => requestJson('/api/admin/reports', { admin: true }),
  updateReportStatus: (id, status) => requestJson(`/api/admin/reports/${id}`, {
    admin: true,
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  getAdminTraffic: () => requestJson('/api/admin/traffic', { admin: true }),
  getAdminRoutes: () => requestJson('/api/admin/routes', { admin: true }),
  getAdminBuses: () => requestJson('/api/admin/buses', { admin: true }),
  getAdminStats: () => requestJson('/api/admin/stats', { admin: true })
}

export const createRealtimeSource = () => new EventSource(`${API_BASE_URL}/api/events`)

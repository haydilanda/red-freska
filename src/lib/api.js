const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('rf_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error de red' }))
    throw new Error(err.detail || `Error ${res.status}`)
  }

  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  localStorage.setItem('rf_token', data.access_token)
  return data
}

export async function register(empresa_nombre, email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ empresa_nombre, email, password }),
  })
}

export function logout() {
  localStorage.removeItem('rf_token')
}

// ── Marcas ────────────────────────────────────────────────────────────────────

export const getMarcas = () => request('/marcas/')
export const getMarca = (id) => request(`/marcas/${id}`)
export const updatePerfilMarca = (id, perfil) =>
  request(`/marcas/${id}/perfil`, {
    method: 'PATCH',
    body: JSON.stringify(perfil),
  })

export const updateVozMarca = (id, voz) =>
  request(`/marcas/${id}/voz`, {
    method: 'PATCH',
    body: JSON.stringify(voz),
  })
export const activarMarca = (id) =>
  request(`/marcas/${id}/activar`, { method: 'PATCH' })

// ── Tendencias ────────────────────────────────────────────────────────────────

export const getTendencias = (estado) =>
  request(`/tendencias/${estado ? `?estado=${estado}` : ''}`)

export const getTendencia = (id) => request(`/tendencias/${id}`)

export const cambiarEstadoTendencia = (id, estado) =>
  request(`/tendencias/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  })

export async function deleteTendencia(id) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/tendencias/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error al eliminar' }))
    throw new Error(err.detail || `Error ${res.status}`)
  }
}

export async function uploadCSV(file) {
  const token = getToken()
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE_URL}/tendencias/upload-csv`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error al subir CSV' }))
    throw new Error(err.detail)
  }
  return res.json()
}

export async function uploadXLSX(file) {
  const token = getToken()
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE_URL}/tendencias/upload-xlsx`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error al subir Excel' }))
    throw new Error(err.detail)
  }
  return res.json()
}

// ── Scores ────────────────────────────────────────────────────────────────────

export const getScores = (marcaId, tendenciaId) => {
  const params = new URLSearchParams()
  if (marcaId) params.append('marca_id', marcaId)
  if (tendenciaId) params.append('tendencia_id', tendenciaId)
  return request(`/scores/?${params.toString()}`)
}

export const getScore = (tendenciaId) => request(`/scores/${tendenciaId}`)

export const calcularScore = (marcaId, tendenciaId) =>
  request('/scores/calcular', {
    method: 'POST',
    body: JSON.stringify({ marca_id: marcaId, tendencia_id: tendenciaId }),
  })

export const scoringBatch = (marcaIds, tendenciaIds) =>
  request('/scores/batch', {
    method: 'POST',
    body: JSON.stringify({ marca_ids: marcaIds, tendencia_ids: tendenciaIds }),
  })

export const cancelarScoring = () =>
  request('/scores/batch/cancel', { method: 'POST' })

export const registrarFeedback = (scoreId, ejecutaron, resultado, metricas) =>
  request('/scores/feedback', {
    method: 'POST',
    body: JSON.stringify({ score_id: scoreId, ejecutaron, resultado, metricas }),
  })

export const iniciarDeteccion = () =>
  request('/deteccion/iniciar', { method: 'POST' })

export const estadoDeteccion = () =>
  request('/deteccion/estado')

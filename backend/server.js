import http from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  activeBuses as seedBuses,
  trafficLocations as seedTraffic,
  transitRoutes as seedRoutes,
  weeklyReports
} from '../src/shared/data/mobilityData.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, 'data')
const DB_FILE = path.join(DATA_DIR, 'smart-mobility-store.json')
const ENV_FILE = path.join(__dirname, '..', '.env')
const ROAD_NETWORK_FILE = path.join(__dirname, '..', 'public', 'data', 'balikpapan-road-network.geojson')
const TRANSIT_NETWORK_FILE = path.join(__dirname, '..', 'public', 'data', 'bacitra-route-network.geojson')

const loadEnvFile = () => {
  if (!existsSync(ENV_FILE)) {
    return
  }

  const lines = readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)

  lines.forEach((line) => {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      return
    }

    const [key, ...valueParts] = trimmed.split('=')

    if (!process.env[key]) {
      process.env[key] = valueParts.join('=').trim()
    }
  })
}

loadEnvFile()

const PORT = Number(process.env.PORT || 4000)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'smart-admin-demo'

const defaultReports = [
  {
    id: 1,
    type: 'congestion',
    location: 'MT Haryono Simpang Wika',
    description: 'Kemacetan parah di simpang utama, aliran kendaraan sangat lambat',
    priority: 'high',
    status: 'in-progress',
    time: '5 menit lalu',
    reporter: 'Budi S.',
    responses: 12,
    createdAt: '2026-05-24T08:10:00.000Z',
    updatedAt: '2026-05-24T08:15:00.000Z'
  },
  {
    id: 2,
    type: 'accident',
    location: 'Jl. Soekarno Hatta',
    description: 'Kecelakaan lalu lintas antara 2 kendaraan, petugas sudah dituju',
    priority: 'high',
    status: 'in-progress',
    time: '15 menit lalu',
    reporter: 'Ani R.',
    responses: 8,
    createdAt: '2026-05-24T08:00:00.000Z',
    updatedAt: '2026-05-24T08:02:00.000Z'
  },
  {
    id: 3,
    type: 'hazard',
    location: 'Jl. Ahmad Yani',
    description: 'Jalan berlubang yang berbahaya untuk pengguna motor',
    priority: 'medium',
    status: 'new',
    time: '1 jam lalu',
    reporter: 'Rudi K.',
    responses: 3,
    createdAt: '2026-05-24T07:20:00.000Z',
    updatedAt: '2026-05-24T07:20:00.000Z'
  },
  {
    id: 4,
    type: 'maintenance',
    location: 'Jl. Gatot Subroto',
    description: 'Traffic light mati, menyebabkan kemacetan dan risiko kecelakaan',
    priority: 'high',
    status: 'in-progress',
    time: '2 jam lalu',
    reporter: 'Siti N.',
    responses: 5,
    createdAt: '2026-05-24T06:50:00.000Z',
    updatedAt: '2026-05-24T06:55:00.000Z'
  },
  {
    id: 5,
    type: 'congestion',
    location: 'Grand City Area',
    description: 'Kemacetan parah karena keluarnya pelajar dari sekolah',
    priority: 'medium',
    status: 'resolved',
    time: '3 jam lalu',
    reporter: 'Ahmad M.',
    responses: 2,
    createdAt: '2026-05-24T05:50:00.000Z',
    updatedAt: '2026-05-24T06:20:00.000Z'
  }
]

let store = {
  reports: defaultReports,
  traffic: structuredClone(seedTraffic),
  routes: structuredClone(seedRoutes),
  buses: structuredClone(seedBuses)
}

let roadNetwork = {
  type: 'FeatureCollection',
  name: 'Jaringan Jalan Balikpapan',
  source: ROAD_NETWORK_FILE,
  features: []
}

let transitNetwork = {
  type: 'FeatureCollection',
  name: 'Rute Bacitra Balikpapan',
  source: TRANSIT_NETWORK_FILE,
  features: []
}

const sseClients = new Set()

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const readBody = async (request) => {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Token',
    'Content-Type': 'application/json'
  })
  response.end(JSON.stringify(payload))
}

const sendError = (response, statusCode, message) => {
  sendJson(response, statusCode, { error: message })
}

const requireAdmin = (request, response) => {
  if (request.headers['x-admin-token'] === ADMIN_TOKEN) {
    return true
  }

  sendError(response, 401, 'Token admin tidak valid untuk prototype API.')
  return false
}

const loadRoadNetwork = async () => {
  const raw = await readFile(ROAD_NETWORK_FILE, 'utf8')
  roadNetwork = JSON.parse(raw)
}

const loadTransitNetwork = async () => {
  const raw = await readFile(TRANSIT_NETWORK_FILE, 'utf8')
  transitNetwork = JSON.parse(raw)
}

const getRoadSegment = (roadFeatureId) => {
  const feature = roadNetwork.features.find((item) => item.id === roadFeatureId)
  return feature?.geometry?.coordinates || []
}

const syncTrafficGeometry = (trafficItems) => {
  const seedById = new Map(seedTraffic.map((location) => [location.id, location]))

  return trafficItems.map((location) => {
    const seedLocation = seedById.get(location.id)

    if (!seedLocation) {
      return location
    }

    return {
      ...location,
      name: seedLocation.name,
      description: seedLocation.description,
      roadFeatureId: seedLocation.roadFeatureId,
      coordinates: structuredClone(seedLocation.coordinates),
      segment: structuredClone(getRoadSegment(seedLocation.roadFeatureId))
    }
  })
}

const loadStore = async () => {
  await mkdir(DATA_DIR, { recursive: true })

  if (!existsSync(DB_FILE)) {
    store.traffic = syncTrafficGeometry(store.traffic)
    await saveStore()
    return
  }

  const raw = await readFile(DB_FILE, 'utf8')
  const parsed = JSON.parse(raw)
  store = {
    ...store,
    ...parsed,
    traffic: parsed.traffic?.length ? syncTrafficGeometry(parsed.traffic) : structuredClone(seedTraffic),
    routes: parsed.routes?.length ? parsed.routes : structuredClone(seedRoutes),
    buses: parsed.buses?.length ? parsed.buses : structuredClone(seedBuses)
  }
}

const saveStore = async () => {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(DB_FILE, JSON.stringify(store, null, 2))
}

const publicReports = () => store.reports.map((report) => ({
  id: report.id,
  type: report.type,
  location: report.location,
  description: report.description,
  priority: report.priority,
  status: report.status,
  time: report.time,
  reporter: report.reporter,
  responses: report.responses,
  evidence: report.evidence || null
}))

const hourlyDensityPattern = [
  14, 11, 9, 8, 12, 24, 48, 69, 78, 62, 51, 57,
  64, 58, 53, 61, 74, 86, 82, 66, 49, 38, 28, 19
]

const routePerformancePattern = [1.08, 1.16, 0.92, 1.02]

const buildStats = () => {
  const highest = store.traffic.reduce((current, item) => item.density > current.density ? item : current, store.traffic[0])
  const totalPassengers = store.routes.reduce((total, route) => total + route.passengers, 0)
  const activeReports = store.reports.filter(report => report.status !== 'resolved').length
  const averageDensity = Math.round(store.traffic.reduce((total, item) => total + item.density, 0) / Math.max(store.traffic.length, 1))
  const hourlyAdjustment = Math.round((averageDensity - 58) * 0.45)
  const trafficDensity = hourlyDensityPattern.map((density, hour) => ({
    hour,
    label: String(hour).padStart(2, '0'),
    density: clamp(density + hourlyAdjustment, 5, 96)
  }))
  const transitUsage = store.routes.map((route, index) => {
    const activeBuses = store.buses.filter((bus) => bus.routeId === route.id)
    const loadAverage = activeBuses.length
      ? Math.round(activeBuses.reduce((total, bus) => total + (bus.passengers / bus.capacity), 0) / activeBuses.length * 100)
      : 0

    return {
      id: route.id,
      label: route.shortName,
      name: route.name,
      route: route.route,
      passengers: route.passengers,
      fleet: route.fleet,
      onTime: route.onTime,
      loadAverage,
      color: route.color
    }
  })
  const routePopularity = transitUsage
    .map((route, index) => ({
      ...route,
      score: Math.round(route.passengers * routePerformancePattern[index % routePerformancePattern.length])
    }))
    .sort((a, b) => b.score - a.score)
  const peakHours = [
    {
      id: 'morning',
      label: 'Pagi',
      time: '06:00-09:00',
      density: Math.round(trafficDensity.slice(6, 10).reduce((total, item) => total + item.density, 0) / 4)
    },
    {
      id: 'midday',
      label: 'Siang',
      time: '11:00-13:00',
      density: Math.round(trafficDensity.slice(11, 14).reduce((total, item) => total + item.density, 0) / 3)
    },
    {
      id: 'evening',
      label: 'Sore',
      time: '16:00-19:00',
      density: Math.round(trafficDensity.slice(16, 20).reduce((total, item) => total + item.density, 0) / 4)
    },
    {
      id: 'night',
      label: 'Malam',
      time: '19:00-23:00',
      density: Math.round(trafficDensity.slice(19, 24).reduce((total, item) => total + item.density, 0) / 5)
    }
  ]
  const statusBreakdown = {
    new: store.reports.filter(report => report.status === 'new').length,
    inProgress: store.reports.filter(report => report.status === 'in-progress').length,
    resolved: store.reports.filter(report => report.status === 'resolved').length
  }
  const weeklySummary = {
    incidents: weeklyReports.reduce((total, day) => total + day.incidents, 0),
    avgHandlingTime: Math.round(weeklyReports.reduce((total, day) => total + day.avgTime, 0) / weeklyReports.length),
    busiestDay: weeklyReports.reduce((current, day) => day.incidents > current.incidents ? day : current, weeklyReports[0])
  }

  return {
    summary: {
      avgTravelTime: 45,
      publicTransitPassengers: totalPassengers,
      highestDensity: highest?.density || 0,
      highestDensityLocation: highest?.name || '-',
      activeReports,
      averageDensity,
      activeBuses: store.buses.length,
      resolvedReports: statusBreakdown.resolved
    },
    trafficDensity,
    transitUsage,
    routePopularity,
    peakHours,
    statusBreakdown,
    weeklyReports,
    weeklySummary
  }
}

const broadcast = (event, payload) => {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`

  for (const client of sseClients) {
    client.write(message)
  }
}

const tickRealtimeSimulation = () => {
  store.traffic = store.traffic.map((location) => {
    const delta = Math.round(Math.random() * 6) - 3
    const density = clamp(location.density + delta, 15, 95)
    const avgSpeed = clamp(Math.round(65 - (density * 0.65)), 8, 60)
    const level = density >= 75 ? 'heavy' : density >= 45 ? 'medium' : 'light'
    const color = level === 'heavy' ? '#ef4444' : level === 'medium' ? '#f59e0b' : '#10b981'

    return { ...location, density, avgSpeed, level, color }
  })

  store.buses = store.buses.map((bus) => ({
    ...bus,
    passengers: clamp(bus.passengers + Math.round(Math.random() * 6) - 3, 8, bus.capacity),
    status: bus.passengers >= bus.capacity - 2 ? 'Delayed (5 min)' : bus.status.replace('Delayed (5 min)', 'On Schedule')
  }))

  broadcast('snapshot', {
    traffic: store.traffic,
    routes: store.routes,
    buses: store.buses,
    stats: buildStats()
  })
}

const handleApi = async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`)

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {})
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/events') {
    response.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    })
    response.write(`event: snapshot\ndata: ${JSON.stringify({
      traffic: store.traffic,
      routes: store.routes,
      buses: store.buses,
      stats: buildStats()
    })}\n\n`)
    sseClients.add(response)
    request.on('close', () => sseClients.delete(response))
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/public/traffic') {
    sendJson(response, 200, { data: store.traffic })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/public/routes') {
    sendJson(response, 200, { data: store.routes })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/public/buses') {
    sendJson(response, 200, { data: store.buses })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/public/road-network') {
    sendJson(response, 200, { data: roadNetwork })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/public/transit-network') {
    sendJson(response, 200, { data: transitNetwork })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/public/reports') {
    sendJson(response, 200, { data: publicReports() })
    return
  }

  if (request.method === 'POST' && url.pathname === '/api/public/reports') {
    const body = await readBody(request)

    if (!body.type || !body.location || !body.description) {
      sendError(response, 400, 'Tipe laporan, lokasi, dan deskripsi wajib diisi.')
      return
    }

    const report = {
      id: Date.now(),
      type: body.type,
      location: String(body.location).slice(0, 120),
      description: String(body.description).slice(0, 500),
      priority: body.priority || 'medium',
      status: 'new',
      time: 'Baru saja',
      reporter: body.reporter || 'Warga',
      responses: 0,
      evidence: body.evidence || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    store.reports.unshift(report)
    await saveStore()
    broadcast('reports', { reports: publicReports() })
    sendJson(response, 201, { data: report })
    return
  }

  if (url.pathname.startsWith('/api/admin')) {
    if (!requireAdmin(request, response)) {
      return
    }
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/reports') {
    sendJson(response, 200, { data: store.reports })
    return
  }

  if (request.method === 'PATCH' && url.pathname.startsWith('/api/admin/reports/')) {
    const id = Number(url.pathname.split('/').at(-1))
    const body = await readBody(request)
    const report = store.reports.find(item => item.id === id)

    if (!report) {
      sendError(response, 404, 'Laporan tidak ditemukan.')
      return
    }

    if (body.status) {
      report.status = body.status
    }

    report.responses += 1
    report.updatedAt = new Date().toISOString()
    await saveStore()
    broadcast('reports', { reports: publicReports() })
    sendJson(response, 200, { data: report })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/traffic') {
    sendJson(response, 200, { data: store.traffic })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/road-network') {
    sendJson(response, 200, { data: roadNetwork })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/routes') {
    sendJson(response, 200, { data: store.routes })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/transit-network') {
    sendJson(response, 200, { data: transitNetwork })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/buses') {
    sendJson(response, 200, { data: store.buses })
    return
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/stats') {
    sendJson(response, 200, { data: buildStats() })
    return
  }

  sendError(response, 404, 'Endpoint tidak ditemukan.')
}

const server = http.createServer((request, response) => {
  handleApi(request, response).catch((error) => {
    console.error(error)
    sendError(response, 500, 'Terjadi kesalahan pada prototype backend.')
  })
})

await loadRoadNetwork()
await loadTransitNetwork()
await loadStore()
server.listen(PORT, () => {
  console.log(`Smart Mobility backend berjalan di http://127.0.0.1:${PORT}`)
  console.log(`Admin token prototype: ${ADMIN_TOKEN}`)
})

setInterval(tickRealtimeSimulation, 7000)

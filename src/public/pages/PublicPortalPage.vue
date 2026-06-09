<template>
  <section class="space-y-6">
    <div class="card card-accent public-hero p-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Portal Mobilitas Warga</p>
          <h2 class="mt-1 text-2xl font-black text-slate-950">Pantauan perjalanan Balikpapan</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Lihat kondisi ruas utama, pilih rute Bacitra yang sedang beroperasi, dan kirim laporan bila menemukan hambatan di jalan.
          </p>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center sm:min-w-80">
          <div class="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
            <p class="text-[0.65rem] font-bold uppercase tracking-wide text-emerald-700">Bacitra</p>
            <p class="text-sm font-black text-slate-950">Aktif</p>
          </div>
          <div class="rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2">
            <p class="text-[0.65rem] font-bold uppercase tracking-wide text-cyan-700">Peta</p>
            <p class="text-sm font-black text-slate-950">Lokal</p>
          </div>
          <div class="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
            <p class="text-[0.65rem] font-bold uppercase tracking-wide text-amber-700">Data</p>
            <p class="text-sm font-black text-slate-950">Demo</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <div v-for="item in publicStats" :key="item.label" class="public-stat-card p-5">
        <p class="text-sm font-medium text-slate-500">{{ item.label }}</p>
        <div class="mt-3 flex items-end gap-2">
          <p class="text-3xl font-bold text-slate-950">{{ item.value }}</p>
          <p class="pb-1 text-sm font-semibold text-slate-500">{{ item.unit }}</p>
        </div>
        <p :class="['mt-4 text-sm font-semibold', item.color]">{{ item.note }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
      <div class="xl:col-span-2">
        <PublicMap mode="traffic" :traffic="trafficItems" :road-network="roadNetwork" />
      </div>

      <aside class="card p-6 min-w-0">
        <div class="mb-5 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-black uppercase tracking-[0.13em] text-cyan-700">Info Cepat</p>
            <h2 class="mt-1 text-xl font-bold text-slate-950">Kondisi Jalan Utama</h2>
          </div>
          <span class="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{{ roads.length }} ruas</span>
        </div>

        <div class="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          <div v-for="road in roads" :key="road.name" class="public-list-item p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-semibold text-slate-950">{{ road.name }}</p>
                <p class="mt-1 text-sm text-slate-600">{{ road.message }}</p>
              </div>
              <span :class="['rounded-full px-3 py-1 text-xs font-semibold', road.badgeClass]">{{ road.status }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
      <section class="card p-6 xl:col-span-1 min-w-0">
        <div class="mb-5">
          <p class="text-xs font-black uppercase tracking-[0.13em] text-cyan-700">Transportasi Publik</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Rute Bacitra</h2>
        </div>

        <div class="max-h-[24rem] space-y-3 overflow-y-auto pr-1">
          <button
            v-for="route in routes"
            :key="route.id"
            type="button"
            class="public-list-item flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50/50 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            @click="openTransitRoute(route.id)"
          >
            <div class="min-w-0">
              <p class="font-semibold text-slate-950">{{ route.name }}</p>
              <p class="truncate text-xs text-slate-500">{{ route.nextArrival }}</p>
            </div>
            <span :class="[
              'shrink-0 rounded-full px-3 py-1 text-xs font-semibold',
              route.status === 'Operasional' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            ]">
              {{ route.status }}
            </span>
          </button>
        </div>
      </section>

      <section class="card p-6 xl:col-span-2">
        <div class="mb-5">
          <p class="text-xs font-black uppercase tracking-[0.13em] text-cyan-700">Prioritas Hari Ini</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Rekomendasi Mobilitas</h2>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="rounded-xl border border-red-100 bg-red-50 p-4">
            <p class="text-sm font-bold text-red-700">Hindari</p>
            <p class="mt-2 font-semibold text-slate-950">{{ priorityRoad?.name || 'Ruas padat' }}</p>
            <p class="mt-1 text-sm text-slate-600">{{ priorityRoad?.density || 0 }}% kepadatan, gunakan rute alternatif bila memungkinkan.</p>
          </div>
          <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p class="text-sm font-bold text-emerald-700">Disarankan</p>
            <p class="mt-2 font-semibold text-slate-950">Gunakan {{ recommendedCorridors }}</p>
            <p class="mt-1 text-sm text-slate-600">Koridor Bacitra aktif untuk perjalanan utama kota.</p>
          </div>
          <div class="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p class="text-sm font-bold text-blue-700">Lapor Cepat</p>
            <p class="mt-2 font-semibold text-slate-950">Kanal laporan aktif</p>
            <p class="mt-1 text-sm text-slate-600">Laporan warga akan masuk ke panel admin.</p>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PublicMap from '../components/PublicMap.vue'
import { trafficLocations } from '../../shared/data/mobilityData'
import { bacitraCorridors } from '../../shared/data/bacitraData'
import { emptyRoadNetwork } from '../../shared/data/roadNetworkData'
import { api, createRealtimeSource } from '../../shared/api/client'

const levelStatus = {
  heavy: { status: 'Padat', badgeClass: 'bg-red-100 text-red-700', message: 'Hindari area ini bila tidak mendesak.' },
  medium: { status: 'Sedang', badgeClass: 'bg-yellow-100 text-yellow-700', message: 'Arus kendaraan melambat pada jam sibuk.' },
  light: { status: 'Lancar', badgeClass: 'bg-green-100 text-green-700', message: 'Kondisi lancar untuk rute pusat kota.' }
}

const publicStats = ref([])
const roads = ref([])
const routes = ref([])
const trafficItems = ref(trafficLocations)
const roadNetwork = ref(emptyRoadNetwork)
let events

const activeCorridors = computed(() => bacitraCorridors.filter((corridor) => corridor.buses > 0))
const priorityRoad = computed(() =>
  [...trafficItems.value].sort((left, right) => right.density - left.density)[0]
)
const recommendedCorridors = computed(() =>
  activeCorridors.value.map((corridor) => corridor.code).join(', ')
)

const mapRoads = (items) => [...items]
  .sort((left, right) => right.density - left.density)
  .slice(0, 5)
  .map((road) => ({
  name: road.name,
  message: `${road.description} - ${road.density}% kepadatan, ${road.avgSpeed} km/h`,
  status: levelStatus[road.level].status,
  badgeClass: levelStatus[road.level].badgeClass
}))

const mapRoutes = () => activeCorridors.value.map((route) => ({
  id: route.id,
  name: `Koridor ${route.code}`,
  nextArrival: `${route.from} > ${route.to} - ${route.buses} bus, ${route.shelters} halte`,
  status: route.buses > 0 ? 'Operasional' : 'Tunda'
}))

const openTransitRoute = (corridorId) => {
  sessionStorage.setItem('smart-mobility-selected-corridor', corridorId)
  window.location.hash = `/transit?corridor=${encodeURIComponent(corridorId)}`
}

const updateStats = (traffic, reportItems = []) => {
  const avgDensity = Math.round(traffic.reduce((total, item) => total + item.density, 0) / traffic.length)
  const activeRoutes = activeCorridors.value.length
  const activeBuses = activeCorridors.value.reduce((total, route) => total + route.buses, 0)
  const handledReports = reportItems.filter(report => report.status === 'in-progress').length
  const avgTravelTime = Math.max(12, Math.round(traffic.reduce((total, item) => total + (60 - item.avgSpeed), 0) / traffic.length))

  publicStats.value = [
    { label: 'Kepadatan Kota', value: avgDensity, unit: '%', note: avgDensity >= 70 ? 'Padat' : 'Sedang ramai', color: avgDensity >= 70 ? 'text-red-600' : 'text-amber-600' },
    { label: 'Bacitra Aktif', value: activeRoutes, unit: 'koridor', note: `${activeBuses} bus simulasi`, color: 'text-emerald-600' },
    { label: 'Laporan Ditangani', value: handledReports, unit: 'lokasi', note: 'Petugas merespons', color: 'text-blue-600' },
    { label: 'Estimasi Waktu Tempuh', value: avgTravelTime, unit: 'menit', note: 'Rata-rata simulasi', color: 'text-slate-600' }
  ]
}

const applyData = (traffic, reportItems = []) => {
  trafficItems.value = traffic
  roads.value = mapRoads(traffic)
  routes.value = mapRoutes()
  updateStats(traffic, reportItems)
}

const loadData = async () => {
  try {
    const [traffic, reportItems, roadNetworkData] = await Promise.all([
      api.getPublicTraffic(),
      api.getPublicReports(),
      api.getPublicRoadNetwork()
    ])
    roadNetwork.value = roadNetworkData
    applyData(traffic, reportItems)
  } catch {
    roadNetwork.value = emptyRoadNetwork
    applyData(trafficLocations)
  }
}

onMounted(() => {
  loadData()

  events = createRealtimeSource()
  events.addEventListener('snapshot', (event) => {
    const snapshot = JSON.parse(event.data)
    applyData(snapshot.traffic)
  })
})

onBeforeUnmount(() => {
  events?.close()
})
</script>

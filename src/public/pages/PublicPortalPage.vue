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

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div class="xl:col-span-2">
        <PublicMap />
      </div>

      <aside class="card p-6">
        <div class="mb-5">
          <p class="text-xs font-black uppercase tracking-[0.13em] text-cyan-700">Info Cepat</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Kondisi Jalan Utama</h2>
        </div>

        <div class="space-y-3">
          <div v-for="road in roads" :key="road.name" class="public-list-item p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-slate-950">{{ road.name }}</p>
                <p class="mt-1 text-sm text-slate-600">{{ road.message }}</p>
              </div>
              <span :class="['rounded-full px-3 py-1 text-xs font-semibold', road.badgeClass]">{{ road.status }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <section class="card p-6 xl:col-span-1">
        <div class="mb-5">
          <p class="text-xs font-black uppercase tracking-[0.13em] text-cyan-700">Transportasi Publik</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Rute Bacitra</h2>
        </div>

        <div class="space-y-3">
          <div v-for="route in routes" :key="route.name" class="public-list-item flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p class="font-semibold text-slate-950">{{ route.name }}</p>
              <p class="text-xs text-slate-500">{{ route.nextArrival }}</p>
            </div>
            <span :class="[
              'rounded-full px-3 py-1 text-xs font-semibold',
              route.status === 'Operasional' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            ]">
              {{ route.status }}
            </span>
          </div>
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
            <p class="mt-2 font-semibold text-slate-950">MT Haryono Simpang Wika</p>
            <p class="mt-1 text-sm text-slate-600">Kepadatan tinggi pada jam pulang kerja.</p>
          </div>
          <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p class="text-sm font-bold text-emerald-700">Disarankan</p>
            <p class="mt-2 font-semibold text-slate-950">Gunakan Route 1 atau Route 2</p>
            <p class="mt-1 text-sm text-slate-600">Status operasional normal untuk akses pusat kota.</p>
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
import { onBeforeUnmount, onMounted, ref } from 'vue'
import PublicMap from '../components/PublicMap.vue'
import { trafficLocations, transitRoutes } from '../../shared/data/mobilityData'
import { api, createRealtimeSource } from '../../shared/api/client'

const levelStatus = {
  heavy: { status: 'Padat', badgeClass: 'bg-red-100 text-red-700', message: 'Hindari area ini bila tidak mendesak.' },
  medium: { status: 'Sedang', badgeClass: 'bg-yellow-100 text-yellow-700', message: 'Arus kendaraan melambat pada jam sibuk.' },
  light: { status: 'Lancar', badgeClass: 'bg-green-100 text-green-700', message: 'Kondisi lancar untuk rute pusat kota.' }
}

const publicStats = ref([])
const roads = ref([])
const routes = ref([])
let events

const mapRoads = (items) => items.slice(0, 3).map((road) => ({
  name: road.name,
  message: levelStatus[road.level].message,
  status: levelStatus[road.level].status,
  badgeClass: levelStatus[road.level].badgeClass
}))

const mapRoutes = (items) => items.map((route) => ({
  name: route.shortName.replace('Route', 'Rute'),
  nextArrival: `${route.route} - tiba ${route.eta}`,
  status: route.status === 'active' ? 'Operasional' : 'Tunda'
}))

const updateStats = (traffic, routeItems, reportItems = []) => {
  const avgDensity = Math.round(traffic.reduce((total, item) => total + item.density, 0) / traffic.length)
  const activeRoutes = routeItems.filter(route => route.status === 'active').length
  const handledReports = reportItems.filter(report => report.status === 'in-progress').length

  publicStats.value = [
    { label: 'Kepadatan Kota', value: avgDensity, unit: '%', note: avgDensity >= 70 ? 'Padat' : 'Sedang ramai', color: avgDensity >= 70 ? 'text-red-600' : 'text-amber-600' },
    { label: 'Rute Aktif', value: activeRoutes, unit: 'rute', note: 'Bacitra beroperasi', color: 'text-emerald-600' },
    { label: 'Laporan Ditangani', value: handledReports, unit: 'lokasi', note: 'Petugas merespons', color: 'text-blue-600' },
    { label: 'Estimasi Waktu Tempuh', value: '45', unit: 'menit', note: 'Rata-rata hari ini', color: 'text-slate-600' }
  ]
}

const applyData = (traffic, routeItems, reportItems = []) => {
  roads.value = mapRoads(traffic)
  routes.value = mapRoutes(routeItems)
  updateStats(traffic, routeItems, reportItems)
}

const loadData = async () => {
  try {
    const [traffic, routeItems, reportItems] = await Promise.all([
      api.getPublicTraffic(),
      api.getPublicRoutes(),
      api.getPublicReports()
    ])
    applyData(traffic, routeItems, reportItems)
  } catch {
    applyData(trafficLocations, transitRoutes)
  }
}

onMounted(() => {
  loadData()

  events = createRealtimeSource()
  events.addEventListener('snapshot', (event) => {
    const snapshot = JSON.parse(event.data)
    applyData(snapshot.traffic, snapshot.routes)
  })
})

onBeforeUnmount(() => {
  events?.close()
})
</script>

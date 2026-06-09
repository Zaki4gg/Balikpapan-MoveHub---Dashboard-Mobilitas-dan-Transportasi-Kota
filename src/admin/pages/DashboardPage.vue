<template>
  <section class="space-y-6">
    <div class="card card-accent p-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.14em] text-cyan-600">Snapshot Operasional</p>
          <h2 class="mt-1 text-xl font-black tracking-tight text-slate-950">
            Kondisi mobilitas kota saat ini
          </h2>
          <p class="mt-1 text-sm text-slate-500">
            Pantauan simulasi lalu lintas, armada Bacitra, dan laporan warga.
          </p>
        </div>

        <!-- Status pills -->
        <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:w-auto">
          <div v-for="s in systemStatus" :key="s.label"
               :class="['rounded-xl border px-3.5 py-2.5', s.classes]">
            <p class="text-[0.68rem] font-bold uppercase tracking-wide">{{ s.label }}</p>
            <p class="mt-0.5 text-sm font-black text-slate-950">{{ s.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KPICard
        title="Ruas Dipantau"
        :value="dashboardStats.trafficCount"
        unit="lokasi"
        icon="congestion"
        :trend="dashboardStats.trafficTrend"
      />
      <KPICard
        title="Armada Bacitra"
        :value="dashboardStats.activeBuses"
        unit="unit"
        icon="fleet"
        :trend="dashboardStats.fleetTrend"
      />
      <KPICard
        title="Rata-rata Waktu Tempuh"
        :value="dashboardStats.avgTravelTime"
        unit="menit"
        icon="time"
        :trend="dashboardStats.timeTrend"
      />
      <KPICard
        title="Laporan Aktif"
        :value="dashboardStats.activeReports"
        unit="laporan"
        icon="report"
        :trend="dashboardStats.reportTrend"
      />
    </div>

    <div class="grid grid-cols-1 items-start gap-5 xl:grid-cols-3">
      <!-- Map takes 2/3 -->
      <div class="xl:col-span-2">
        <DashboardMap :traffic="trafficItems" :road-network="roadNetwork" />
      </div>

      <!-- Live feed panel -->
      <aside class="card p-5 min-w-0">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.12em] text-cyan-600">Live Feed</p>
            <h2 class="mt-0.5 text-lg font-bold text-slate-950">Status Real-time</h2>
          </div>
          <span class="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1
                       text-xs font-semibold text-emerald-700">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Aktif
          </span>
        </div>

        <div class="max-h-[30rem] space-y-3 overflow-y-auto pr-1">
          <div
            v-for="status in trafficStatus"
            :key="status.location"
            class="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-950">{{ status.level }}</p>
                <p class="mt-0.5 truncate text-xs text-slate-500">{{ status.location }}</p>
              </div>
              <span :class="['mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full', status.color]"></span>
            </div>
            <!-- Progress bar -->
            <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                :class="['h-1.5 rounded-full transition-all duration-700', status.color]"
                :style="{ width: status.density + '%' }"
              />
            </div>
            <p class="mt-1.5 text-xs text-slate-400">Kepadatan: {{ status.density }}%</p>
          </div>
        </div>
      </aside>
    </div>

        <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">

      <!-- Traffic chart -->
      <section class="card p-5">
        <div class="mb-4">
          <p class="text-xs font-black uppercase tracking-[0.12em] text-cyan-600">Analitik</p>
          <h2 class="mt-0.5 text-lg font-bold text-slate-950">Trend Kemacetan 24 Jam</h2>
        </div>
        <TrafficChart />
      </section>

      <!-- Transit status -->
      <section class="card p-5">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs font-black uppercase tracking-[0.12em] text-cyan-600">Bacitra</p>
            <h2 class="mt-0.5 text-lg font-bold text-slate-950">Status Transportasi Publik</h2>
          </div>
          <span class="shrink-0 text-sm font-semibold text-slate-400">{{ transitStatus.length }} koridor</span>
        </div>

        <div class="max-h-80 space-y-2.5 overflow-y-auto pr-1">
          <button
            v-for="route in transitStatus"
            :key="route.id"
            type="button"
            class="flex w-full items-center justify-between gap-4
                   rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-left transition hover:border-cyan-200 hover:bg-cyan-50/70 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            @click="emit('open-transit', route.id)"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-950">{{ route.name }}</p>
              <p class="text-xs text-slate-500">{{ route.fleet }} armada aktif</p>
            </div>
            <span :class="[
              'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
              route.status === 'Operasional'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            ]">
              {{ route.status }}
            </span>
          </button>
        </div>
      </section>

    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import KPICard       from '../components/KPICard.vue'
import DashboardMap  from '../components/DashboardMap.vue'
import TrafficChart  from '../components/TrafficChart.vue'
import { trafficLocations } from '../../shared/data/mobilityData'
import { bacitraCorridors } from '../../shared/data/bacitraData'
import { emptyRoadNetwork } from '../../shared/data/roadNetworkData'
import { api } from '../../shared/api/client'

const emit = defineEmits(['open-transit'])

const levelLabels = { heavy: 'Kemacetan Berat', medium: 'Kemacetan Sedang', light: 'Lancar' }
const levelColors = { heavy: 'bg-rose-500', medium: 'bg-amber-500', light: 'bg-emerald-500' }

const systemStatus = [
  { label: 'API',    value: 'Online',     classes: 'border-emerald-100 bg-emerald-50/60 text-emerald-700' },
  { label: 'Maps',   value: 'OSM Lokal',  classes: 'border-cyan-100    bg-cyan-50/60    text-cyan-700'    },
  { label: 'Update', value: '7 detik',    classes: 'border-amber-100   bg-amber-50/60   text-amber-700'   },
  { label: 'Mode',   value: 'Prototype',  classes: 'border-slate-200   bg-slate-50      text-slate-600'   },
]

const trafficStatus = ref([])
const transitStatus = ref([])
const trafficItems = ref(trafficLocations)
const roadNetwork = ref(emptyRoadNetwork)
const dashboardStats = ref({
  trafficCount: 0,
  trafficTrend: 0,
  activeBuses: 0,
  fleetTrend: 0,
  avgTravelTime: 0,
  timeTrend: 0,
  activeReports: 0,
  reportTrend: 0
})

const mapTrafficStatus = (items) =>
  [...items].sort((left, right) => right.density - left.density).map((l) => ({
    level:    levelLabels[l.level],
    location: l.name,
    density:  l.density,
    color:    levelColors[l.level],
  }))

const mapTransitStatus = () =>
  bacitraCorridors.map((r) => ({
    id: r.id,
    name:   `Koridor ${r.code}`,
    fleet:  r.buses,
    status: r.buses > 0 ? 'Operasional' : 'Belum Aktif',
  }))

const updateDashboardStats = (traffic, reports = []) => {
  const activeBuses = bacitraCorridors.reduce((total, corridor) => total + corridor.buses, 0)
  const activeReports = reports.filter((report) => ['new', 'in-progress'].includes(report.status)).length
  const avgTravelTime = Math.max(12, Math.round(traffic.reduce((total, item) => total + (60 - item.avgSpeed), 0) / traffic.length))
  const heavyRoads = traffic.filter((item) => item.level === 'heavy').length

  dashboardStats.value = {
    trafficCount: traffic.length,
    trafficTrend: heavyRoads ? 6 : 0,
    activeBuses,
    fleetTrend: 4,
    avgTravelTime,
    timeTrend: -3,
    activeReports,
    reportTrend: activeReports ? 8 : 0
  }
}

onMounted(async () => {
  try {
    const [traffic, reports, roadNetworkData] = await Promise.all([
      api.getAdminTraffic(),
      api.getAdminReports(),
      api.getAdminRoadNetwork(),
    ])
    trafficItems.value = traffic
    roadNetwork.value = roadNetworkData
    trafficStatus.value = mapTrafficStatus(traffic)
    transitStatus.value = mapTransitStatus()
    updateDashboardStats(traffic, reports)
  } catch {
    trafficItems.value = trafficLocations
    roadNetwork.value = emptyRoadNetwork
    trafficStatus.value = mapTrafficStatus(trafficLocations)
    transitStatus.value = mapTransitStatus()
    updateDashboardStats(trafficLocations)
  }
})
</script>


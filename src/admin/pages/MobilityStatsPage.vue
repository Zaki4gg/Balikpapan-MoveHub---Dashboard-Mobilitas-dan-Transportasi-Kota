<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div class="stats-card">
        <p class="stats-label">Rata-rata Waktu Tempuh</p>
        <div class="flex items-end gap-2 mt-2">
          <p class="stats-value text-orange-600">{{ summary.avgTravelTime }}</p>
          <span class="stats-unit">menit</span>
        </div>
        <p class="stats-note">Estimasi perjalanan lintas pusat kota hari ini</p>
      </div>

      <div class="stats-card">
        <p class="stats-label">Penumpang Bacitra</p>
        <div class="flex items-end gap-2 mt-2">
          <p class="stats-value text-blue-600">{{ formatNumber(summary.publicTransitPassengers) }}</p>
          <span class="stats-unit">orang</span>
        </div>
        <p class="stats-note">{{ summary.activeBuses }} armada terpantau dalam simulasi</p>
      </div>

      <div class="stats-card">
        <p class="stats-label">Kepadatan Tertinggi</p>
        <div class="flex items-end gap-2 mt-2">
          <p class="stats-value text-red-600">{{ summary.highestDensity }}</p>
          <span class="stats-unit">%</span>
        </div>
        <p class="stats-note">{{ summary.highestDensityLocation }}</p>
      </div>

      <div class="stats-card">
        <p class="stats-label">Laporan Aktif</p>
        <div class="flex items-end gap-2 mt-2">
          <p class="stats-value text-emerald-600">{{ summary.activeReports }}</p>
          <span class="stats-unit">laporan</span>
        </div>
        <p class="stats-note">{{ summary.resolvedReports }} laporan sudah selesai</p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
      <div class="panel-card">
        <div class="panel-heading">
          <div>
            <p class="section-kicker">Traffic Analytics</p>
            <h2>Kepadatan Lalu Lintas Per Jam (24 Jam)</h2>
          </div>
          <span class="pill-soft">Rata-rata {{ summary.averageDensity }}%</span>
        </div>
        <div class="h-80">
          <Bar :data="trafficDensityData" :options="trafficChartOptions" />
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-heading">
          <div>
            <p class="section-kicker">Peak Window</p>
            <h2>Analisis Jam Sibuk</h2>
          </div>
        </div>
        <div class="space-y-4">
          <div v-for="period in peakHours" :key="period.id" class="peak-row">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="font-bold text-slate-900">{{ period.label }}</p>
                <p class="text-xs text-slate-500">{{ period.time }}</p>
              </div>
              <span :class="['density-badge', densityClass(period.density)]">{{ period.density }}%</span>
            </div>
            <div class="meter-track">
              <div :class="['meter-fill', densityClass(period.density)]" :style="{ width: `${period.density}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="panel-card">
        <div class="panel-heading">
          <div>
            <p class="section-kicker">Transit Usage</p>
            <h2>Penggunaan Transportasi Publik</h2>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-[0.8fr_1fr] gap-5 items-center">
          <div class="h-72">
            <Doughnut :data="transitUsageData" :options="doughnutOptions" />
          </div>
          <div class="space-y-3">
            <div v-for="route in transitRows" :key="route.id" class="route-row">
              <div class="flex items-center gap-3">
                <span class="route-dot" :style="{ backgroundColor: route.color }"></span>
                <div>
                  <p class="font-bold text-slate-900">{{ route.label }}</p>
                  <p class="text-xs text-slate-500">{{ route.route }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold text-slate-900">{{ formatNumber(route.passengers) }}</p>
                <p class="text-xs text-slate-500">Load {{ route.loadAverage }}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-heading">
          <div>
            <p class="section-kicker">Route Rank</p>
            <h2>Popularitas Rute Transportasi</h2>
          </div>
        </div>
        <div class="h-72">
          <Bar :data="routePopularityData" :options="routeChartOptions" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[1fr_0.7fr] gap-6">
      <div class="panel-card">
        <div class="panel-heading">
          <div>
            <p class="section-kicker">Weekly Report</p>
            <h2>Laporan Mingguan</h2>
          </div>
          <span class="pill-soft">{{ weeklySummary.incidents }} insiden</span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          <div v-for="day in weekData" :key="day.date" class="weekly-day">
            <p class="text-sm font-bold text-slate-900">{{ day.day }}</p>
            <p class="text-2xl font-black text-blue-600 mt-2">{{ day.incidents }}</p>
            <p class="text-xs text-slate-500">Insiden</p>
            <p class="text-xs text-slate-600 mt-2">Avg {{ day.avgTime }} min</p>
          </div>
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-heading">
          <div>
            <p class="section-kicker">Operational Insight</p>
            <h2>Ringkasan Penanganan</h2>
          </div>
        </div>
        <div class="space-y-3">
          <div class="insight-row">
            <span>Laporan Baru</span>
            <strong>{{ statusBreakdown.new }}</strong>
          </div>
          <div class="insight-row">
            <span>Sedang Ditangani</span>
            <strong>{{ statusBreakdown.inProgress }}</strong>
          </div>
          <div class="insight-row">
            <span>Selesai</span>
            <strong>{{ statusBreakdown.resolved }}</strong>
          </div>
          <div class="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p class="text-sm font-bold text-blue-900">Hari tersibuk: {{ weeklySummary.busiestDay?.day }}</p>
            <p class="text-sm text-blue-800 mt-1">
              Waktu penanganan rata-rata minggu ini {{ weeklySummary.avgHandlingTime }} menit.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { transitRoutes, weeklyReports } from '../../shared/data/mobilityData'
import { api } from '../../shared/api/client'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const fallbackHourlyDensity = [
  14, 11, 9, 8, 12, 24, 48, 69, 78, 62, 51, 57,
  64, 58, 53, 61, 74, 86, 82, 66, 49, 38, 28, 19
].map((density, hour) => ({ hour, label: String(hour).padStart(2, '0'), density }))

const fallbackTransit = transitRoutes.map((route) => ({
  id: route.id,
  label: route.shortName,
  route: route.route,
  passengers: route.passengers,
  fleet: route.fleet,
  onTime: route.onTime,
  loadAverage: 75,
  color: route.color,
  score: route.passengers
}))

const summary = ref({
  avgTravelTime: 45,
  publicTransitPassengers: transitRoutes.reduce((total, route) => total + route.passengers, 0),
  highestDensity: 85,
  highestDensityLocation: 'MT Haryono Simpang Wika',
  activeReports: 4,
  averageDensity: 58,
  activeBuses: 6,
  resolvedReports: 1
})

const peakHours = ref([
  { id: 'morning', label: 'Pagi', time: '06:00-09:00', density: 64 },
  { id: 'midday', label: 'Siang', time: '11:00-13:00', density: 60 },
  { id: 'evening', label: 'Sore', time: '16:00-19:00', density: 77 },
  { id: 'night', label: 'Malam', time: '19:00-23:00', density: 40 }
])

const statusBreakdown = ref({ new: 1, inProgress: 4, resolved: 1 })
const weeklySummary = ref({
  incidents: weeklyReports.reduce((total, day) => total + day.incidents, 0),
  avgHandlingTime: 40,
  busiestDay: weeklyReports[4]
})
const weekData = ref(weeklyReports)
const transitRows = ref(fallbackTransit)

const trafficDensityData = ref({
  labels: fallbackHourlyDensity.map((item) => item.label),
  datasets: [{
    label: 'Kepadatan (%)',
    data: fallbackHourlyDensity.map((item) => item.density),
    backgroundColor: fallbackHourlyDensity.map((item) => densityColor(item.density)),
    borderRadius: 6
  }]
})

const transitUsageData = ref({
  labels: fallbackTransit.map((route) => route.label),
  datasets: [{
    data: fallbackTransit.map((route) => route.passengers),
    backgroundColor: fallbackTransit.map((route) => route.color),
    borderWidth: 3,
    borderColor: '#fff'
  }]
})

const routePopularityData = ref({
  labels: fallbackTransit.map((route) => route.label),
  datasets: [{
    label: 'Skor Popularitas',
    data: fallbackTransit.map((route) => route.score),
    backgroundColor: fallbackTransit.map((route) => route.color),
    borderRadius: 6
  }]
})

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true }
  }
}

const trafficChartOptions = {
  ...baseOptions,
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxRotation: 0, color: '#64748b' }
    },
    y: {
      beginAtZero: true,
      max: 100,
      grid: { color: '#e2e8f0' },
      ticks: { callback: (value) => `${value}%` }
    }
  }
}

const routeChartOptions = {
  ...baseOptions,
  indexAxis: 'y',
  scales: {
    x: {
      beginAtZero: true,
      grid: { color: '#e2e8f0' }
    },
    y: {
      grid: { display: false }
    }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' }
  },
  cutout: '62%'
}

function densityColor(density) {
  if (density >= 75) return '#ef4444'
  if (density >= 45) return '#f59e0b'
  return '#10b981'
}

function densityClass(density) {
  if (density >= 75) return 'is-heavy'
  if (density >= 45) return 'is-medium'
  return 'is-light'
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('id-ID')
}

function normalizeDensityItems(items) {
  if (!Array.isArray(items) || !items.length) {
    return fallbackHourlyDensity
  }

  if (typeof items[0] === 'number') {
    return items.map((density, hour) => ({ hour, label: String(hour).padStart(2, '0'), density }))
  }

  return items
}

const applyStats = (stats) => {
  const densityItems = normalizeDensityItems(stats.trafficDensity)
  const usage = stats.transitUsage?.length ? stats.transitUsage : fallbackTransit
  const popularity = stats.routePopularity?.length ? stats.routePopularity : usage

  summary.value = { ...summary.value, ...stats.summary }
  peakHours.value = stats.peakHours?.length ? stats.peakHours : peakHours.value
  statusBreakdown.value = { ...statusBreakdown.value, ...(stats.statusBreakdown || {}) }
  weeklySummary.value = { ...weeklySummary.value, ...(stats.weeklySummary || {}) }
  weekData.value = stats.weeklyReports?.length ? stats.weeklyReports : weeklyReports
  transitRows.value = usage

  trafficDensityData.value = {
    labels: densityItems.map((item) => item.label),
    datasets: [{
      label: 'Kepadatan (%)',
      data: densityItems.map((item) => item.density),
      backgroundColor: densityItems.map((item) => densityColor(item.density)),
      borderRadius: 6
    }]
  }

  transitUsageData.value = {
    labels: usage.map((route) => route.label),
    datasets: [{
      data: usage.map((route) => route.passengers),
      backgroundColor: usage.map((route) => route.color),
      borderWidth: 3,
      borderColor: '#fff'
    }]
  }

  routePopularityData.value = {
    labels: popularity.map((route) => route.label),
    datasets: [{
      label: 'Skor Popularitas',
      data: popularity.map((route) => route.score || route.passengers),
      backgroundColor: popularity.map((route) => route.color),
      borderRadius: 6
    }]
  }
}

onMounted(async () => {
  try {
    applyStats(await api.getAdminStats())
  } catch {
    weekData.value = weeklyReports
  }
})
</script>

<style scoped>
.stats-card,
.panel-card {
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
}

.stats-card {
  padding: 18px;
}

.stats-label {
  color: #475569;
  font-size: 0.86rem;
  font-weight: 700;
}

.stats-value {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
}

.stats-unit,
.stats-note {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
}

.stats-note {
  margin-top: 12px;
}

.panel-card {
  padding: 22px;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-heading h2 {
  color: #0f172a;
  font-size: 1.08rem;
  font-weight: 900;
}

.section-kicker {
  color: #0284c7;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.pill-soft {
  border-radius: 999px;
  background: #e0f2fe;
  color: #075985;
  font-size: 0.78rem;
  font-weight: 900;
  padding: 8px 12px;
  white-space: nowrap;
}

.peak-row,
.route-row,
.insight-row,
.weekly-day {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  background: #f8fafc;
}

.peak-row,
.route-row,
.insight-row {
  padding: 14px;
}

.weekly-day {
  padding: 14px 12px;
  text-align: center;
}

.density-badge {
  border-radius: 999px;
  color: #fff;
  font-size: 0.76rem;
  font-weight: 900;
  padding: 6px 10px;
}

.meter-track {
  height: 9px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
  margin-top: 10px;
}

.meter-fill {
  height: 100%;
  border-radius: inherit;
}

.is-heavy {
  background: #ef4444;
}

.is-medium {
  background: #f59e0b;
}

.is-light {
  background: #10b981;
}

.route-row,
.insight-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.route-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  box-shadow: 0 0 0 4px rgba(148, 163, 184, 0.16);
}

.insight-row span {
  color: #475569;
  font-weight: 700;
}

.insight-row strong {
  color: #0f172a;
  font-size: 1.3rem;
  font-weight: 900;
}
</style>

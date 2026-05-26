<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg shadow-md p-4">
        <p class="text-gray-600 text-sm">Rata-rata Waktu Tempuh (Hari Ini)</p>
        <p class="text-3xl font-bold text-orange-600 mt-2">{{ summary.avgTravelTime }} min</p>
        <p class="text-xs text-gray-500 mt-1">Naik 12% dari kemarin</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4">
        <p class="text-gray-600 text-sm">Penumpang Transportasi Publik</p>
        <p class="text-3xl font-bold text-blue-600 mt-2">{{ summary.publicTransitPassengers }}</p>
        <p class="text-xs text-gray-500 mt-1">Estimasi hingga jam 17:00</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4">
        <p class="text-gray-600 text-sm">Tingkat Kepadatan Tertinggi</p>
        <p class="text-3xl font-bold text-red-600 mt-2">{{ summary.highestDensity }}%</p>
        <p class="text-xs text-gray-500 mt-1">{{ summary.highestDensityLocation }} - Pukul 17:30</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Kepadatan Lalu Lintas Per Jam (24 Jam)</h2>
        <div class="h-72">
          <Bar :data="trafficDensityData" :options="chartOptions" />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Penggunaan Transportasi Publik</h2>
        <div class="h-72">
          <Doughnut :data="transitUsageData" :options="doughnutOptions" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Popularitas Rute Transportasi</h2>
        <div class="h-72">
          <Bar :data="routePopularityData" :options="routeChartOptions" />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Analisis Jam Sibuk</h2>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-32">
              <p class="text-sm font-semibold text-gray-800">Pagi (06:00-09:00)</p>
            </div>
            <div class="flex-1 bg-gray-200 rounded-full h-6">
              <div class="bg-red-500 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style="width: 90%;">
                90%
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-32">
              <p class="text-sm font-semibold text-gray-800">Siang (11:00-13:00)</p>
            </div>
            <div class="flex-1 bg-gray-200 rounded-full h-6">
              <div class="bg-yellow-500 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style="width: 60%;">
                60%
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-32">
              <p class="text-sm font-semibold text-gray-800">Sore (16:00-19:00)</p>
            </div>
            <div class="flex-1 bg-gray-200 rounded-full h-6">
              <div class="bg-red-500 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style="width: 85%;">
                85%
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-32">
              <p class="text-sm font-semibold text-gray-800">Malam (19:00-23:00)</p>
            </div>
            <div class="flex-1 bg-gray-200 rounded-full h-6">
              <div class="bg-green-500 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style="width: 35%;">
                35%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-bold text-gray-800 mb-4">Laporan Mingguan</h2>
      <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div v-for="day in weekData" :key="day.date" class="text-center p-3 border border-gray-200 rounded-lg">
          <p class="text-sm font-semibold text-gray-800 mb-2">{{ day.day }}</p>
          <p class="text-2xl font-bold text-blue-600 mb-2">{{ day.incidents }}</p>
          <p class="text-xs text-gray-600">Insiden</p>
          <p class="text-xs text-gray-500 mt-2">Avg: {{ day.avgTime }} min</p>
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

const summary = ref({
  avgTravelTime: 45,
  publicTransitPassengers: transitRoutes.reduce((total, route) => total + route.passengers, 0),
  highestDensity: 85,
  highestDensityLocation: 'MT Haryono'
})

const trafficDensityData = ref({
  labels: ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'],
  datasets: [{
    label: 'Kepadatan (%)',
    data: [15, 12, 10, 35, 55, 65, 72, 68, 85, 78, 55, 30],
    backgroundColor: '#EF4444',
    borderRadius: 4
  }]
})

const transitUsageData = ref({
  labels: transitRoutes.map(route => route.shortName),
  datasets: [{
    data: transitRoutes.map(route => route.passengers),
    backgroundColor: transitRoutes.map(route => route.color),
    borderWidth: 2,
    borderColor: '#fff'
  }]
})

const routePopularityData = ref({
  labels: transitRoutes.map(route => route.shortName),
  datasets: [{
    label: 'Penumpang',
    data: transitRoutes.map(route => route.passengers),
    backgroundColor: '#3B82F6',
    borderRadius: 4
  }]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true }
  },
  scales: {
    y: { beginAtZero: true, max: 100 }
  }
}

const routeChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true }
  },
  scales: {
    y: { beginAtZero: true }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' }
  }
}

const weekData = ref(weeklyReports)

const applyStats = (stats) => {
  summary.value = stats.summary

  trafficDensityData.value = {
    labels: ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'],
    datasets: [{
      label: 'Kepadatan (%)',
      data: stats.trafficDensity,
      backgroundColor: '#EF4444',
      borderRadius: 4
    }]
  }

  transitUsageData.value = {
    labels: stats.transitUsage.map(route => route.label),
    datasets: [{
      data: stats.transitUsage.map(route => route.passengers),
      backgroundColor: stats.transitUsage.map(route => route.color),
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }

  routePopularityData.value = {
    labels: stats.transitUsage.map(route => route.label),
    datasets: [{
      label: 'Penumpang',
      data: stats.transitUsage.map(route => route.passengers),
      backgroundColor: '#3B82F6',
      borderRadius: 4
    }]
  }

  weekData.value = stats.weeklyReports
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
</style>

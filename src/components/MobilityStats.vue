<template>
  <div class="space-y-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg shadow-md p-4">
        <p class="text-gray-600 text-sm">Rata-rata Waktu Tempuh (Hari Ini)</p>
        <p class="text-3xl font-bold text-orange-600 mt-2">45 min</p>
        <p class="text-xs text-gray-500 mt-1">Naik 12% dari kemarin</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4">
        <p class="text-gray-600 text-sm">Penumpang Transportasi Publik</p>
        <p class="text-3xl font-bold text-blue-600 mt-2">8.4K</p>
        <p class="text-xs text-gray-500 mt-1">Estimasi hingga jam 17:00</p>
      </div>
      <div class="bg-white rounded-lg shadow-md p-4">
        <p class="text-gray-600 text-sm">Tingkat Kepadatan Tertinggi</p>
        <p class="text-3xl font-bold text-red-600 mt-2">85%</p>
        <p class="text-xs text-gray-500 mt-1">MT Haryono - Pukul 17:30</p>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Traffic Density Throughout Day -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Kepadatan Lalu Lintas Per Jam (24 Jam)</h2>
        <BarChart :data="trafficDensityData" :options="chartOptions" />
      </div>

      <!-- Public Transit Usage -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Penggunaan Transportasi Publik</h2>
        <DoughnutChart :data="transitUsageData" :options="doughnutOptions" />
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Route Popularity -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Popularitas Rute Transportasi</h2>
        <BarChart :data="routePopularityData" :options="routeChartOptions" />
      </div>

      <!-- Peak Hours Analysis -->
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

    <!-- Weekly Report -->
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
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

// Data definitions
const trafficDensityData = {
  labels: ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'],
  datasets: [{
    label: 'Kepadatan (%)',
    data: [15, 12, 10, 35, 55, 65, 72, 68, 85, 78, 55, 30],
    backgroundColor: '#EF4444',
    borderRadius: 4
  }]
}

const transitUsageData = {
  labels: ['Route 1', 'Route 2', 'Route 3', 'Route 4'],
  datasets: [{
    data: [35, 28, 22, 15],
    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
    borderWidth: 2,
    borderColor: '#fff'
  }]
}

const routePopularityData = {
  labels: ['Route 1', 'Route 2', 'Route 3', 'Route 4'],
  datasets: [{
    label: 'Penumpang',
    data: [485, 620, 245, 380],
    backgroundColor: '#3B82F6',
    borderRadius: 4
  }]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { beginAtZero: true, max: 100 }
  }
}

const routeChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { beginAtZero: true }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { position: 'bottom' }
  }
}

const weekData = [
  { day: 'Senin', date: '2024-01-01', incidents: 12, avgTime: 42 },
  { day: 'Selasa', date: '2024-01-02', incidents: 10, avgTime: 40 },
  { day: 'Rabu', date: '2024-01-03', incidents: 14, avgTime: 45 },
  { day: 'Kamis', date: '2024-01-04', incidents: 11, avgTime: 41 },
  { day: 'Jumat', date: '2024-01-05', incidents: 16, avgTime: 48 },
  { day: 'Sabtu', date: '2024-01-06', incidents: 8, avgTime: 35 },
  { day: 'Minggu', date: '2024-01-07', incidents: 5, avgTime: 30 }
]
</script>

<style scoped>
</style>

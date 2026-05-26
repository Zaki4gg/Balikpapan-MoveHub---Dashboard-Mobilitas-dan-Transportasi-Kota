<template>
  <div class="h-72 w-full">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const chartData = {
  labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
  datasets: [
    {
      label: 'Kepadatan Lalu Lintas (%)',
      data: [15, 12, 10, 25, 45, 60, 75, 82, 85, 70, 55, 30],
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#EF4444',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7
    },
    {
      label: 'Rata-rata Kecepatan (km/h)',
      data: [45, 48, 50, 40, 25, 18, 15, 12, 10, 20, 28, 42],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3B82F6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          size: 12,
          weight: 'bold'
        },
        padding: 15
      }
    },
    title: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        font: {
          size: 11
        }
      }
    },
    x: {
      ticks: {
        font: {
          size: 11
        }
      }
    }
  }
}
</script>

<style scoped>
</style>

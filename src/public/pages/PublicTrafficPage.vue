<template>
  <section class="space-y-6">
    <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-slate-500">Rata-rata Kepadatan</p>
        <p class="mt-3 text-3xl font-bold text-slate-950">{{ averageDensity }}%</p>
        <p class="mt-3 text-sm font-semibold text-amber-600">Simulasi real-time</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-slate-500">Ruas Padat</p>
        <p class="mt-3 text-3xl font-bold text-red-600">{{ heavyCount }}</p>
        <p class="mt-3 text-sm font-semibold text-slate-500">Perlu dihindari</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-slate-500">Kecepatan Rata-rata</p>
        <p class="mt-3 text-3xl font-bold text-emerald-600">{{ averageSpeed }} km/h</p>
        <p class="mt-3 text-sm font-semibold text-slate-500">Estimasi kota</p>
      </div>
    </div>

    <PublicMap />

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-semibold text-cyan-700">Lalu Lintas</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Kondisi Ruas Jalan</h2>
        </div>
        <select v-model="filterLevel" class="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
          <option value="">Semua Level</option>
          <option value="heavy">Padat</option>
          <option value="medium">Sedang</option>
          <option value="light">Lancar</option>
        </select>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article v-for="road in filteredTraffic" :key="road.id" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="font-bold text-slate-950">{{ road.name }}</h3>
              <p class="mt-1 text-sm text-slate-600">{{ road.description }}</p>
            </div>
            <span :class="['rounded-full px-3 py-1 text-xs font-semibold', levelMeta[road.level].badge]">
              {{ levelMeta[road.level].label }}
            </span>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p class="text-xs text-slate-500">Kepadatan</p>
              <p class="text-2xl font-bold text-slate-950">{{ road.density }}%</p>
            </div>
            <div>
              <p class="text-xs text-slate-500">Kecepatan</p>
              <p class="text-2xl font-bold text-slate-950">{{ road.avgSpeed }} km/h</p>
            </div>
          </div>

          <div class="mt-4 h-2 rounded-full bg-slate-200">
            <div :class="['h-2 rounded-full', levelMeta[road.level].bar]" :style="{ width: `${road.density}%` }"></div>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import PublicMap from '../components/PublicMap.vue'
import { trafficLocations } from '../../shared/data/mobilityData'
import { api } from '../../shared/api/client'

const traffic = ref(trafficLocations)
const filterLevel = ref('')

const levelMeta = {
  heavy: { label: 'Padat', badge: 'bg-red-100 text-red-700', bar: 'bg-red-500' },
  medium: { label: 'Sedang', badge: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-500' },
  light: { label: 'Lancar', badge: 'bg-green-100 text-green-700', bar: 'bg-green-500' }
}

const filteredTraffic = computed(() => {
  return traffic.value.filter((road) => !filterLevel.value || road.level === filterLevel.value)
})

const averageDensity = computed(() => {
  return Math.round(traffic.value.reduce((total, road) => total + road.density, 0) / traffic.value.length)
})

const averageSpeed = computed(() => {
  return Math.round(traffic.value.reduce((total, road) => total + road.avgSpeed, 0) / traffic.value.length)
})

const heavyCount = computed(() => traffic.value.filter((road) => road.level === 'heavy').length)

onMounted(async () => {
  try {
    traffic.value = await api.getPublicTraffic()
  } catch {
    traffic.value = trafficLocations
  }
})
</script>

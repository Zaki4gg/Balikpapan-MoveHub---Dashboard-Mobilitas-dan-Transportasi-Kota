<template>
  <section class="space-y-6">
    <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
      <div class="card p-5">
        <p class="text-sm font-medium text-slate-500">Rute Beroperasi</p>
        <p class="mt-3 text-3xl font-bold text-emerald-600">{{ activeRoutes }}</p>
        <p class="mt-3 text-sm font-semibold text-slate-500">Dari {{ routes.length }} rute</p>
      </div>
      <div class="card p-5">
        <p class="text-sm font-medium text-slate-500">Total Armada Aktif</p>
        <p class="mt-3 text-3xl font-bold text-blue-600">{{ totalFleet }}</p>
        <p class="mt-3 text-sm font-semibold text-slate-500">Simulasi operasional</p>
      </div>
      <div class="card p-5">
        <p class="text-sm font-medium text-slate-500">Penumpang Terpantau</p>
        <p class="mt-3 text-3xl font-bold text-indigo-600">{{ totalPassengers }}</p>
        <p class="mt-3 text-sm font-semibold text-slate-500">Estimasi hari ini</p>
      </div>
    </div>

    <PublicMap mode="transit" :routes="routes" :buses="buses" :transit-network="transitNetwork" />

    <section class="card p-6">
      <div class="mb-5">
        <p class="text-sm font-semibold text-cyan-700">Transportasi Publik</p>
        <h2 class="mt-1 text-xl font-bold text-slate-950">Daftar Rute Bacitra</h2>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article v-for="route in routes" :key="route.id" class="card p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="font-bold text-slate-950">{{ route.name }}</h3>
              <p class="mt-1 text-sm text-slate-600">{{ route.route }}</p>
            </div>
            <span :class="[
              'rounded-full px-3 py-1 text-xs font-semibold',
              route.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            ]">
              {{ route.status === 'active' ? 'Operasional' : 'Tunda' }}
            </span>
          </div>

          <div class="mt-5 grid grid-cols-4 gap-3 text-center">
            <div>
              <p class="text-xs text-slate-500">Armada</p>
              <p class="font-bold text-slate-950">{{ route.fleet }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500">Penumpang</p>
              <p class="font-bold text-slate-950">{{ route.passengers }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500">On Time</p>
              <p class="font-bold text-slate-950">{{ route.onTime }}%</p>
            </div>
            <div>
              <p class="text-xs text-slate-500">ETA</p>
              <p class="font-bold text-slate-950">{{ route.eta }}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import PublicMap from '../components/PublicMap.vue'
import { activeBuses, transitRoutes } from '../../shared/data/mobilityData'
import { emptyTransitNetwork, TRANSIT_NETWORK_GEOJSON_PATH } from '../../shared/data/roadNetworkData.js'
import { api } from '../../shared/api/client'

const routes = ref(transitRoutes)
const buses = ref(activeBuses)
const transitNetwork = ref(emptyTransitNetwork)

const activeRoutes = computed(() => routes.value.filter((route) => route.status === 'active').length)
const totalFleet = computed(() => routes.value.reduce((total, route) => total + route.fleet, 0))
const totalPassengers = computed(() => routes.value.reduce((total, route) => total + route.passengers, 0))

const loadLocalTransitNetwork = async () => {
  const response = await fetch(TRANSIT_NETWORK_GEOJSON_PATH)

  if (!response.ok) {
    throw new Error('Gagal memuat GeoJSON rute Bacitra lokal.')
  }

  return response.json()
}

onMounted(async () => {
  try {
    const [routeData, busData, transitNetworkData] = await Promise.all([
      api.getPublicRoutes(),
      api.getPublicBuses(),
      api.getPublicTransitNetwork()
    ])
    routes.value = routeData
    buses.value = busData
    transitNetwork.value = transitNetworkData
  } catch {
    routes.value = transitRoutes
    buses.value = activeBuses
    try {
      transitNetwork.value = await loadLocalTransitNetwork()
    } catch {
      transitNetwork.value = emptyTransitNetwork
    }
  }
})
</script>

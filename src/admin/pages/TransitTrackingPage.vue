<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="card p-4">
        <p class="text-sm text-slate-600">Total Armada</p>
        <p class="mt-2 text-3xl font-bold text-blue-600">156</p>
        <p class="mt-1 text-xs text-slate-500">Unit Operasional</p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-slate-600">Operasional</p>
        <p class="mt-2 text-3xl font-bold text-green-600">148</p>
        <p class="mt-1 text-xs text-slate-500">95% Availability</p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-slate-600">Dalam Perbaikan</p>
        <p class="mt-2 text-3xl font-bold text-yellow-600">5</p>
        <p class="mt-1 text-xs text-slate-500">Maintenance</p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-slate-600">Penumpang Hari Ini</p>
        <p class="mt-2 text-3xl font-bold text-indigo-600">8.4K</p>
        <p class="mt-1 text-xs text-slate-500">Estimasi</p>
      </div>
    </div>

    <TransitRouteMap :routes="routes" :buses="buses" :transit-network="transitNetwork" />

    <section class="card p-6">
      <h2 class="mb-4 text-xl font-bold text-slate-950">Rute Operasional</h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div v-for="route in routes" :key="route.id" class="card p-4">
          <div class="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 class="font-bold text-slate-950">{{ route.name }}</h3>
              <p class="text-sm text-slate-600">{{ route.route }}</p>
            </div>
            <span :class="['rounded-full px-3 py-1 text-xs font-semibold', route.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">
              {{ route.status === 'active' ? 'Aktif' : 'Tunda' }}
            </span>
          </div>

          <div class="mb-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p class="text-xs text-slate-600">Armada</p>
              <p class="font-bold text-slate-950">{{ route.fleet }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-600">Penumpang</p>
              <p class="font-bold text-slate-950">{{ route.passengers }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-600">On Time</p>
              <p class="font-bold text-slate-950">{{ route.onTime }}%</p>
            </div>
          </div>

          <button
            type="button"
            class="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            @click="showRouteDetail(route)"
          >
            Lihat Detail Armada
          </button>
        </div>
      </div>
    </section>

    <section class="card p-6">
      <h2 class="mb-4 text-xl font-bold text-slate-950">Pelacakan Real-time</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b-2 border-slate-300">
              <th class="px-4 py-3 text-left">No. Armada</th>
              <th class="px-4 py-3 text-left">Rute</th>
              <th class="px-4 py-3 text-left">Lokasi</th>
              <th class="px-4 py-3 text-left">Penumpang</th>
              <th class="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bus in buses" :key="bus.id" class="border-b border-slate-200 hover:bg-slate-50">
              <td class="px-4 py-3 font-semibold text-slate-950">{{ bus.number }}</td>
              <td class="px-4 py-3">{{ bus.route }}</td>
              <td class="px-4 py-3 text-slate-600">{{ bus.location }}</td>
              <td class="px-4 py-3">{{ bus.passengers }}/{{ bus.capacity }}</td>
              <td class="px-4 py-3">
                <span :class="['rounded-full px-3 py-1 text-xs font-semibold', bus.status === 'On Schedule' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700']">
                  {{ bus.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="selectedRoute" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section class="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-cyan-700">Detail Armada</p>
            <h2 class="mt-1 text-2xl font-bold text-slate-950">{{ selectedRoute.name }}</h2>
            <p class="mt-1 text-sm text-slate-600">{{ selectedRoute.route }}</p>
          </div>
          <button type="button" class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" @click="selectedRoute = null">
            Tutup
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div class="metric-box p-4">
            <p class="text-xs text-slate-500">Armada</p>
            <p class="mt-1 text-xl font-bold text-slate-950">{{ selectedRoute.fleet }}</p>
          </div>
          <div class="metric-box p-4">
            <p class="text-xs text-slate-500">Penumpang</p>
            <p class="mt-1 text-xl font-bold text-slate-950">{{ selectedRoute.passengers }}</p>
          </div>
          <div class="metric-box p-4">
            <p class="text-xs text-slate-500">On Time</p>
            <p class="mt-1 text-xl font-bold text-slate-950">{{ selectedRoute.onTime }}%</p>
          </div>
          <div class="metric-box p-4">
            <p class="text-xs text-slate-500">ETA Simulasi</p>
            <p class="mt-1 text-xl font-bold text-slate-950">{{ selectedRoute.eta }}</p>
          </div>
        </div>

        <div class="mt-5 overflow-hidden rounded-lg border border-slate-200">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-600">
              <tr>
                <th class="px-4 py-3 text-left">No. Armada</th>
                <th class="px-4 py-3 text-left">Lokasi</th>
                <th class="px-4 py-3 text-left">Penumpang</th>
                <th class="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bus in selectedRouteBuses" :key="bus.id" class="border-t border-slate-200">
                <td class="px-4 py-3 font-semibold text-slate-950">{{ bus.number }}</td>
                <td class="px-4 py-3 text-slate-600">{{ bus.location }}</td>
                <td class="px-4 py-3">{{ bus.passengers }}/{{ bus.capacity }}</td>
                <td class="px-4 py-3">{{ bus.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import TransitRouteMap from '../components/TransitRouteMap.vue'
import { activeBuses, transitRoutes } from '../../shared/data/mobilityData'
import { emptyTransitNetwork, TRANSIT_NETWORK_GEOJSON_PATH } from '../../shared/data/roadNetworkData.js'
import { api } from '../../shared/api/client'

const routes = ref(transitRoutes)
const buses = ref(activeBuses)
const transitNetwork = ref(emptyTransitNetwork)
const selectedRoute = ref(null)

const selectedRouteBuses = computed(() => {
  if (!selectedRoute.value) {
    return []
  }

  return buses.value.filter(bus => bus.routeId === selectedRoute.value.id)
})

const showRouteDetail = (route) => {
  selectedRoute.value = route
}

const loadLocalTransitNetwork = async () => {
  const response = await fetch(TRANSIT_NETWORK_GEOJSON_PATH)

  if (!response.ok) {
    throw new Error('Gagal memuat GeoJSON rute Bacitra lokal.')
  }

  return response.json()
}

onMounted(async () => {
  try {
    const [routeItems, busItems, transitNetworkData] = await Promise.all([
      api.getAdminRoutes(),
      api.getAdminBuses(),
      api.getAdminTransitNetwork()
    ])
    routes.value = routeItems
    buses.value = busItems
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

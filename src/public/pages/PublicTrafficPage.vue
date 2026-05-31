<template>
  <section class="space-y-6">
    <div class="card card-accent public-hero p-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">B-Connect Traffic</p>
          <h2 class="mt-1 text-2xl font-black text-slate-950">Pantauan lalu lintas kota</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Tampilan prototype ini dibuat menyerupai layanan pantau lalu lintas B-Connect, dengan titik kamera simulasi dan status ruas utama.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <span class="rounded-full bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700">CCTV simulasi</span>
          <span class="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">ATCS prototype</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
      <div class="card p-5">
        <p class="text-sm font-medium text-slate-500">Rata-rata Kepadatan</p>
        <p class="mt-3 text-3xl font-bold text-slate-950">{{ averageDensity }}%</p>
        <p class="mt-3 text-sm font-semibold text-amber-600">Simulasi real-time</p>
      </div>
      <div class="card p-5">
        <p class="text-sm font-medium text-slate-500">Ruas Padat</p>
        <p class="mt-3 text-3xl font-bold text-red-600">{{ heavyCount }}</p>
        <p class="mt-3 text-sm font-semibold text-slate-500">Perlu dihindari</p>
      </div>
      <div class="card p-5">
        <p class="text-sm font-medium text-slate-500">Kecepatan Rata-rata</p>
        <p class="mt-3 text-3xl font-bold text-emerald-600">{{ averageSpeed }} km/h</p>
        <p class="mt-3 text-sm font-semibold text-slate-500">Estimasi kota</p>
      </div>
    </div>

    <PublicMap mode="traffic" :traffic="filteredTraffic" :road-network="roadNetwork" />

    <section class="card p-6">
      <div class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.13em] text-cyan-700">Titik Pantau</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Kamera Lalu Lintas Terdekat</h2>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">3 dari {{ totalCctvCount }} kamera</span>
          <a
            href="#/traffic/cctv"
            class="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-100"
          >
            Lihat semua CCTV
          </a>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <button
          v-for="camera in cameraPoints"
          :key="camera.id"
          type="button"
          class="camera-feed-card"
          @click="openCamera(camera)"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.12em] text-cyan-700">{{ camera.code }}</p>
              <h3 class="mt-1 font-bold text-slate-950">{{ camera.name }}</h3>
            </div>
            <span :class="['rounded-full px-2.5 py-1 text-xs font-semibold', camera.statusClass]">{{ camera.status }}</span>
          </div>
          <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
            <img
              :src="camera.image"
              :alt="camera.name"
              class="h-40 w-full object-cover"
              loading="lazy"
            />
            <div class="absolute left-2 top-2 rounded-lg bg-slate-950/75 px-2 py-1 text-[0.65rem] font-bold text-white">
              Preview
            </div>
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-3">
              <p class="text-left text-sm font-black text-white">{{ camera.name }}</p>
            </div>
          </div>
          <p class="mt-3 text-left text-sm text-slate-600">{{ camera.note }}</p>
        </button>
      </div>
    </section>

    <section class="card p-6">
      <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-semibold text-cyan-700">Lalu Lintas</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Kondisi Ruas Jalan</h2>
        </div>
        <select v-model="filterLevel" class="form-input text-sm">
          <option value="">Semua Level</option>
          <option value="heavy">Padat</option>
          <option value="medium">Sedang</option>
          <option value="light">Lancar</option>
        </select>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article v-for="road in filteredTraffic" :key="road.id" class="card p-4">
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

    <div
      v-if="selectedCamera"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
      @click.self="closeCamera"
    >
      <section class="w-full max-w-5xl overflow-hidden rounded-2xl bg-slate-950 shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
              {{ selectedCamera.code }} - {{ selectedCamera.area }}
            </p>
            <h2 class="mt-1 text-xl font-black text-white">{{ selectedCamera.name }}</h2>
          </div>
          <button
            type="button"
            class="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/20"
            @click="closeCamera"
          >
            Tutup
          </button>
        </div>
        <div class="bg-black">
          <img
            :src="selectedCamera.image"
            :alt="selectedCamera.name"
            class="max-h-[72vh] w-full object-contain"
          />
        </div>
        <div class="flex flex-col gap-2 px-5 py-4 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <span>{{ selectedCamera.note }}</span>
          <span class="rounded-full bg-cyan-400/10 px-3 py-1 font-bold text-cyan-300">Simulasi B-Connect</span>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import PublicMap from '../components/PublicMap.vue'
import { trafficLocations } from '../../shared/data/mobilityData'
import { emptyRoadNetwork, ROAD_NETWORK_GEOJSON_PATH } from '../../shared/data/roadNetworkData.js'
import { cctvFeeds } from '../../shared/data/cctvData.js'
import { api } from '../../shared/api/client'

const traffic = ref(trafficLocations)
const roadNetwork = ref(emptyRoadNetwork)
const filterLevel = ref('')
const totalCctvCount = cctvFeeds.length
const cameraPoints = ref([...cctvFeeds].sort(() => Math.random() - 0.5).slice(0, 3))
const selectedCamera = ref(null)

const openCamera = (camera) => {
  selectedCamera.value = camera
}

const closeCamera = () => {
  selectedCamera.value = null
}

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

const loadLocalRoadNetwork = async () => {
  const response = await fetch(ROAD_NETWORK_GEOJSON_PATH)

  if (!response.ok) {
    throw new Error('Gagal memuat GeoJSON jalan lokal.')
  }

  return response.json()
}

onMounted(async () => {
  try {
    const [trafficData, roadNetworkData] = await Promise.all([
      api.getPublicTraffic(),
      api.getPublicRoadNetwork()
    ])
    traffic.value = trafficData
    roadNetwork.value = roadNetworkData
  } catch {
    traffic.value = trafficLocations
    try {
      roadNetwork.value = await loadLocalRoadNetwork()
    } catch {
      roadNetwork.value = emptyRoadNetwork
    }
  }
})
</script>

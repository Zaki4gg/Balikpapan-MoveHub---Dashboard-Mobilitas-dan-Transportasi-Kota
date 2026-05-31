<template>
  <div class="space-y-5">
    <section class="bconnect-panel p-5">
      <div class="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">B-Connect Command Center</p>
          <h2 class="mt-2 text-2xl font-black tracking-tight text-white">Monitoring ATCS dan CCTV Lalu Lintas</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-cyan-50/80">
            Tampilan ini meniru alur B-Connect untuk operator: membaca kondisi ruas, memantau titik kamera, dan menentukan prioritas penanganan kemacetan.
          </p>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div class="rounded-xl border border-white/10 bg-white/10 px-3 py-3">
            <p class="text-[0.65rem] font-bold uppercase tracking-wide text-cyan-100">CCTV</p>
            <p class="mt-1 text-xl font-black text-white">{{ totalCctvCount }}</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/10 px-3 py-3">
            <p class="text-[0.65rem] font-bold uppercase tracking-wide text-cyan-100">Ruas</p>
            <p class="mt-1 text-xl font-black text-white">{{ locations.length }}</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/10 px-3 py-3">
            <p class="text-[0.65rem] font-bold uppercase tracking-wide text-cyan-100">Padat</p>
            <p class="mt-1 text-xl font-black text-white">{{ heavyCount }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Map -->
    <TrafficCongestionMap :locations="filteredLocations" :road-network="roadNetwork" />

    <section class="card p-6">
      <div class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.13em] text-cyan-700">Pantauan CCTV</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Balikpapan Kota</h2>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">3 dari {{ totalCctvCount }} kamera</span>
          <button
            type="button"
            class="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-100"
            @click="$emit('openCctv')"
          >
            Lihat semua CCTV
          </button>
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
          <div class="mb-3 flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.14em] text-cyan-700">{{ camera.code }}</p>
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
              Live prototype
            </div>
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-3">
              <p class="text-left text-sm font-black text-white">{{ camera.name }}</p>
            </div>
          </div>
          <p class="mt-3 text-left text-sm text-slate-600">{{ camera.note }}</p>
        </button>
      </div>
    </section>

    <!-- Filter bar -->
    <div class="card p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">

        <!-- Search -->
        <div class="relative flex-1">
          <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400"
                v-html="searchIcon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari jalan atau lokasi..."
            class="form-input pl-9"
          />
        </div>

        <!-- Level filter -->
        <select v-model="filterLevel" class="form-input sm:w-44">
          <option value="">Semua Level</option>
          <option value="heavy">Kemacetan Berat</option>
          <option value="medium">Kemacetan Sedang</option>
          <option value="light">Lancar</option>
        </select>

        <!-- Result count chip -->
        <span class="shrink-0 rounded-xl border border-slate-200 bg-slate-50
                     px-3.5 py-2 text-xs font-semibold text-slate-500">
          {{ filteredLocations.length }} lokasi
        </span>

      </div>
    </div>

    <!-- Location cards -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div
        v-for="location in filteredLocations"
        :key="location.id"
        class="card p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg"
        :style="{ '--card-color': levelAccentColor[location.level] }"
      >
        <!-- Card header -->
        <div class="mb-4 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="truncate text-base font-bold text-slate-950">{{ location.name }}</h3>
            <p class="mt-0.5 text-sm text-slate-500">{{ location.description }}</p>
          </div>
          <span :class="['shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold', levelBadge[location.level]]">
            {{ levelLabels[location.level] }}
          </span>
        </div>

        <!-- Metrics -->
        <div class="mb-4 grid grid-cols-2 gap-3">
          <div class="metric-box px-3.5 py-3">
            <p class="text-xs font-medium text-slate-500">Kepadatan</p>
            <p class="mt-1 text-2xl font-black tracking-tight text-slate-950">
              {{ location.density }}<span class="ml-0.5 text-sm font-semibold text-slate-400">%</span>
            </p>
          </div>
          <div class="metric-box px-3.5 py-3">
            <p class="text-xs font-medium text-slate-500">Kecepatan Rata-rata</p>
            <p class="mt-1 text-2xl font-black tracking-tight text-slate-950">
              {{ location.avgSpeed }}<span class="ml-0.5 text-sm font-semibold text-slate-400">km/h</span>
            </p>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mb-3">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-medium text-slate-500">Tingkat kepadatan</span>
            <span class="text-xs font-bold text-slate-700">{{ location.density }}%</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              :class="['h-2 rounded-full transition-all duration-700', progressColor[location.level]]"
              :style="{ width: location.density + '%' }"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center gap-1.5 text-xs text-slate-400">
          <span v-html="clockIcon" />
          Diperbarui baru saja
        </div>

      </div>

      <!-- Empty state -->
      <div v-if="filteredLocations.length === 0"
           class="col-span-full card flex flex-col items-center justify-center gap-3 py-14 text-center">
        <span class="text-slate-300" v-html="emptyIcon" />
        <p class="font-semibold text-slate-500">Tidak ada lokasi yang cocok</p>
        <p class="text-sm text-slate-400">Coba ubah kata kunci atau filter level kemacetan.</p>
      </div>

    </div>

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
          <span class="rounded-full bg-emerald-400/10 px-3 py-1 font-bold text-emerald-300">Live preview prototype</span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import TrafficCongestionMap from '../components/TrafficCongestionMap.vue'
import { trafficLocations } from '../../shared/data/mobilityData'
import { emptyRoadNetwork, ROAD_NETWORK_GEOJSON_PATH } from '../../shared/data/roadNetworkData.js'
import { cctvFeeds } from '../../shared/data/cctvData.js'
import { api } from '../../shared/api/client'

defineEmits(['openCctv'])

const searchQuery = ref('')
const filterLevel = ref('')
const locations   = ref(trafficLocations)
const roadNetwork = ref(emptyRoadNetwork)
const totalCctvCount = cctvFeeds.length
const cameraPoints = ref([...cctvFeeds].sort(() => Math.random() - 0.5).slice(0, 3))
const selectedCamera = ref(null)

const openCamera = (camera) => {
  selectedCamera.value = camera
}

const closeCamera = () => {
  selectedCamera.value = null
}

const levelLabels = {
  heavy:  'Berat',
  medium: 'Sedang',
  light:  'Ringan',
}

const levelBadge = {
  heavy:  'bg-rose-50 text-rose-700',
  medium: 'bg-amber-50 text-amber-700',
  light:  'bg-emerald-50 text-emerald-700',
}

const progressColor = {
  heavy:  'bg-rose-500',
  medium: 'bg-amber-400',
  light:  'bg-emerald-500',
}

const levelAccentColor = {
  heavy:  '#f43f5e',
  medium: '#f59e0b',
  light:  '#10b981',
}

const filteredLocations = computed(() =>
  locations.value.filter((loc) => {
    const q = searchQuery.value.toLowerCase()
    const matchSearch = loc.name.toLowerCase().includes(q) ||
                        loc.description.toLowerCase().includes(q)
    const matchLevel  = !filterLevel.value || loc.level === filterLevel.value
    return matchSearch && matchLevel
  })
)

const heavyCount = computed(() => locations.value.filter((location) => location.level === 'heavy').length)

const searchIcon = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75"
  stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
  <circle cx="8.5" cy="8.5" r="5.5"/><path d="M15 15l3 3"/>
</svg>`

const clockIcon = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"
  stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
  <circle cx="8" cy="8" r="6.5"/><path d="M8 4.5v3.5l2 1.5"/>
</svg>`

const emptyIcon = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"
  stroke-linecap="round" stroke-linejoin="round" class="h-12 w-12">
  <circle cx="21" cy="21" r="16"/><path d="M33 33l10 10"/>
  <path d="M15 21h12M21 15v12"/>
</svg>`

const loadLocalRoadNetwork = async () => {
  const res = await fetch(ROAD_NETWORK_GEOJSON_PATH)
  if (!res.ok) throw new Error('Gagal memuat GeoJSON jalan lokal.')
  return res.json()
}

onMounted(async () => {
  try {
    const [trafficData, roadNetworkData] = await Promise.all([
      api.getAdminTraffic(),
      api.getAdminRoadNetwork(),
    ])
    locations.value   = trafficData
    roadNetwork.value = roadNetworkData
  } catch {
    locations.value = trafficLocations
    try {
      roadNetwork.value = await loadLocalRoadNetwork()
    } catch {
      roadNetwork.value = emptyRoadNetwork
    }
  }
})
</script>


<template>
  <section class="space-y-6">
    <div class="bacitra-home-card">
      <div class="flex flex-col gap-6 xl:flex-row xl:items-stretch">
        <div class="flex-1">
          <div class="mb-6 flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
              <span v-html="busIcon"></span>
            </div>
            <div>
              <p class="text-2xl font-black leading-none text-red-600">BACITRA</p>
              <p class="text-sm font-bold text-blue-700">Balikpapan City Trans</p>
            </div>
          </div>

          <h2 class="text-2xl font-black text-slate-950">Halo, mau kemana hari ini?</h2>
          <p class="mt-2 max-w-xl text-base leading-7 text-slate-600">
            Tentukan koridor tujuanmu dan dashboard akan menampilkan rute, shelter, armada, serta estimasi perjalanan secara simulatif.
          </p>

          <div class="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <button
              v-for="shortcut in shortcuts"
              :key="shortcut.label"
              type="button"
              :class="['bacitra-shortcut', activeFeature === shortcut.target ? 'bacitra-shortcut--active' : '']"
              @click="activeFeature = shortcut.target"
            >
              <span class="bacitra-shortcut-icon" v-html="shortcut.icon"></span>
              <span>{{ shortcut.label }}</span>
            </button>
          </div>
        </div>

        <div class="bacitra-promo">
          <p class="text-xs font-black uppercase tracking-[0.16em] text-white/80">Live Route Prototype</p>
          <h3 class="mt-2 text-2xl font-black text-white">Lihat Informasi Rute & Pantau Bus Real-time</h3>
          <p class="mt-3 text-sm leading-6 text-blue-50">
            Lihat posisi bus, estimasi waktu tiba, dan informasi semua rute yang sedang beroperasi langsung dari dashboard publik.
          </p>
        </div>
      </div>
    </div>

    <section v-if="activeFeature === 'all-bus'" class="bacitra-all-bus-panel">
      <PublicMap
        mode="transit"
        :routes="allBusMapRoutes"
        :buses="allBusMapBuses"
        :user-location="userLocation"
        :transit-network="emptyTransitNetwork"
      />

      <div class="bacitra-all-bus-sheet">
        <div>
          <p class="text-sm font-semibold text-red-600">Semua Bus</p>
          <h2 class="mt-1 text-xl font-black text-slate-950">Pantauan Seluruh Koridor Bacitra</h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Semua jalur koridor ditampilkan dalam satu peta untuk simulasi pemantauan armada yang sedang beroperasi.
          </p>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
          <article v-for="corridor in corridors" :key="corridor.id" class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <span :class="['rounded-lg px-2.5 py-1 text-xs font-black', corridor.tagClass]">{{ corridor.code }}</span>
              <span class="text-sm font-black text-slate-950">{{ corridor.buses }} Bus</span>
            </div>
            <p class="mt-2 text-xs font-semibold text-slate-500">{{ corridor.shelters }} Halte</p>
          </article>
        </div>

        <button
          type="button"
          class="mt-5 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-800"
          @click="activeFeature = 'route'"
        >
          Kembali ke Info Rute
        </button>
      </div>
    </section>

    <section v-else-if="activeFeature === 'nearest'" class="bacitra-nearest-panel">
      <PublicMap
        mode="transit"
        :routes="nearestMapRoutes"
        :buses="nearestMapBuses"
        :user-location="userLocation"
        :transit-network="emptyTransitNetwork"
      />

      <div class="bacitra-nearest-sheet">
        <div class="bacitra-nearest-location">
          <span class="shrink-0 text-white" v-html="locationIcon"></span>
          <div>
            <p class="text-sm font-semibold text-white/85">Lokasi anda sekarang</p>
            <h2 class="text-xl font-black text-white">Batu Ampar, Kalimantan Timur, Indonesia</h2>
          </div>
        </div>

        <div class="bacitra-nearest-empty">
          <div class="bacitra-empty-illustration">
            <span></span>
          </div>
          <h3 class="mt-4 text-xl font-black text-slate-950">Bus terdekat belum terdeteksi</h3>
          <p class="mt-2 max-w-md text-center text-sm leading-6 text-slate-500">
            Prototype menampilkan simulasi lokasi pengguna. Data bus terdekat akan muncul saat armada aktif melewati radius halte sekitar Batu Ampar.
          </p>
          <button
            type="button"
            class="mt-5 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-800"
            @click="activeFeature = 'route'"
          >
            Kembali ke Info Rute
          </button>
        </div>
      </div>
    </section>

    <section v-else-if="activeFeature === 'ar-shelter'" class="bacitra-ar-panel">
      <div class="bacitra-ar-view">
        <div class="bacitra-ar-topbar">
          <button type="button" class="bacitra-ar-back" @click="activeFeature = 'route'">
            <span v-html="backIcon"></span>
          </button>
          <div>
            <p class="text-xs font-black uppercase tracking-[0.16em] text-white/70">Mode AR Prototype</p>
            <h2 class="text-xl font-black text-white">AR Shelter</h2>
          </div>
        </div>

        <div class="bacitra-ar-reticle">
          <span></span>
        </div>

        <div class="bacitra-ar-direction">
          <span class="bacitra-ar-arrow" v-html="navigationIcon"></span>
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-amber-200">Shelter terdekat</p>
            <h3 class="text-2xl font-black text-white">{{ nearestShelter.name }}</h3>
            <p class="text-sm font-semibold text-white/80">{{ nearestShelter.distance }} - {{ nearestShelter.walkTime }}</p>
          </div>
        </div>

        <div class="bacitra-ar-marker bacitra-ar-marker--primary">
          <span class="bacitra-ar-pin" v-html="shelterIcon"></span>
          <div>
            <p class="text-xs font-bold text-white/70">Arah halte</p>
            <p class="font-black text-white">{{ nearestShelter.nextBus }} lagi</p>
          </div>
        </div>

        <div class="bacitra-ar-status">
          <span class="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-200">Simulasi kamera</span>
          <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">GPS Prototype</span>
        </div>
      </div>

      <div class="bacitra-ar-sheet">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-sm font-semibold text-red-600">AR Shelter</p>
            <h2 class="mt-1 text-xl font-black text-slate-950">Panduan Menuju Shelter</h2>
            <p class="mt-2 text-sm leading-6 text-slate-600">
              Prototype menggambarkan fitur kamera AR untuk mengarahkan pengguna menuju halte terdekat.
            </p>
          </div>
          <button
            type="button"
            class="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-800"
            @click="activeFeature = 'route'"
          >
            Kembali ke Info Rute
          </button>
        </div>

        <div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <article v-for="shelter in arShelters" :key="shelter.id" class="public-list-item p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-black uppercase tracking-[0.13em] text-cyan-700">{{ shelter.corridor }}</p>
                <h3 class="mt-1 font-bold text-slate-950">{{ shelter.name }}</h3>
                <p class="mt-1 text-sm text-slate-600">{{ shelter.distance }} - {{ shelter.walkTime }}</p>
              </div>
              <span :class="['rounded-full px-2.5 py-1 text-xs font-semibold', shelter.statusClass]">{{ shelter.status }}</span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="routeId in shelter.routeIds"
                :key="routeId"
                class="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-black text-red-700"
              >
                Route {{ routeId }}
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section v-else class="grid grid-cols-1 gap-6 xl:grid-cols-[0.82fr_1.18fr]">
      <div class="card p-5">
        <div class="mb-5 flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-red-600">Info Rute</p>
            <h2 class="mt-1 text-xl font-black text-slate-950">Balikpapan City Trans</h2>
          </div>
          <span class="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">06:00 - 20:00 WITA</span>
        </div>

        <div class="space-y-3">
          <button
            v-for="corridor in corridors"
            :key="corridor.id"
            type="button"
            :class="[
              'bacitra-route-card',
              selectedCorridor.id === corridor.id ? 'bacitra-route-card--active' : ''
            ]"
            :style="{ '--corridor-color': corridor.color }"
            @click="selectedCorridor = corridor"
          >
            <span :class="['bacitra-route-code', corridor.tagClass]">{{ corridor.code }}</span>
            <span class="min-w-0 flex-1 text-left">
              <span class="block font-black text-slate-950">{{ corridor.from }} &gt; {{ corridor.to }}</span>
              <span class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-red-700">
                <span>Operasional Time</span>
                <span class="text-slate-600">06:00 - 20:00 WITA</span>
              </span>
            </span>
          </button>
        </div>
      </div>

      <div class="bacitra-route-preview">
        <PublicMap
          mode="transit"
          :routes="selectedMapRoutes"
          :buses="selectedMapBuses"
          :transit-network="emptyTransitNetwork"
        />

        <div class="bacitra-route-sheet">
          <div class="rounded-t-2xl bg-red-700 px-5 py-4 text-white">
            <div class="flex flex-wrap items-center gap-4 text-sm font-bold">
              <span class="inline-flex items-center gap-2">
                <span v-html="clockIcon"></span>
                OPERASIONAL 06:00 - 20:00 WITA
              </span>
              <span class="inline-flex items-center gap-2">
                <span v-html="miniBusIcon"></span>
                KORIDOR {{ selectedCorridor.code }} ({{ selectedCorridor.buses }} Bus - {{ selectedCorridor.shelters }} Halte)
              </span>
            </div>
          </div>

          <div class="bg-white px-5 py-5">
            <div class="rounded-2xl bg-slate-50 p-4">
              <div class="flex items-center justify-between gap-4">
                <div class="min-w-0 flex-1 space-y-3">
                  <p class="truncate text-base font-semibold text-slate-950">{{ selectedCorridor.from }}</p>
                  <div class="h-px bg-slate-200"></div>
                  <p class="truncate text-base font-semibold text-slate-950">{{ selectedCorridor.to }}</p>
                </div>
                <button type="button" class="rounded-xl bg-red-50 p-3 text-red-600" title="Tukar arah">
                  <span v-html="swapIcon"></span>
                </button>
              </div>
            </div>

            <div v-if="selectedCorridor.busCodes.length" class="mt-4 flex gap-3 overflow-x-auto pb-1">
              <span
                v-for="code in selectedCorridor.busCodes"
                :key="code"
                class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-red-700 shadow-sm ring-1 ring-slate-100"
              >
                <span v-html="miniBusIcon"></span>
                {{ code }}
              </span>
            </div>
            <p v-else class="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
              Belum ada armada aktif pada koridor ini.
            </p>

            <ol class="bacitra-stop-list mt-6">
              <li v-for="stop in selectedCorridor.stops" :key="stop">
                <span class="bacitra-stop-dot"></span>
                <div>
                  <p class="font-bold text-slate-950">{{ stop }}</p>
                  <div v-if="stop === 'Perintis' || stop === 'Perumahan Ramayana'" class="mt-2 flex gap-2">
                    <span class="rounded px-3 py-1 text-xs font-black text-white" :class="corridorTag('B')">B</span>
                    <span class="rounded px-3 py-1 text-xs font-black text-white" :class="corridorTag('K2B')">K2B</span>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <section class="card p-6">
      <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm font-semibold text-cyan-700">Halte Terdekat</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Cari Shelter dan Estimasi Kedatangan</h2>
        </div>
        <div class="relative w-full lg:max-w-md">
          <input
            v-model="shelterQuery"
            type="text"
            class="form-input"
            placeholder="Cari halte, koridor, atau rute..."
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="shelter in filteredShelters" :key="shelter.id" class="public-list-item p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.13em] text-cyan-700">{{ shelter.corridor }}</p>
              <h3 class="mt-1 font-bold text-slate-950">{{ shelter.name }}</h3>
              <p class="mt-1 text-sm text-slate-600">{{ shelter.distance }} - {{ shelter.walkTime }}</p>
            </div>
            <span :class="['rounded-full px-2.5 py-1 text-xs font-semibold', shelter.statusClass]">{{ shelter.status }}</span>
          </div>
          <div class="mt-4 flex items-center justify-between rounded-xl bg-white px-3 py-3">
            <span class="text-sm font-semibold text-slate-600">Bus berikutnya</span>
            <span class="text-lg font-black text-cyan-700">{{ shelter.nextBus }}</span>
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
import { bacitraCorridors, bacitraShelters } from '../../shared/data/bacitraData.js'
import { api } from '../../shared/api/client'

const routes = ref(transitRoutes)
const buses = ref(activeBuses)
const transitNetwork = ref(emptyTransitNetwork)
const shelterQuery = ref('')
const corridors = bacitraCorridors
const selectedCorridor = ref(bacitraCorridors[4])
const activeFeature = ref('route')
const userLocation = {
  name: 'Lokasi anda sekarang',
  description: 'Batu Ampar, Kalimantan Timur, Indonesia',
  coordinates: [116.8294, -1.2347]
}

const selectedMapRoutes = computed(() => [
  {
    id: selectedCorridor.value.routeId,
    name: `Koridor ${selectedCorridor.value.code}`,
    shortName: selectedCorridor.value.code,
    route: `${selectedCorridor.value.from} > ${selectedCorridor.value.to}`,
    status: 'active',
    fleet: selectedCorridor.value.buses,
    passengers: 0,
    onTime: 94,
    eta: '7 menit',
    color: '#111827',
    appStyle: true,
    path: selectedCorridor.value.path
  }
])

const selectedMapBuses = computed(() =>
  selectedCorridor.value.busCodes.map((code, index) => ({
    id: `${selectedCorridor.value.id}-${code}`,
    number: code,
    route: `Koridor ${selectedCorridor.value.code}`,
    routeId: selectedCorridor.value.routeId,
    location: selectedCorridor.value.stops[Math.min(index + 1, selectedCorridor.value.stops.length - 1)],
    passengers: 22 + (index * 5),
    capacity: 50,
    status: 'On Schedule',
    eta: `${6 + (index * 3)} menit`,
    coordinates: selectedCorridor.value.path[Math.min(index + 1, selectedCorridor.value.path.length - 1)]
  }))
)

const allBusMapRoutes = computed(() =>
  bacitraCorridors.map((corridor) => ({
    id: corridor.routeId,
    name: `Koridor ${corridor.code}`,
    shortName: corridor.code,
    route: `${corridor.from} > ${corridor.to}`,
    status: 'active',
    fleet: corridor.buses,
    passengers: 0,
    onTime: 94,
    eta: '7 menit',
    color: corridor.color,
    path: corridor.path
  }))
)

const allBusMapBuses = computed(() =>
  bacitraCorridors.flatMap((corridor) =>
    corridor.busCodes.slice(0, 3).map((code, index) => ({
      id: `all-${corridor.id}-${code}`,
      number: code,
      route: `Koridor ${corridor.code}`,
      routeId: corridor.routeId,
      location: corridor.stops[Math.min(index + 1, corridor.stops.length - 1)],
      passengers: 16 + (index * 8),
      capacity: 50,
      status: 'On Schedule',
      eta: `${5 + (index * 4)} menit`,
      coordinates: corridor.path[Math.min(index + 1, corridor.path.length - 1)]
    }))
  )
)

const nearestMapRoutes = computed(() =>
  bacitraCorridors
    .filter((corridor) => ['corridor-k2b', 'corridor-k2a', 'corridor-k1'].includes(corridor.id))
    .map((corridor) => ({
      id: corridor.routeId,
      name: `Koridor ${corridor.code}`,
      shortName: corridor.code,
      route: `${corridor.from} > ${corridor.to}`,
      status: 'active',
      fleet: corridor.buses,
      passengers: 0,
      onTime: 94,
      eta: '7 menit',
      color: corridor.color,
      path: corridor.path
    }))
)

const nearestMapBuses = computed(() =>
  bacitraCorridors
    .filter((corridor) => ['corridor-k2b', 'corridor-k2a'].includes(corridor.id))
    .flatMap((corridor) =>
      corridor.busCodes.slice(0, 2).map((code, index) => ({
        id: `near-${corridor.id}-${code}`,
        number: code,
        route: `Koridor ${corridor.code}`,
        routeId: corridor.routeId,
        location: corridor.stops[Math.min(index + 2, corridor.stops.length - 1)],
        passengers: 18 + (index * 7),
        capacity: 50,
        status: 'On Schedule',
        eta: `${8 + (index * 4)} menit`,
        coordinates: corridor.path[Math.min(index + 2, corridor.path.length - 1)]
      }))
    )
)

const filteredShelters = computed(() => {
  const query = shelterQuery.value.toLowerCase()

  return bacitraShelters.filter((shelter) => {
    const routeNames = shelter.routeIds.map((routeId) => `route ${routeId}`).join(' ')
    return `${shelter.name} ${shelter.corridor} ${routeNames}`.toLowerCase().includes(query)
  })
})
const arShelters = computed(() => bacitraShelters.slice(0, 3))
const nearestShelter = computed(() => arShelters.value[0])

const corridorTag = (code) => {
  if (code === 'B') return 'bg-pink-500'
  if (code === 'K2B') return 'bg-amber-500'
  return 'bg-green-500'
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

const busIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
  <rect x="5" y="4" width="14" height="13" rx="3"/><path d="M8 8h8M8 12h8"/><path d="M8 20l1.5-3M16 20l-1.5-3"/>
</svg>`

const miniBusIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
  <rect x="5" y="4" width="14" height="13" rx="3"/><path d="M8 8h8M8 12h8"/><path d="M8 20l1.5-3M16 20l-1.5-3"/>
</svg>`

const clockIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
  <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
</svg>`

const swapIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
  <path d="M7 7h11l-3-3"/><path d="M17 17H6l3 3"/><path d="M18 7l-3 3"/><path d="M6 17l3-3"/>
</svg>`

const locationIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7">
  <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>
</svg>`

const backIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
  <path d="M15 18l-6-6 6-6"/>
</svg>`

const navigationIcon = `<svg viewBox="0 0 24 24" fill="currentColor" class="h-9 w-9">
  <path d="M12.9 3.55a1 1 0 0 0-1.8 0L3.35 20.1a1 1 0 0 0 1.31 1.3l7.34-3.1 7.34 3.1a1 1 0 0 0 1.31-1.3L12.9 3.55Z"/>
</svg>`

const shelterIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
  <path d="M5 20V6h14v14"/><path d="M8 10h8M8 14h8"/><path d="M4 6h16"/>
</svg>`

const icons = {
  allBus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8"><rect x="5" y="4" width="14" height="13" rx="3"/><path d="M8 8h8M8 12h8M8 20l1.5-3M16 20l-1.5-3"/></svg>`,
  route: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8"><rect x="7" y="3" width="10" height="18" rx="2"/><path d="M10 7h4"/><circle cx="12" cy="15" r="2"/></svg>`,
  nearest: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8"><path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"/><rect x="9" y="8" width="6" height="5" rx="1"/></svg>`,
  shelter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8"><path d="M5 20V6h14v14"/><path d="M8 10h8M8 14h8"/><path d="M4 6h16"/></svg>`
}

const shortcuts = [
  { label: 'Semua Bus', icon: icons.allBus, target: 'all-bus' },
  { label: 'Info Rute', icon: icons.route, target: 'route' },
  { label: 'Bus Terdekat', icon: icons.nearest, target: 'nearest' },
  { label: 'AR Shelter', icon: icons.shelter, target: 'ar-shelter' }
]
</script>

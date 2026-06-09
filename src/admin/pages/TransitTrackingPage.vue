<template>
  <div class="space-y-6">
    <section class="bconnect-panel p-5">
      <div class="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Bacitra Operations</p>
          <h2 class="mt-2 text-2xl font-black tracking-tight text-white">Command Center Balikpapan City Trans</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-cyan-50/80">
            Panel admin untuk simulasi pemantauan koridor, armada aktif, estimasi halte, dan tindak lanjut operasional Bacitra.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div class="rounded-xl border border-white/10 bg-white/10 px-3 py-3">
            <p class="text-[0.65rem] font-bold uppercase tracking-wide text-cyan-100">Jam Layanan</p>
            <p class="mt-1 text-sm font-black text-white">{{ serviceInfo.operatingHour }}</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/10 px-3 py-3">
            <p class="text-[0.65rem] font-bold uppercase tracking-wide text-cyan-100">Mode</p>
            <p class="mt-1 text-sm font-black text-white">{{ mapModeLabel }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="card p-4">
        <p class="text-sm text-slate-600">Koridor Terpantau</p>
        <p class="mt-2 text-3xl font-black text-cyan-700">{{ corridors.length }}</p>
        <p class="mt-1 text-xs text-slate-500">A, B, K1, K2A, K2B</p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-slate-600">Armada Aktif</p>
        <p class="mt-2 text-3xl font-black text-emerald-600">{{ totalActiveBuses }}</p>
        <p class="mt-1 text-xs text-slate-500">Simulasi bus berjalan</p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-slate-600">Total Halte</p>
        <p class="mt-2 text-3xl font-black text-amber-600">{{ totalShelters }}</p>
        <p class="mt-1 text-xs text-slate-500">Dari semua koridor</p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-slate-600">Tindak Lanjut</p>
        <p class="mt-2 text-3xl font-black text-rose-600">{{ operationalQueue.length }}</p>
        <p class="mt-1 text-xs text-slate-500">Queue operator</p>
      </div>
    </div>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[0.78fr_1.22fr]">
      <div class="card p-5">
        <div class="mb-5 flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-cyan-700">Kontrol Koridor</p>
            <h2 class="mt-1 text-xl font-black text-slate-950">Pantauan Rute Bacitra</h2>
          </div>
          <button
            type="button"
            :class="[
              'rounded-xl px-3 py-2 text-xs font-black transition',
              mapMode === 'all' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            ]"
            @click="showAllCorridors"
          >
            Semua Bus
          </button>
        </div>

        <div class="space-y-3">
          <button
            v-for="corridor in corridors"
            :key="corridor.id"
            type="button"
            :class="[
              'bacitra-route-card',
              selectedCorridor.id === corridor.id && mapMode === 'single' ? 'bacitra-route-card--active' : ''
            ]"
            :style="{ '--corridor-color': corridor.color }"
            @click="selectCorridor(corridor)"
          >
            <span :class="['bacitra-route-code', corridor.tagClass]">{{ corridor.code }}</span>
            <span class="min-w-0 flex-1 text-left">
              <span class="block font-black text-slate-950">{{ corridor.from }} &gt; {{ corridor.to }}</span>
              <span class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-500">
                <span>{{ corridor.buses }} bus</span>
                <span>{{ corridor.shelters }} halte</span>
                <span class="text-red-700">06:00 - 20:00 WITA</span>
              </span>
            </span>
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <TransitRouteMap :routes="visibleRoutes" :buses="visibleBuses" :transit-network="emptyTransitNetwork" />

        <div class="card overflow-hidden">
          <div class="bg-slate-950 px-5 py-4 text-white">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">{{ mapModeLabel }}</p>
                <h3 class="mt-1 text-xl font-black">{{ currentPanelTitle }}</h3>
              </div>
              <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                {{ visibleBuses.length }} armada tampil
              </span>
            </div>
          </div>

          <div class="grid gap-4 bg-white p-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div class="rounded-2xl bg-slate-50 p-4">
              <p class="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Rute Terpilih</p>
              <p class="mt-3 text-base font-bold text-slate-950">{{ currentRouteDescription }}</p>
              <div v-if="mapMode === 'single'" class="mt-4 flex gap-3 overflow-x-auto pb-1">
                <span
                  v-for="code in selectedCorridor.busCodes"
                  :key="code"
                  class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-red-700 shadow-sm ring-1 ring-slate-100"
                >
                  <span v-html="miniBusIcon"></span>
                  {{ code }}
                </span>
                <span v-if="selectedCorridor.busCodes.length === 0" class="text-sm font-semibold text-slate-500">
                  Belum ada armada aktif pada koridor ini.
                </span>
              </div>
            </div>

            <ol v-if="mapMode === 'single'" class="bacitra-stop-list">
              <li v-for="stop in selectedCorridor.stops" :key="stop">
                <span class="bacitra-stop-dot"></span>
                <div>
                  <p class="font-bold text-slate-950">{{ stop }}</p>
                  <p class="text-sm text-slate-500">Checkpoint shelter operator</p>
                </div>
              </li>
            </ol>

            <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-3">
              <article v-for="corridor in corridors" :key="corridor.id" class="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span :class="['rounded-lg px-2.5 py-1 text-xs font-black', corridor.tagClass]">{{ corridor.code }}</span>
                <p class="mt-3 text-xl font-black text-slate-950">{{ corridor.buses }}</p>
                <p class="text-xs font-semibold text-slate-500">bus aktif - {{ corridor.shelters }} halte</p>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_0.8fr]">
      <div class="card p-6">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-cyan-700">Shelter Watch</p>
            <h2 class="mt-1 text-xl font-bold text-slate-950">Estimasi Kedatangan Shelter</h2>
          </div>
          <span class="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">{{ shelters.length }} shelter prioritas</span>
        </div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <article v-for="shelter in shelters" :key="shelter.id" class="public-list-item p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-black uppercase tracking-[0.13em] text-cyan-700">{{ shelter.corridor }}</p>
                <h3 class="mt-1 font-bold text-slate-950">{{ shelter.name }}</h3>
                <p class="mt-1 text-sm text-slate-600">Bus berikutnya {{ shelter.nextBus }}</p>
              </div>
              <span :class="['rounded-full px-2.5 py-1 text-xs font-semibold', shelter.statusClass]">{{ shelter.status }}</span>
            </div>
          </article>
        </div>
      </div>

      <div class="card p-6">
        <div class="mb-4">
          <p class="text-sm font-semibold text-cyan-700">Queue Operator</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Tindak Lanjut Operasional</h2>
        </div>
        <div class="space-y-3">
          <article v-for="item in operationalQueue" :key="item.id" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="font-bold text-slate-950">{{ item.item }}</h3>
                <p class="mt-1 text-sm text-slate-600">{{ item.owner }} - {{ item.status }}</p>
              </div>
              <span :class="['rounded-full px-2.5 py-1 text-xs font-semibold', item.priority === 'Tinggi' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700']">
                {{ item.priority }}
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="card p-6">
      <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold text-cyan-700">Fleet Monitor</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Pelacakan Armada Simulasi</h2>
        </div>
        <select v-model="fleetFilter" class="form-input md:w-52">
          <option value="">Semua Koridor</option>
          <option v-for="corridor in corridors" :key="corridor.id" :value="corridor.code">Koridor {{ corridor.code }}</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b-2 border-slate-300 text-slate-600">
              <th class="px-4 py-3 text-left">No. Armada</th>
              <th class="px-4 py-3 text-left">Koridor</th>
              <th class="px-4 py-3 text-left">Lokasi</th>
              <th class="px-4 py-3 text-left">Penumpang</th>
              <th class="px-4 py-3 text-left">ETA</th>
              <th class="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bus in filteredFleet" :key="bus.id" class="border-b border-slate-200 hover:bg-slate-50">
              <td class="px-4 py-3 font-semibold text-slate-950">{{ bus.number }}</td>
              <td class="px-4 py-3">
                <span :class="['rounded-lg px-2.5 py-1 text-xs font-black', bus.tagClass]">{{ bus.corridorCode }}</span>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ bus.location }}</td>
              <td class="px-4 py-3">{{ bus.passengers }}/{{ bus.capacity }}</td>
              <td class="px-4 py-3 font-bold text-cyan-700">{{ bus.eta }}</td>
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
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import TransitRouteMap from '../components/TransitRouteMap.vue'
import { emptyTransitNetwork } from '../../shared/data/roadNetworkData.js'
import {
  bacitraCorridors,
  bacitraOperationalQueue,
  bacitraServiceInfo,
  bacitraShelters
} from '../../shared/data/bacitraData.js'

const corridors = bacitraCorridors
const shelters = bacitraShelters
const serviceInfo = bacitraServiceInfo
const operationalQueue = bacitraOperationalQueue
const getInitialCorridor = () => {
  const requestedCorridor = sessionStorage.getItem('smart-mobility-selected-corridor')
  return bacitraCorridors.find((corridor) => corridor.id === requestedCorridor) || bacitraCorridors[4]
}
const selectedCorridor = ref(getInitialCorridor())
const mapMode = ref('single')
const fleetFilter = ref('')

const corridorToRoute = (corridor, forceBlack = false) => ({
  id: corridor.routeId,
  name: `Koridor ${corridor.code}`,
  shortName: corridor.code,
  route: `${corridor.from} > ${corridor.to}`,
  status: 'active',
  fleet: corridor.buses,
  passengers: 0,
  onTime: 94,
  eta: '7 menit',
  color: forceBlack ? '#111827' : corridor.color,
  path: corridor.path
})

const busesForCorridor = (corridor) =>
  corridor.busCodes.map((code, index) => ({
    id: `${corridor.id}-${code}`,
    number: code,
    route: `Koridor ${corridor.code}`,
    routeId: corridor.routeId,
    corridorCode: corridor.code,
    tagClass: corridor.tagClass,
    location: corridor.stops[Math.min(index + 1, corridor.stops.length - 1)],
    passengers: 18 + (index * 6),
    capacity: 50,
    status: index === 3 ? 'Delayed (4 min)' : 'On Schedule',
    eta: `${6 + (index * 3)} menit`,
    coordinates: corridor.path[Math.min(index + 1, corridor.path.length - 1)]
  }))

const allFleet = computed(() => corridors.flatMap(busesForCorridor))
const totalActiveBuses = computed(() => corridors.reduce((total, corridor) => total + corridor.buses, 0))
const totalShelters = computed(() => corridors.reduce((total, corridor) => total + corridor.shelters, 0))
const visibleRoutes = computed(() =>
  mapMode.value === 'all'
    ? corridors.map((corridor) => corridorToRoute(corridor))
    : [corridorToRoute(selectedCorridor.value, true)]
)
const visibleBuses = computed(() =>
  mapMode.value === 'all'
    ? allFleet.value
    : busesForCorridor(selectedCorridor.value)
)
const filteredFleet = computed(() =>
  fleetFilter.value
    ? allFleet.value.filter((bus) => bus.corridorCode === fleetFilter.value)
    : allFleet.value
)
const mapModeLabel = computed(() => mapMode.value === 'all' ? 'Semua Koridor' : `Koridor ${selectedCorridor.value.code}`)
const currentPanelTitle = computed(() =>
  mapMode.value === 'all'
    ? 'Pantauan Seluruh Koridor Bacitra'
    : `${selectedCorridor.value.from} > ${selectedCorridor.value.to}`
)
const currentRouteDescription = computed(() =>
  mapMode.value === 'all'
    ? 'Operator melihat seluruh jalur Bacitra aktif untuk memantau persebaran armada dan potensi keterlambatan.'
    : `${selectedCorridor.value.from} menuju ${selectedCorridor.value.to}`
)

const selectCorridor = (corridor) => {
  selectedCorridor.value = corridor
  sessionStorage.setItem('smart-mobility-selected-corridor', corridor.id)
  mapMode.value = 'single'
}

const showAllCorridors = () => {
  mapMode.value = 'all'
}

const miniBusIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
  <rect x="5" y="4" width="14" height="13" rx="3"/><path d="M8 8h8M8 12h8"/><path d="M8 20l1.5-3M16 20l-1.5-3"/>
</svg>`
</script>

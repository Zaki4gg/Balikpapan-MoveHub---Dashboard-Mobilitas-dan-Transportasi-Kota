<template>
  <section class="space-y-6">
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <KPICard
        title="Kemacetan Aktif"
        value="12"
        unit="lokasi"
        icon="L"
        color="bg-rose-50 text-rose-600"
        :trend="8"
      />
      <KPICard
        title="Armada Operasional"
        value="156"
        unit="unit"
        icon="B"
        color="bg-sky-50 text-sky-600"
        :trend="2"
      />
      <KPICard
        title="Rata-rata Waktu Tempuh"
        value="45"
        unit="menit"
        icon="W"
        color="bg-amber-50 text-amber-600"
        :trend="-5"
      />
      <KPICard
        title="Laporan Aktif"
        value="28"
        unit="laporan"
        icon="R"
        color="bg-emerald-50 text-emerald-600"
        :trend="12"
      />
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div class="xl:col-span-2">
        <DashboardMap />
      </div>

      <aside class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-cyan-700">Live Feed</p>
            <h2 class="mt-1 text-xl font-bold text-slate-950">Status Real-time</h2>
          </div>
          <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Aktif</span>
        </div>

        <div class="space-y-4">
          <div
            v-for="status in trafficStatus"
            :key="status.location"
            class="rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-slate-950">{{ status.level }}</p>
                <p class="mt-1 text-sm text-slate-600">{{ status.location }}</p>
              </div>
              <span :class="['h-3 w-3 shrink-0 rounded-full', status.color]"></span>
            </div>
            <div class="mt-4 h-2 rounded-full bg-slate-200">
              <div :class="['h-2 rounded-full', status.color]" :style="{ width: status.density + '%' }"></div>
            </div>
            <p class="mt-2 text-xs font-medium text-slate-500">Density: {{ status.density }}%</p>
          </div>
        </div>
      </aside>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-cyan-700">Analitik</p>
            <h2 class="mt-1 text-xl font-bold text-slate-950">Trend Kemacetan 24 Jam</h2>
          </div>
        </div>
        <TrafficChart />
      </section>

      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-cyan-700">Bacitra</p>
            <h2 class="mt-1 text-xl font-bold text-slate-950">Status Transportasi Publik</h2>
          </div>
          <span class="text-sm font-semibold text-slate-500">4 rute</span>
        </div>

        <div class="space-y-3">
          <div
            v-for="route in transitStatus"
            :key="route.name"
            class="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <div>
              <p class="font-semibold text-slate-950">{{ route.name }}</p>
              <p class="text-xs text-slate-500">{{ route.fleet }} armada aktif</p>
            </div>
            <span :class="[
              'rounded-full px-3 py-1 text-xs font-semibold',
              route.status === 'Operasional' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            ]">
              {{ route.status }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import KPICard from '../components/KPICard.vue'
import DashboardMap from '../components/DashboardMap.vue'
import TrafficChart from '../components/TrafficChart.vue'
import { trafficLocations, transitRoutes } from '../../shared/data/mobilityData'
import { api } from '../../shared/api/client'

const levelLabels = {
  heavy: 'Kemacetan Berat',
  medium: 'Kemacetan Sedang',
  light: 'Lancar'
}

const levelColors = {
  heavy: 'bg-rose-500',
  medium: 'bg-amber-500',
  light: 'bg-emerald-500'
}

const trafficStatus = ref([])
const transitStatus = ref([])

const mapTrafficStatus = (items) => items.slice(0, 3).map((location) => ({
  level: levelLabels[location.level],
  location: location.name,
  density: location.density,
  color: levelColors[location.level]
}))

const mapTransitStatus = (items) => items.map((route) => ({
  name: route.name,
  fleet: route.fleet,
  status: route.status === 'active' ? 'Operasional' : 'Tunda'
}))

onMounted(async () => {
  try {
    const [traffic, routes] = await Promise.all([
      api.getAdminTraffic(),
      api.getAdminRoutes()
    ])
    trafficStatus.value = mapTrafficStatus(traffic)
    transitStatus.value = mapTransitStatus(routes)
  } catch {
    trafficStatus.value = mapTrafficStatus(trafficLocations)
    transitStatus.value = mapTransitStatus(transitRoutes)
  }
})
</script>

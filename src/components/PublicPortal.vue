<template>
  <section class="space-y-6">
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <div v-for="item in publicStats" :key="item.label" class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-slate-500">{{ item.label }}</p>
        <div class="mt-3 flex items-end gap-2">
          <p class="text-3xl font-bold text-slate-950">{{ item.value }}</p>
          <p class="pb-1 text-sm font-semibold text-slate-500">{{ item.unit }}</p>
        </div>
        <p :class="['mt-4 text-sm font-semibold', item.color]">{{ item.note }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div class="xl:col-span-2">
        <MapComponent />
      </div>

      <aside class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-5">
          <p class="text-sm font-semibold text-cyan-700">Info Cepat</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Kondisi Jalan Utama</h2>
        </div>

        <div class="space-y-3">
          <div v-for="road in roads" :key="road.name" class="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-slate-950">{{ road.name }}</p>
                <p class="mt-1 text-sm text-slate-600">{{ road.message }}</p>
              </div>
              <span :class="['rounded-full px-3 py-1 text-xs font-semibold', road.badgeClass]">{{ road.status }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
        <div class="mb-5">
          <p class="text-sm font-semibold text-cyan-700">Transportasi Publik</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Rute Bacitra</h2>
        </div>

        <div class="space-y-3">
          <div v-for="route in routes" :key="route.name" class="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div>
              <p class="font-semibold text-slate-950">{{ route.name }}</p>
              <p class="text-xs text-slate-500">{{ route.nextArrival }}</p>
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

      <div class="xl:col-span-2">
        <CommunityReports mode="public" />
      </div>
    </div>
  </section>
</template>

<script setup>
import MapComponent from './MapComponent.vue'
import CommunityReports from './CommunityReports.vue'

const publicStats = [
  { label: 'Kepadatan Kota', value: '65', unit: '%', note: 'Sedang ramai', color: 'text-amber-600' },
  { label: 'Rute Aktif', value: '4', unit: 'rute', note: 'Bacitra beroperasi', color: 'text-emerald-600' },
  { label: 'Laporan Ditangani', value: '3', unit: 'lokasi', note: 'Petugas merespons', color: 'text-blue-600' },
  { label: 'Estimasi Waktu Tempuh', value: '45', unit: 'menit', note: 'Rata-rata hari ini', color: 'text-slate-600' }
]

const roads = [
  { name: 'MT Haryono Simpang Wika', message: 'Hindari area ini bila tidak mendesak.', status: 'Padat', badgeClass: 'bg-red-100 text-red-700' },
  { name: 'Jl. Soekarno Hatta', message: 'Arus kendaraan melambat menuju bandara.', status: 'Sedang', badgeClass: 'bg-yellow-100 text-yellow-700' },
  { name: 'Jl. Ahmad Yani', message: 'Kondisi lancar untuk rute pusat kota.', status: 'Lancar', badgeClass: 'bg-green-100 text-green-700' }
]

const routes = [
  { name: 'Route 1', nextArrival: 'Terminal Pusat ke Grand City', status: 'Operasional' },
  { name: 'Route 2', nextArrival: 'Terminal Pusat ke Bandara', status: 'Operasional' },
  { name: 'Route 3', nextArrival: 'Sepinggan ke Rumah Sakit', status: 'Tunda' },
  { name: 'Route 4', nextArrival: 'Kampus ke Mall', status: 'Operasional' }
]
</script>

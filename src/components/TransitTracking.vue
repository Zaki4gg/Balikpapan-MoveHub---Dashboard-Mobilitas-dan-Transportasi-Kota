<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-sm text-slate-600">Total Armada</p>
        <p class="mt-2 text-3xl font-bold text-blue-600">156</p>
        <p class="mt-1 text-xs text-slate-500">Unit Operasional</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-sm text-slate-600">Operasional</p>
        <p class="mt-2 text-3xl font-bold text-green-600">148</p>
        <p class="mt-1 text-xs text-slate-500">95% Availability</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-sm text-slate-600">Dalam Perbaikan</p>
        <p class="mt-2 text-3xl font-bold text-yellow-600">5</p>
        <p class="mt-1 text-xs text-slate-500">Maintenance</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-sm text-slate-600">Penumpang Hari Ini</p>
        <p class="mt-2 text-3xl font-bold text-indigo-600">8.4K</p>
        <p class="mt-1 text-xs text-slate-500">Estimasi</p>
      </div>
    </div>

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-xl font-bold text-slate-950">Rute Operasional</h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div v-for="route in routes" :key="route.id" class="rounded-xl border border-slate-200 p-4">
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

          <button type="button" class="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            Lihat Detail Armada
          </button>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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
            <tr v-for="bus in activeBuses" :key="bus.id" class="border-b border-slate-200 hover:bg-slate-50">
              <td class="px-4 py-3 font-semibold text-slate-950">{{ bus.number }}</td>
              <td class="px-4 py-3">{{ bus.route }}</td>
              <td class="px-4 py-3 text-slate-600">{{ bus.location }}</td>
              <td class="px-4 py-3">{{ bus.passengers }}/50</td>
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
import { ref } from 'vue'

const routes = ref([
  {
    id: 1,
    name: 'Bacitra Route 1',
    route: 'Terminal Pusat ke Grand City',
    status: 'active',
    fleet: 12,
    passengers: 485,
    onTime: 98
  },
  {
    id: 2,
    name: 'Bacitra Route 2',
    route: 'Terminal Pusat ke Bandara',
    status: 'active',
    fleet: 15,
    passengers: 620,
    onTime: 95
  },
  {
    id: 3,
    name: 'Bacitra Route 3',
    route: 'Sepinggan ke Rumah Sakit',
    status: 'delayed',
    fleet: 8,
    passengers: 245,
    onTime: 87
  },
  {
    id: 4,
    name: 'Bacitra Route 4',
    route: 'Kampus ke Mall',
    status: 'active',
    fleet: 10,
    passengers: 380,
    onTime: 92
  }
])

const activeBuses = ref([
  { id: 1, number: 'BLK-001', route: 'Route 1', location: 'Jl. MT Haryono', passengers: 42, status: 'On Schedule' },
  { id: 2, number: 'BLK-002', route: 'Route 1', location: 'Jl. Ahmad Yani', passengers: 38, status: 'On Schedule' },
  { id: 3, number: 'BLK-003', route: 'Route 2', location: 'Jl. Soekarno Hatta', passengers: 45, status: 'On Schedule' },
  { id: 4, number: 'BLK-004', route: 'Route 2', location: 'Bandara Road', passengers: 50, status: 'Delayed (5 min)' },
  { id: 5, number: 'BLK-005', route: 'Route 3', location: 'Jl. Gatot Subroto', passengers: 35, status: 'On Schedule' },
  { id: 6, number: 'BLK-006', route: 'Route 4', location: 'Grand City', passengers: 48, status: 'On Schedule' }
])
</script>

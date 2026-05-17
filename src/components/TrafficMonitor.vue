<template>
  <div class="space-y-6">
    <!-- Search & Filter -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex gap-4 flex-wrap">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Cari jalan atau lokasi..."
          class="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select 
          v-model="filterLevel"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Level</option>
          <option value="heavy">Berat</option>
          <option value="medium">Sedang</option>
          <option value="light">Ringan</option>
        </select>
      </div>
    </div>

    <!-- Traffic List -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="location in filteredLocations" :key="location.id" class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-800">{{ location.name }}</h3>
            <p class="text-sm text-gray-600">{{ location.description }}</p>
          </div>
          <span :class="['px-3 py-1 rounded-full text-sm font-semibold', levelColors[location.level]]">
            {{ levelLabels[location.level] }}
          </span>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-xs text-gray-600">Kepadatan</p>
            <p class="text-2xl font-bold text-gray-800">{{ location.density }}%</p>
          </div>
          <div>
            <p class="text-xs text-gray-600">Kecepatan Rata-rata</p>
            <p class="text-2xl font-bold text-gray-800">{{ location.avgSpeed }} km/h</p>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mb-4">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              :class="['h-2 rounded-full', progressColors[location.level]]"
              :style="{ width: location.density + '%' }"
            ></div>
          </div>
        </div>

        <p class="text-xs text-gray-500">Update: Baru saja</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const filterLevel = ref('')

const trafficLocations = ref([
  {
    id: 1,
    name: 'MT Haryono Simpang Wika',
    description: 'Simpang utama kota',
    level: 'heavy',
    density: 85,
    avgSpeed: 10
  },
  {
    id: 2,
    name: 'Jl. Soekarno Hatta',
    description: 'Ruas utama menuju bandara',
    level: 'medium',
    density: 65,
    avgSpeed: 25
  },
  {
    id: 3,
    name: 'Jl. Ahmad Yani',
    description: 'Kawasan perdagangan',
    level: 'light',
    density: 35,
    avgSpeed: 50
  },
  {
    id: 4,
    name: 'Jl. Gatot Subroto',
    description: 'Jalan penghubung',
    level: 'medium',
    density: 55,
    avgSpeed: 35
  },
  {
    id: 5,
    name: 'Grand City - MT Haryono',
    description: 'Akses mal utama',
    level: 'heavy',
    density: 78,
    avgSpeed: 15
  },
  {
    id: 6,
    name: 'Jl. Imam Bonjol',
    description: 'Jalan residential',
    level: 'light',
    density: 20,
    avgSpeed: 55
  }
])

const levelLabels = {
  heavy: 'Berat',
  medium: 'Sedang',
  light: 'Ringan'
}

const levelColors = {
  heavy: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  light: 'bg-green-100 text-green-700'
}

const progressColors = {
  heavy: 'bg-red-500',
  medium: 'bg-yellow-500',
  light: 'bg-green-500'
}

const filteredLocations = computed(() => {
  return trafficLocations.value.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesFilter = !filterLevel.value || location.level === filterLevel.value
    return matchesSearch && matchesFilter
  })
})
</script>

<style scoped>
</style>

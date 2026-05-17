<template>
  <div class="flex min-h-screen bg-slate-100 text-slate-900">
    <Sidebar
      v-if="currentMode === 'admin'"
      @navigateTo="currentView = $event"
      :activeView="currentView"
    />

    <div class="flex min-w-0 flex-1 flex-col">
      <Header
        :title="pageTitle"
        :mode="currentMode"
        @changeMode="changeMode"
      />

      <main class="min-h-0 flex-1 overflow-auto px-5 py-6 sm:px-8 lg:px-10">
        <template v-if="currentMode === 'admin'">
          <TrafficMonitor v-if="currentView === 'traffic'" />
          <TransitTracking v-else-if="currentView === 'transit'" />
          <CommunityReports v-else-if="currentView === 'reports'" mode="admin" />
          <MobilityStats v-else-if="currentView === 'stats'" />
          <Dashboard v-else />
        </template>

        <PublicPortal v-else />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import Dashboard from './components/Dashboard.vue'
import TrafficMonitor from './components/TrafficMonitor.vue'
import TransitTracking from './components/TransitTracking.vue'
import CommunityReports from './components/CommunityReports.vue'
import MobilityStats from './components/MobilityStats.vue'
import PublicPortal from './components/PublicPortal.vue'

const currentMode = ref('admin')
const currentView = ref('dashboard')

const pageTitle = computed(() => {
  if (currentMode.value === 'public') {
    return 'Portal Publik Smart Mobility'
  }

  return getTitle(currentView.value)
})

const getTitle = (view) => {
  const titles = {
    dashboard: 'Dashboard Smart Mobility',
    traffic: 'Monitoring Lalu Lintas',
    transit: 'Pelacakan Transportasi Publik',
    reports: 'Laporan Masyarakat',
    stats: 'Statistik Mobilitas'
  }
  return titles[view] || 'Dashboard'
}

const changeMode = (mode) => {
  currentMode.value = mode

  if (mode === 'admin') {
    currentView.value = 'dashboard'
  }
}
</script>

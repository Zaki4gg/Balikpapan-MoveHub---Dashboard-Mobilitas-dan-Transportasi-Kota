<template>
  <div class="flex min-h-screen bg-slate-100 text-slate-900">
    <Sidebar
      @navigateTo="currentView = $event"
      :activeView="currentView"
    />

    <div class="flex min-w-0 flex-1 flex-col">
      <AdminHeader
        :title="pageTitle"
        section-label="Command Center"
        user-label="Admin Dashboard"
        user-initials="AD"
      />

      <main class="min-h-0 flex-1 overflow-auto px-5 py-6 sm:px-8 lg:px-10">
        <TrafficMonitorPage v-if="currentView === 'traffic'" />
        <TransitTrackingPage v-else-if="currentView === 'transit'" />
        <ReportsPage v-else-if="currentView === 'reports'" />
        <MobilityStatsPage v-else-if="currentView === 'stats'" />
        <DashboardPage v-else />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Sidebar from './admin/components/Sidebar.vue'
import AdminHeader from './admin/components/AdminHeader.vue'
import DashboardPage from './admin/pages/DashboardPage.vue'
import TrafficMonitorPage from './admin/pages/TrafficMonitorPage.vue'
import TransitTrackingPage from './admin/pages/TransitTrackingPage.vue'
import ReportsPage from './admin/pages/ReportsPage.vue'
import MobilityStatsPage from './admin/pages/MobilityStatsPage.vue'

const currentView = ref('dashboard')

const pageTitle = computed(() => {
  const titles = {
    dashboard: 'Dashboard Smart Mobility',
    traffic: 'Monitoring Lalu Lintas',
    transit: 'Pelacakan Transportasi Publik',
    reports: 'Laporan Masyarakat',
    stats: 'Statistik Mobilitas'
  }

  return titles[currentView.value] || 'Dashboard Smart Mobility'
})
</script>

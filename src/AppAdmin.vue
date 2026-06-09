<template>
  <!-- Show Login/Register Pages if Not Authenticated -->
  <template v-if="!isAuthenticated">
    <LoginPage
      v-if="authPage === 'login'"
      @switchToRegister="authPage = 'register'"
      @loginSuccess="handleLoginSuccess"
    />
    <RegistrationPage
      v-else-if="authPage === 'register'"
      @switchToLogin="authPage = 'login'"
      @registerSuccess="authPage = 'login'"
    />
  </template>

  <!-- Show Dashboard if Authenticated -->
  <div v-else class="app-shell admin-shell flex min-h-screen bg-slate-100 text-slate-900">
    <Sidebar
      @navigateTo="currentView = $event"
      :activeView="currentView"
    />

    <div class="flex min-w-0 flex-1 flex-col">
      <AdminHeader
        :title="pageTitle"
        section-label="Command Center"
        :user-label="currentUserName"
        :user-initials="userInitials"
        @logout="handleLogout"
      />

      <main class="app-main admin-main min-h-0 flex-1 overflow-auto px-5 py-6 sm:px-8 lg:px-10">
        <TrafficMonitorPage v-if="currentView === 'traffic'" @open-cctv="currentView = 'traffic-cctv'" />
        <CctvGalleryPage v-else-if="currentView === 'traffic-cctv'" @back-to-traffic="currentView = 'traffic'" />
        <TransitTrackingPage v-else-if="currentView === 'transit'" />
        <ReportsPage v-else-if="currentView === 'reports'" />
        <MobilityStatsPage v-else-if="currentView === 'stats'" />
        <DashboardPage v-else @open-transit="handleOpenTransit" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import Sidebar from './admin/components/Sidebar.vue'
import AdminHeader from './admin/components/AdminHeader.vue'
import DashboardPage from './admin/pages/DashboardPage.vue'
import TrafficMonitorPage from './admin/pages/TrafficMonitorPage.vue'
import CctvGalleryPage from './admin/pages/CctvGalleryPage.vue'
import TransitTrackingPage from './admin/pages/TransitTrackingPage.vue'
import ReportsPage from './admin/pages/ReportsPage.vue'
import MobilityStatsPage from './admin/pages/MobilityStatsPage.vue'
import LoginPage from './admin/pages/LoginPage.vue'
import RegistrationPage from './admin/pages/RegistrationPage.vue'
import { authService } from './shared/services/authService'

const currentView = ref('dashboard')
const isAuthenticated = ref(false)
const authPage = ref('login')
const currentUser = ref(null)

const pageTitle = computed(() => {
  const titles = {
    dashboard: 'Dashboard Smart Mobility',
    traffic: 'Monitoring Lalu Lintas',
    'traffic-cctv': 'Pantauan CCTV Lalu Lintas',
    transit: 'Pelacakan Transportasi Publik',
    reports: 'Laporan Masyarakat',
    stats: 'Statistik Mobilitas'
  }

  return titles[currentView.value] || 'Dashboard Smart Mobility'
})

const currentUserName = computed(() => {
  return currentUser.value?.username || 'Admin'
})

const userInitials = computed(() => {
  if (!currentUser.value?.username) return 'AD'
  const names = currentUser.value.username.split(' ')
  const initials = names.map(n => n[0]).join('')
  return initials.substring(0, 2).toUpperCase()
})

// Check authentication on mount
onMounted(() => {
  authService.initializeDemoUser()
  checkAuthentication()
})

const checkAuthentication = () => {
  if (authService.isAuthenticated()) {
    isAuthenticated.value = true
    currentUser.value = authService.getCurrentUser()
  } else {
    isAuthenticated.value = false
    currentUser.value = null
  }
}

const handleLoginSuccess = (user) => {
  currentUser.value = user
  isAuthenticated.value = true
  currentView.value = 'dashboard'
}

const handleLogout = () => {
  authService.logout()
  isAuthenticated.value = false
  currentUser.value = null
  authPage.value = 'login'
}

const handleOpenTransit = (corridorId) => {
  if (corridorId) {
    sessionStorage.setItem('smart-mobility-selected-corridor', corridorId)
  }

  currentView.value = 'transit'
}
</script>

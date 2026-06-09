<template>
  <div class="app-shell public-shell flex min-h-screen bg-slate-100 text-slate-900">
    <div class="flex min-w-0 flex-1 flex-col">
      <PublicHeader
        :title="pageTitle"
        section-label="Portal Warga"
        user-label="Akses Publik"
        user-initials="PB"
      />
      <PublicNavbar :active-page="currentPage" />

      <main class="app-main public-main min-h-0 flex-1 overflow-auto px-5 py-6 sm:px-8 lg:px-10">
        <PublicTrafficPage v-if="currentPage === 'traffic'" />
        <PublicCctvPage v-else-if="currentPage === 'traffic-cctv'" />
        <PublicTransitPage v-else-if="currentPage === 'transit'" />
        <PublicReportsPage v-else-if="currentPage === 'reports'" />
        <PublicPortalPage v-else />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PublicHeader from './public/components/PublicHeader.vue'
import PublicNavbar from './public/components/PublicNavbar.vue'
import PublicPortalPage from './public/pages/PublicPortalPage.vue'
import PublicTrafficPage from './public/pages/PublicTrafficPage.vue'
import PublicCctvPage from './public/pages/PublicCctvPage.vue'
import PublicTransitPage from './public/pages/PublicTransitPage.vue'
import PublicReportsPage from './public/pages/PublicReportsPage.vue'

const routeMap = {
  '/': 'home',
  '/traffic': 'traffic',
  '/traffic/cctv': 'traffic-cctv',
  '/transit': 'transit',
  '/reports': 'reports'
}

const currentPage = ref('home')

const syncRoute = () => {
  const route = (window.location.hash.replace('#', '') || '/').split('?')[0]
  currentPage.value = routeMap[route] || 'home'
}

const pageTitle = computed(() => {
  const titles = {
    home: 'Portal Publik Smart Mobility',
    traffic: 'Kondisi Lalu Lintas Kota',
    'traffic-cctv': 'Pantauan CCTV Balikpapan Kota',
    transit: 'Rute Bacitra Balikpapan',
    reports: 'Laporan Warga'
  }

  return titles[currentPage.value] || titles.home
})

onMounted(() => {
  syncRoute()
  window.addEventListener('hashchange', syncRoute)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', syncRoute)
})
</script>

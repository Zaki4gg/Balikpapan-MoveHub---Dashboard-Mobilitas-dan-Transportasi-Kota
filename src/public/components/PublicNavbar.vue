<template>
  <nav class="public-nav border-b border-slate-200 bg-white/95 px-5 py-3 shadow-sm backdrop-blur sm:px-8 lg:px-10">
    <div class="flex gap-2 overflow-x-auto">
      <a
        v-for="item in items"
        :key="item.id"
        :href="item.href"
        :class="[
          'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition',
          isActive(item.id)
            ? 'bg-slate-950 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
        ]"
      >
        <span class="nav-icon" v-html="item.icon"></span>
        {{ item.label }}
      </a>
    </div>
  </nav>
</template>

<script setup>
const props = defineProps({
  activePage: {
    type: String,
    default: 'home'
  }
})

const icons = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
    <path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10.5V19h11v-8.5"/><path d="M9.5 19v-5h5v5"/>
  </svg>`,
  traffic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
    <path d="M5 19c3.5-2.5 3.5-6.5 7-9s3.5-4.5 7-5"/><path d="M5 5c3.5 2.5 3.5 6.5 7 9s3.5 4.5 7 5"/><path d="M12 3v18"/>
  </svg>`,
  transit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
    <rect x="5" y="4" width="14" height="13" rx="3"/><path d="M8 8h8M8 12h8"/><path d="M8 20l1.5-3M16 20l-1.5-3"/>
  </svg>`,
  reports: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
    <path d="M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2-2-1.3V6a2 2 0 0 1 2-2Z"/><path d="M9 8h6M9 12h6M9 16h3"/>
  </svg>`
}

const isActive = (itemId) => props.activePage === itemId || (itemId === 'traffic' && props.activePage === 'traffic-cctv')

const items = [
  { id: 'home', label: 'Ringkasan', href: '#/', icon: icons.home },
  { id: 'traffic', label: 'Lalu Lintas', href: '#/traffic', icon: icons.traffic },
  { id: 'transit', label: 'Bacitra', href: '#/transit', icon: icons.transit },
  { id: 'reports', label: 'Laporan Warga', href: '#/reports', icon: icons.reports }
]
</script>

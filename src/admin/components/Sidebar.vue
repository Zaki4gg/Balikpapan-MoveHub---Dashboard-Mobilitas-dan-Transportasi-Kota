<template>
  <aside class="admin-sidebar sticky top-0 hidden h-screen w-64 shrink-0 flex-col lg:flex">

    <!-- Brand -->
    <div class="flex items-center gap-3 px-5 py-5 border-b border-white/[0.08]">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                  bg-gradient-to-br from-cyan-400 to-sky-500
                  text-xs font-black text-slate-950
                  shadow-lg shadow-cyan-500/25">
        SM
      </div>
      <div class="min-w-0">
        <p class="text-[0.62rem] font-black uppercase tracking-[0.2em] text-cyan-400/70 leading-none mb-1">
          Balikpapan Smart City
        </p>
        <p class="text-sm font-bold text-white leading-tight truncate">Smart Mobility</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="$emit('navigateTo', item.id)"
        :class="[
          'group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-150',
          isActive(item.id)
            ? 'bg-gradient-to-r from-cyan-400 to-cyan-300 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20'
            : 'font-medium text-slate-400 hover:bg-white/[0.07] hover:text-slate-200'
        ]"
      >
        <span
          :class="[
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
            isActive(item.id)
              ? 'bg-slate-950/15'
              : 'bg-white/[0.06] group-hover:bg-white/10'
          ]"
          v-html="item.icon"
        />
        <span class="flex-1 truncate">{{ item.label }}</span>
        <span
          v-if="isActive(item.id)"
          class="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-950/25"
        />
      </button>
    </nav>

    <!-- System Status Footer -->
    <div class="mx-3 mb-3 rounded-xl border border-white/[0.07] bg-white/[0.04] p-3.5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-500">Status Sistem</p>
          <p class="mt-0.5 text-sm font-semibold text-white">Operasional</p>
        </div>
        <span class="relative flex h-2.5 w-2.5">
          <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"
                style="animation: ping-slow 1.8s cubic-bezier(0,0,0.2,1) infinite"></span>
          <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        </span>
      </div>
      <p class="mt-2.5 text-[0.68rem] text-slate-500">Pembaruan otomatis - setiap 7 detik</p>
    </div>

  </aside>
</template>

<script setup>
const props = defineProps({
  activeView: { type: String, default: 'dashboard' }
})
defineEmits(['navigateTo'])

const isActive = (itemId) => props.activeView === itemId || (itemId === 'traffic' && props.activeView === 'traffic-cctv')

/* Heroicons-style SVG (24x24 viewBox, stroke-based) */
const ic = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
    stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px]">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>`,

  traffic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
    stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px]">
    <path d="M9 6.75V15m6-6v8.25M14.503 19.498l4.875-2.437A1.125 1.125 0 0020.25 16.06V4.82
      a1.125 1.125 0 00-1.628-1.006l-3.869 1.934a1.125 1.125 0 01-1.006 0L9.503 3.252
      a1.125 1.125 0 00-1.006 0L3.622 5.689A1.125 1.125 0 003 6.695V18.93
      a1.125 1.125 0 001.628 1.006l3.869-1.934a1.125 1.125 0 011.006 0
      l4.994 2.497a1.125 1.125 0 001.006 0z"/>
  </svg>`,

  transit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
    stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px]">
    <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375
      A1.125 1.125 0 012.25 17.625V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0
      m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.9 17.9 0 00-3.213-9.193
      2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958
      c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0
      1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
  </svg>`,

  reports: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
    stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px]">
    <path d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054
      a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732
      a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"/>
  </svg>`,

  stats: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
    stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px]">
    <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75
      C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z
      M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25
      c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z
      M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75
      c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
  </svg>`,
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard',            icon: ic.dashboard },
  { id: 'traffic',   label: 'Lalu Lintas',           icon: ic.traffic   },
  { id: 'transit',   label: 'Transportasi Publik',   icon: ic.transit   },
  { id: 'reports',   label: 'Laporan Masyarakat',    icon: ic.reports   },
  { id: 'stats',     label: 'Statistik',             icon: ic.stats     },
]
</script>


<template>
  <aside class="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white shadow-xl lg:flex">
    <div class="border-b border-white/10 px-6 py-7">
      <div class="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400 text-lg font-black text-slate-950 shadow-lg shadow-cyan-500/20">
        <span aria-hidden="true">SM</span>
      </div>
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Balikpapan Smart City</p>
      <h1 class="mt-2 text-2xl font-bold leading-tight tracking-tight">Smart Mobility</h1>
      <p class="mt-2 text-sm leading-6 text-slate-400">Pusat pantau lalu lintas, armada, dan laporan warga.</p>
    </div>

    <nav class="flex-1 space-y-2 px-4 py-5">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="$emit('navigateTo', item.id)"
        :class="[
          'group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition',
          activeView === item.id
            ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        ]"
      >
        <span
          :class="[
            'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition',
            activeView === item.id ? 'bg-slate-950/10' : 'bg-white/5 group-hover:bg-white/10'
          ]"
        >
          {{ item.icon }}
        </span>
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <div class="m-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Status Sistem</p>
          <p class="mt-1 text-sm font-semibold text-white">Online</p>
        </div>
        <span class="relative flex h-3 w-3">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
          <span class="relative inline-flex h-3 w-3 rounded-full bg-emerald-400"></span>
        </span>
      </div>
      <p class="mt-3 text-xs text-slate-500">Update data real-time</p>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  activeView: {
    type: String,
    default: 'dashboard'
  }
})

defineEmits(['navigateTo'])

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'D' },
  { id: 'traffic', label: 'Lalu Lintas', icon: 'L' },
  { id: 'transit', label: 'Transportasi Publik', icon: 'T' },
  { id: 'reports', label: 'Laporan Masyarakat', icon: 'R' },
  { id: 'stats', label: 'Statistik', icon: 'S' }
]
</script>

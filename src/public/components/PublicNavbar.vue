<template>
  <nav class="sticky top-[105px] z-20 border-b border-slate-200 bg-white/95 px-5 py-3 shadow-sm backdrop-blur sm:px-8 lg:px-10">
    <div class="flex gap-2 overflow-x-auto">
      <a
        v-for="item in items"
        :key="item.id"
        :href="item.href"
        :class="[
          'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition',
          activePage === item.id
            ? 'bg-slate-950 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
        ]"
      >
        {{ item.label }}
      </a>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  activePage: {
    type: String,
    default: 'home'
  }
})

const items = [
  { id: 'home', label: 'Ringkasan', href: '#/' },
  { id: 'traffic', label: 'Lalu Lintas', href: '#/traffic' },
  { id: 'transit', label: 'Bacitra', href: '#/transit' },
  { id: 'reports', label: 'Laporan Warga', href: '#/reports' }
]
</script>

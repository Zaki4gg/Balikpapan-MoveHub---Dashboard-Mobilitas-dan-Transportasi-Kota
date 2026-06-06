<template>
  <header class="admin-header sticky top-0 z-30 border-b border-slate-200/60 px-5 py-3.5 backdrop-blur sm:px-8 lg:px-10">
    <div class="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">

      <!-- Left: Title block -->
      <div>
        <p class="header-eyebrow">{{ sectionLabel }}</p>
        <h1 class="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{{ title }}</h1>
        <div class="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>{{ currentDate }}</span>
          <span class="hidden h-1 w-1 rounded-full bg-slate-300 sm:block"></span>
          <span class="font-semibold text-cyan-600">Mode Operator</span>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex flex-wrap items-center gap-2.5">

        <!-- Live status badge -->
        <div class="hidden items-center gap-2 rounded-xl border border-emerald-200/60
                    bg-emerald-50/80 px-3.5 py-2 xl:flex">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"
                  style="animation: ping-slow 2s cubic-bezier(0,0,0.2,1) infinite"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <div class="leading-none">
            <p class="text-[0.62rem] font-black uppercase tracking-[0.14em] text-emerald-700">Sistem</p>
            <p class="text-xs font-semibold text-emerald-800">Realtime Aktif</p>
          </div>
        </div>

        <!-- User profile chip -->
        <div class="flex items-center gap-2.5 rounded-xl border border-slate-200
                    bg-white/80 px-3 py-2 shadow-sm">
          <div class="hidden leading-none text-right sm:block">
            <p class="text-sm font-semibold text-slate-900">{{ userLabel }}</p>
            <p class="text-[0.68rem] font-medium text-emerald-600">Status: Aktif</p>
          </div>
          <div class="flex h-9 w-9 items-center justify-center rounded-lg
                      bg-gradient-to-br from-slate-800 to-slate-950
                      text-xs font-black text-white shadow">
            {{ userInitials }}
          </div>
        </div>

        <!-- Logout button -->
        <button
          @click="$emit('logout')"
          class="rounded-lg px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-600 
                 hover:bg-red-500/20 hover:border-red-500/50 transition font-semibold text-sm"
          title="Logout dari dashboard"
        >
          Logout
        </button>

      </div>
    </div>
  </header>
</template>

<script setup>
import { onMounted, ref } from 'vue'

defineProps({
  title:        { type: String, default: 'Dashboard' },
  sectionLabel: { type: String, default: 'Smart Mobility' },
  userLabel:    { type: String, default: 'Operator' },
  userInitials: { type: String, default: 'OP' },
})

defineEmits(['logout'])

const currentDate = ref('')

onMounted(() => {
  currentDate.value = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
})
</script>


<template>
  <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-5 py-4 shadow-sm backdrop-blur sm:px-8 lg:px-10">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">{{ modeLabel }}</p>
        <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{{ title }}</h1>
        <p class="mt-1 text-sm text-slate-500">{{ currentDate }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            @click="$emit('changeMode', 'admin')"
            :class="[
              'rounded-lg px-4 py-2 text-sm font-semibold transition',
              mode === 'admin' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:text-slate-950'
            ]"
          >
            Admin
          </button>
          <button
            type="button"
            @click="$emit('changeMode', 'public')"
            :class="[
              'rounded-lg px-4 py-2 text-sm font-semibold transition',
              mode === 'public' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'
            ]"
          >
            Publik
          </button>
        </div>

        <div class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <div class="hidden text-right sm:block">
            <p class="text-sm font-semibold text-slate-900">{{ accountName }}</p>
            <p class="text-xs text-emerald-600">Status: Aktif</p>
          </div>
          <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white shadow-lg">
            {{ accountInitials }}
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  },
  mode: {
    type: String,
    default: 'admin'
  }
})

defineEmits(['changeMode'])

const currentDate = ref('')

const modeLabel = computed(() => props.mode === 'admin' ? 'Command Center' : 'Portal Warga')
const accountName = computed(() => props.mode === 'admin' ? 'Admin Dashboard' : 'Akses Publik')
const accountInitials = computed(() => props.mode === 'admin' ? 'AD' : 'PB')

onMounted(() => {
  const now = new Date()
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  currentDate.value = now.toLocaleDateString('id-ID', options)
})
</script>

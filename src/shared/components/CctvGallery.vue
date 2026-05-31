<template>
  <section class="space-y-6">
    <div :class="heroClass">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p :class="eyebrowClass">{{ eyebrow }}</p>
          <h2 :class="titleClass">{{ title }}</h2>
          <p :class="subtitleClass">{{ subtitle }}</p>
        </div>
        <button
          type="button"
          :class="backButtonClass"
          @click="$emit('back')"
        >
          Kembali ke Lalu Lintas
        </button>
      </div>
    </div>

    <section class="card p-6">
      <div class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.13em] text-cyan-700">Pantauan CCTV</p>
          <h3 class="mt-1 text-xl font-bold text-slate-950">Balikpapan Kota</h3>
        </div>
        <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{{ cctvFeeds.length }} kamera simulasi</span>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <button
          v-for="camera in cctvFeeds"
          :key="camera.id"
          type="button"
          class="camera-feed-card"
          @click="openCamera(camera)"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.12em] text-cyan-700">{{ camera.code }}</p>
              <h4 class="mt-1 font-bold text-slate-950">{{ camera.name }}</h4>
            </div>
            <span :class="['rounded-full px-2.5 py-1 text-xs font-semibold', camera.statusClass]">{{ camera.status }}</span>
          </div>
          <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
            <img
              :src="camera.image"
              :alt="camera.name"
              class="h-44 w-full object-cover"
              loading="lazy"
            />
            <div class="absolute left-2 top-2 rounded-lg bg-slate-950/75 px-2 py-1 text-[0.65rem] font-bold text-white">
              Preview
            </div>
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-3">
              <p class="text-left text-sm font-black text-white">{{ camera.name }}</p>
            </div>
          </div>
          <p class="mt-3 text-left text-sm text-slate-600">{{ camera.note }}</p>
        </button>
      </div>
    </section>

    <div
      v-if="selectedCamera"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
      @click.self="closeCamera"
    >
      <section class="w-full max-w-5xl overflow-hidden rounded-2xl bg-slate-950 shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
              {{ selectedCamera.code }} - {{ selectedCamera.area }}
            </p>
            <h2 class="mt-1 text-xl font-black text-white">{{ selectedCamera.name }}</h2>
          </div>
          <button
            type="button"
            class="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/20"
            @click="closeCamera"
          >
            Tutup
          </button>
        </div>
        <div class="bg-black">
          <img
            :src="selectedCamera.image"
            :alt="selectedCamera.name"
            class="max-h-[72vh] w-full object-contain"
          />
        </div>
        <div class="flex flex-col gap-2 px-5 py-4 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <span>{{ selectedCamera.note }}</span>
          <span class="rounded-full bg-cyan-400/10 px-3 py-1 font-bold text-cyan-300">{{ badgeLabel }}</span>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { cctvFeeds } from '../data/cctvData.js'

const props = defineProps({
  variant: {
    type: String,
    default: 'public'
  }
})

defineEmits(['back'])

const selectedCamera = ref(null)

const isAdmin = computed(() => props.variant === 'admin')

const eyebrow = computed(() => isAdmin.value ? 'B-Connect Command Center' : 'B-Connect Traffic')
const title = computed(() => isAdmin.value ? 'Semua Pantauan CCTV Lalu Lintas' : 'Pantauan CCTV Balikpapan Kota')
const subtitle = computed(() =>
  isAdmin.value
    ? 'Daftar lengkap titik CCTV simulasi untuk membantu operator membaca situasi ruas dan menentukan prioritas penanganan.'
    : 'Daftar lengkap kamera simulasi yang dapat dipakai warga untuk mengecek kondisi ruas sebelum berangkat.'
)
const badgeLabel = computed(() => isAdmin.value ? 'Live preview prototype' : 'Simulasi B-Connect')

const heroClass = computed(() => isAdmin.value ? 'bconnect-panel p-5' : 'card card-accent public-hero p-5')
const eyebrowClass = computed(() =>
  isAdmin.value
    ? 'text-xs font-black uppercase tracking-[0.18em] text-cyan-200'
    : 'text-xs font-black uppercase tracking-[0.16em] text-cyan-700'
)
const titleClass = computed(() => isAdmin.value ? 'mt-2 text-2xl font-black tracking-tight text-white' : 'mt-1 text-2xl font-black text-slate-950')
const subtitleClass = computed(() => isAdmin.value ? 'mt-2 max-w-2xl text-sm leading-6 text-cyan-50/80' : 'mt-2 max-w-2xl text-sm leading-6 text-slate-600')
const backButtonClass = computed(() =>
  isAdmin.value
    ? 'rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15'
    : 'rounded-xl border border-cyan-200 bg-white px-4 py-2 text-sm font-bold text-cyan-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50'
)

const openCamera = (camera) => {
  selectedCamera.value = camera
}

const closeCamera = () => {
  selectedCamera.value = null
}
</script>

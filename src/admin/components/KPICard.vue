<template>
  <article class="kpi-card card-accent p-5">
    <div class="flex items-start justify-between gap-4">
      <!-- Text -->
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{{ title }}</p>
        <div class="mt-2.5 flex items-end gap-1.5">
          <p class="text-3xl font-black tracking-tight text-slate-950 leading-none">{{ value }}</p>
          <p class="pb-0.5 text-sm font-semibold text-slate-400">{{ unit }}</p>
        </div>
      </div>

      <!-- Icon badge -->
      <div :class="['flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconBg]"
           v-html="iconSvg">
      </div>
    </div>

    <!-- Trend pill -->
    <div class="mt-4 flex items-center gap-2">
      <span :class="[
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        trend > 0 ? trendUpClass : trend < 0 ? trendDownClass : 'bg-slate-100 text-slate-500'
      ]">
        <span v-html="trend > 0 ? arrowUp : trend < 0 ? arrowDown : dashIcon" />
        {{ Math.abs(trend) }}%
      </span>
      <span class="text-xs text-slate-400">vs kemarin</span>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title:  String,
  value:  [String, Number],
  unit:   String,
  icon:   String,   /* 'congestion' | 'fleet' | 'time' | 'report' */
  color:  String,   /* accent color key, kept for compatibility */
  trend:  Number,
})

const trendUpClass   = 'bg-rose-50 text-rose-600'
const trendDownClass = 'bg-emerald-50 text-emerald-700'

const arrowUp = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3">
  <path d="M6 9V3M3 6l3-3 3 3"/>
</svg>`

const arrowDown = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3">
  <path d="M6 3v6M3 6l3 3 3-3"/>
</svg>`

const dashIcon = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" class="h-3 w-3"><path d="M2 6h8"/></svg>`

const icons = {
  congestion: {
    bg: 'bg-rose-50 text-rose-600',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
      stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
      <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71
        c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378
        c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z
        M12 15.75h.007v.008H12v-.008z"/>
    </svg>`,
  },

  fleet: {
    bg: 'bg-sky-50 text-sky-600',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
      stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
      <path d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375
        A1.125 1.125 0 012.25 17.625V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0
        m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.9 17.9 0 00-3.213-9.193
        2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958
        c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0
        1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
    </svg>`,
  },

  time: {
    bg: 'bg-amber-50 text-amber-600',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
      stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
      <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>`,
  },

  report: {
    bg: 'bg-emerald-50 text-emerald-600',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
      stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
      <path d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054
        a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732
        a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5"/>
    </svg>`,
  },
}

/* Derive from icon name; fall back gracefully */
const iconDef = computed(() => {
  const key = props.icon?.toLowerCase()
  return icons[key] ?? {
    bg: 'bg-slate-100 text-slate-500',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
      stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
      <circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 2.5"/>
    </svg>`,
  }
})

const iconBg  = computed(() => iconDef.value.bg)
const iconSvg = computed(() => iconDef.value.svg)
</script>


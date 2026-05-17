<template>
  <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-slate-500">{{ title }}</p>
        <div class="mt-3 flex items-end gap-2">
          <p class="text-3xl font-bold tracking-tight text-slate-950">{{ value }}</p>
          <p class="pb-1 text-sm font-semibold text-slate-500">{{ unit }}</p>
        </div>
      </div>
      <div :class="['flex h-12 w-12 items-center justify-center rounded-lg text-lg font-black', color]">
        {{ icon }}
      </div>
    </div>

    <div
      :class="[
        'mt-5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        trend >= 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
      ]"
    >
      <span>{{ trend >= 0 ? 'Naik' : 'Turun' }}</span>
      <span>{{ Math.abs(trend) }}% dari kemarin</span>
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  unit: String,
  icon: String,
  color: String,
  trend: Number
})
</script>

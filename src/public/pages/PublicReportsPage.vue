<template>
  <section class="space-y-6">
    <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-slate-500">Kanal Laporan</p>
        <p class="mt-3 text-3xl font-bold text-slate-950">Aktif</p>
        <p class="mt-3 text-sm font-semibold text-emerald-600">Terhubung ke panel admin</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-slate-500">Jenis Laporan</p>
        <p class="mt-3 text-3xl font-bold text-blue-600">5</p>
        <p class="mt-3 text-sm font-semibold text-slate-500">Kemacetan, kecelakaan, hambatan, perbaikan, lainnya</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-slate-500">Status Pantau</p>
        <p class="mt-3 text-3xl font-bold text-amber-600">Terbuka</p>
        <p class="mt-3 text-sm font-semibold text-slate-500">Warga dapat memantau tindak lanjut</p>
      </div>
    </div>

    <PublicReports />
  </section>
</template>

<script setup>
import PublicReports from '../components/PublicReports.vue'
</script>

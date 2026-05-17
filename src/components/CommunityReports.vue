<template>
  <div class="space-y-6">
    <section v-if="mode === 'public'" class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-5">
        <p class="text-sm font-semibold text-cyan-700">Laporan Warga</p>
        <h2 class="mt-1 text-xl font-bold text-slate-950">Kirim Laporan Baru</h2>
      </div>

      <form @submit.prevent="submitReport" class="grid gap-4 lg:grid-cols-2">
        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-800">Tipe Laporan</label>
          <select v-model="newReport.type" class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" required>
            <option value="">Pilih Tipe Laporan</option>
            <option value="congestion">Kemacetan</option>
            <option value="accident">Kecelakaan</option>
            <option value="hazard">Hambatan Jalan</option>
            <option value="maintenance">Perlu Perbaikan</option>
            <option value="other">Lainnya</option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-800">Prioritas</label>
          <select v-model="newReport.priority" class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500">
            <option value="low">Rendah</option>
            <option value="medium">Sedang</option>
            <option value="high">Tinggi</option>
          </select>
        </div>

        <div class="lg:col-span-2">
          <label class="mb-2 block text-sm font-semibold text-slate-800">Lokasi</label>
          <input
            v-model="newReport.location"
            type="text"
            placeholder="Masukkan nama jalan atau lokasi"
            class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>

        <div class="lg:col-span-2">
          <label class="mb-2 block text-sm font-semibold text-slate-800">Deskripsi Masalah</label>
          <textarea
            v-model="newReport.description"
            placeholder="Jelaskan kondisi yang Anda alami"
            rows="4"
            class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          ></textarea>
        </div>

        <div class="flex flex-col gap-3 lg:col-span-2 sm:flex-row sm:items-center">
          <button type="submit" class="rounded-lg bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400">
            Kirim Laporan
          </button>
          <p v-if="successMessage" class="text-sm font-semibold text-emerald-700">{{ successMessage }}</p>
        </div>
      </form>
    </section>

    <section v-if="mode === 'admin'" class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-slate-500">Laporan Baru</p>
        <p class="mt-2 text-3xl font-bold text-blue-600">{{ statusCounts.new }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-slate-500">Sedang Ditangani</p>
        <p class="mt-2 text-3xl font-bold text-amber-600">{{ statusCounts.inProgress }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-sm font-medium text-slate-500">Selesai</p>
        <p class="mt-2 text-3xl font-bold text-emerald-600">{{ statusCounts.resolved }}</p>
      </div>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-semibold text-cyan-700">{{ mode === 'admin' ? 'Moderasi' : 'Status Laporan' }}</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">{{ mode === 'admin' ? 'Kelola Laporan Masyarakat' : 'Laporan Terbaru' }}</h2>
        </div>

        <div class="flex flex-wrap gap-3">
          <select
            v-model="filterType"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Semua Tipe</option>
            <option value="congestion">Kemacetan</option>
            <option value="accident">Kecelakaan</option>
            <option value="hazard">Hambatan</option>
            <option value="maintenance">Perbaikan</option>
            <option value="other">Lainnya</option>
          </select>
          <select
            v-model="filterStatus"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Semua Status</option>
            <option value="new">Baru</option>
            <option value="in-progress">Sedang Ditangani</option>
            <option value="resolved">Selesai</option>
          </select>
        </div>
      </div>

      <div class="space-y-4">
        <article v-for="report in filteredReports" :key="report.id" class="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 class="font-bold text-slate-950">{{ report.location }}</h3>
              <p class="mt-1 text-sm text-slate-600">{{ typeLabels[report.type] }} - {{ report.time }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <span :class="['rounded-full px-3 py-1 text-xs font-semibold', typeColors[report.type]]">
                {{ typeLabels[report.type] }}
              </span>
              <span :class="['rounded-full px-3 py-1 text-xs font-semibold', statusColors[report.status]]">
                {{ statusLabels[report.status] }}
              </span>
              <span :class="['rounded-full px-3 py-1 text-xs font-semibold', priorityColors[report.priority]]">
                {{ priorityLabels[report.priority] }}
              </span>
            </div>
          </div>

          <p class="mt-3 text-slate-700">{{ report.description }}</p>

          <div class="mt-4 flex flex-col gap-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>Reporter: {{ report.reporter }}</span>
            <span>{{ report.responses }} respons</span>
          </div>

          <div v-if="mode === 'admin'" class="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <label class="text-sm font-semibold text-slate-700">
              Ubah Status
              <select v-model="report.status" class="ml-0 mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm sm:ml-3 sm:mt-0">
                <option value="new">Baru</option>
                <option value="in-progress">Sedang Ditangani</option>
                <option value="resolved">Selesai</option>
              </select>
            </label>
            <button type="button" class="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Tandai Ditindaklanjuti
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({
  mode: {
    type: String,
    default: 'admin'
  }
})

const newReport = ref({
  type: '',
  location: '',
  description: '',
  priority: 'medium'
})

const filterType = ref('')
const filterStatus = ref('')
const successMessage = ref('')

const reports = ref([
  {
    id: 1,
    type: 'congestion',
    location: 'MT Haryono Simpang Wika',
    description: 'Kemacetan parah di simpang utama, aliran kendaraan sangat lambat',
    priority: 'high',
    status: 'in-progress',
    time: '5 menit lalu',
    reporter: 'Budi S.',
    responses: 12
  },
  {
    id: 2,
    type: 'accident',
    location: 'Jl. Soekarno Hatta',
    description: 'Kecelakaan lalu lintas antara 2 kendaraan, petugas sudah dituju',
    priority: 'high',
    status: 'in-progress',
    time: '15 menit lalu',
    reporter: 'Ani R.',
    responses: 8
  },
  {
    id: 3,
    type: 'hazard',
    location: 'Jl. Ahmad Yani',
    description: 'Jalan berlubang yang berbahaya untuk pengguna motor',
    priority: 'medium',
    status: 'new',
    time: '1 jam lalu',
    reporter: 'Rudi K.',
    responses: 3
  },
  {
    id: 4,
    type: 'maintenance',
    location: 'Jl. Gatot Subroto',
    description: 'Traffic light mati, menyebabkan kemacetan dan risiko kecelakaan',
    priority: 'high',
    status: 'in-progress',
    time: '2 jam lalu',
    reporter: 'Siti N.',
    responses: 5
  },
  {
    id: 5,
    type: 'congestion',
    location: 'Grand City Area',
    description: 'Kemacetan parah karena keluarnya pelajar dari sekolah',
    priority: 'medium',
    status: 'resolved',
    time: '3 jam lalu',
    reporter: 'Ahmad M.',
    responses: 2
  }
])

const typeLabels = {
  congestion: 'Kemacetan',
  accident: 'Kecelakaan',
  hazard: 'Hambatan',
  maintenance: 'Perbaikan',
  other: 'Lainnya'
}

const statusLabels = {
  'new': 'Baru',
  'in-progress': 'Ditangani',
  'resolved': 'Selesai'
}

const priorityLabels = {
  'low': 'Rendah',
  'medium': 'Sedang',
  'high': 'Tinggi'
}

const typeColors = {
  congestion: 'bg-red-100 text-red-700',
  accident: 'bg-red-100 text-red-700',
  hazard: 'bg-orange-100 text-orange-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
  other: 'bg-slate-100 text-slate-700'
}

const statusColors = {
  'new': 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  'resolved': 'bg-green-100 text-green-700'
}

const priorityColors = {
  'low': 'bg-green-100 text-green-700',
  'medium': 'bg-yellow-100 text-yellow-700',
  'high': 'bg-red-100 text-red-700'
}

const filteredReports = computed(() => {
  return reports.value.filter(report => {
    const matchesType = !filterType.value || report.type === filterType.value
    const matchesStatus = !filterStatus.value || report.status === filterStatus.value
    return matchesType && matchesStatus
  })
})

const statusCounts = computed(() => ({
  new: reports.value.filter(report => report.status === 'new').length,
  inProgress: reports.value.filter(report => report.status === 'in-progress').length,
  resolved: reports.value.filter(report => report.status === 'resolved').length
}))

const submitReport = () => {
  if (!newReport.value.type || !newReport.value.location || !newReport.value.description) {
    return
  }

  reports.value.unshift({
    id: Date.now(),
    type: newReport.value.type,
    location: newReport.value.location,
    description: newReport.value.description,
    priority: newReport.value.priority,
    status: 'new',
    time: 'Baru saja',
    reporter: 'Anda',
    responses: 0
  })

  newReport.value = { type: '', location: '', description: '', priority: 'medium' }
  successMessage.value = 'Laporan berhasil dikirim dan masuk status Baru.'
}
</script>

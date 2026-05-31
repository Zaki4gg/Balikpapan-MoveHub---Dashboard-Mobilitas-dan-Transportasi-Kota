<template>
  <div class="space-y-6">
    <section class="card p-6">
      <div class="mb-5">
        <p class="text-sm font-semibold text-cyan-700">Laporan Warga</p>
        <h2 class="mt-1 text-xl font-bold text-slate-950">Kirim Laporan Baru</h2>
      </div>

      <form @submit.prevent="submitReport" class="grid gap-4 lg:grid-cols-2">
        <div>
          <label class="mb-2 block text-sm font-semibold text-slate-800">Tipe Laporan</label>
          <select v-model="newReport.type" class="form-input" required>
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
          <select v-model="newReport.priority" class="form-input">
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
            class="form-input"
            required
          />
        </div>

        <div class="lg:col-span-2">
          <label class="mb-2 block text-sm font-semibold text-slate-800">Deskripsi Masalah</label>
          <textarea
            v-model="newReport.description"
            placeholder="Jelaskan kondisi yang Anda alami"
            rows="4"
            class="form-input"
            required
          ></textarea>
        </div>

        <div class="lg:col-span-2">
          <label class="mb-2 block text-sm font-semibold text-slate-800">Bukti Foto atau Video</label>
          <div class="grid gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 lg:grid-cols-2">
            <div
              :class="[
                'rounded-lg border border-dashed bg-white p-4 transition',
                dragState.photo ? 'border-cyan-500 bg-cyan-50' : 'border-slate-300 hover:border-cyan-400'
              ]"
              @dragenter.prevent="setDragState('photo', true)"
              @dragover.prevent="setDragState('photo', true)"
              @dragleave.prevent="setDragState('photo', false)"
              @drop.prevent="handleEvidenceDrop($event, 'photo')"
            >
              <input
                ref="photoInput"
                type="file"
                accept="image/*"
                class="sr-only"
                @change="handlePhotoUpload"
              />
              <button type="button" class="flex min-h-28 w-full flex-col items-center justify-center rounded-md text-center" @click="photoInput?.click()">
                <span class="text-sm font-bold text-slate-900">Tarik foto ke sini</span>
                <span class="mt-1 text-xs text-slate-500">atau klik untuk memilih gambar</span>
                <span class="mt-3 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">Maksimal 1.5 MB</span>
              </button>
            </div>
            <div
              :class="[
                'rounded-lg border border-dashed bg-white p-4 transition',
                dragState.video ? 'border-violet-500 bg-violet-50' : 'border-slate-300 hover:border-violet-400'
              ]"
              @dragenter.prevent="setDragState('video', true)"
              @dragover.prevent="setDragState('video', true)"
              @dragleave.prevent="setDragState('video', false)"
              @drop.prevent="handleEvidenceDrop($event, 'video')"
            >
              <input
                ref="videoInput"
                type="file"
                accept="video/*"
                class="sr-only"
                @change="handleVideoUpload"
              />
              <button type="button" class="flex min-h-28 w-full flex-col items-center justify-center rounded-md text-center" @click="videoInput?.click()">
                <span class="text-sm font-bold text-slate-900">Tarik video ke sini</span>
                <span class="mt-1 text-xs text-slate-500">atau klik untuk memilih video</span>
                <span class="mt-3 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">Gimmick prototype</span>
              </button>
            </div>

            <div v-if="newReport.evidence?.photo" class="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <img :src="newReport.evidence.photo.dataUrl" :alt="newReport.evidence.photo.name" class="h-40 w-full object-cover" />
              <div class="flex items-center justify-between gap-3 px-3 py-2 text-xs text-slate-600">
                <span class="truncate">{{ newReport.evidence.photo.name }}</span>
                <button type="button" class="font-semibold text-red-600 hover:text-red-700" @click="removePhotoEvidence">Hapus</button>
              </div>
            </div>

            <div v-if="newReport.evidence?.video" class="rounded-lg border border-slate-200 bg-white p-3">
              <p class="text-sm font-semibold text-slate-800">{{ newReport.evidence.video.name }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ formatBytes(newReport.evidence.video.size) }} - {{ newReport.evidence.video.status }}</p>
              <button type="button" class="mt-3 text-xs font-semibold text-red-600 hover:text-red-700" @click="removeVideoEvidence">Hapus video</button>
            </div>
          </div>
          <p v-if="uploadMessage" class="mt-2 text-sm font-semibold text-amber-700">{{ uploadMessage }}</p>
        </div>

        <div class="flex flex-col gap-3 lg:col-span-2 sm:flex-row sm:items-center">
          <button type="submit" class="rounded-lg bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400">
            Kirim Laporan
          </button>
          <p v-if="successMessage" class="text-sm font-semibold text-emerald-700">{{ successMessage }}</p>
        </div>
      </form>
    </section>

    <section class="card p-6">
      <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-semibold text-cyan-700">Status Laporan</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Laporan Belum Ditangani</h2>
        </div>

        <div class="flex flex-wrap gap-3">
          <select v-model="openFilterType" class="form-input text-sm">
            <option value="">Semua Tipe</option>
            <option value="congestion">Kemacetan</option>
            <option value="accident">Kecelakaan</option>
            <option value="hazard">Hambatan</option>
            <option value="maintenance">Perbaikan</option>
            <option value="other">Lainnya</option>
          </select>
          <select v-model="openFilterStatus" class="form-input text-sm">
            <option value="">Semua Status</option>
            <option value="new">Baru</option>
            <option value="in-progress">Sedang Ditangani</option>
          </select>
        </div>
      </div>

      <div class="space-y-4">
        <article v-for="report in filteredOpenReports" :key="report.id" class="card p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
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

          <div v-if="report.evidence" class="mt-4 grid gap-3 md:grid-cols-2">
            <div v-if="report.evidence.photo" class="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <img :src="report.evidence.photo.dataUrl" :alt="report.evidence.photo.name" class="h-36 w-full object-cover" />
              <p class="px-3 py-2 text-xs font-semibold text-slate-600">Foto bukti: {{ report.evidence.photo.name }}</p>
            </div>
            <div v-if="report.evidence.video" class="rounded-lg border border-slate-200 bg-white p-3">
              <p class="text-sm font-semibold text-slate-800">Video bukti tersedia</p>
              <p class="mt-1 text-xs text-slate-500">{{ report.evidence.video.name }} - {{ report.evidence.video.status }}</p>
            </div>
          </div>

          <div class="mt-4 flex flex-col gap-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>Reporter: {{ report.reporter }}</span>
            <span>{{ report.responses }} respons</span>
          </div>
        </article>
        <p v-if="!filteredOpenReports.length" class="rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
          Tidak ada laporan belum ditangani pada filter ini.
        </p>
      </div>
    </section>

    <section class="card p-6">
      <div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-sm font-semibold text-emerald-700">Riwayat Penanganan</p>
          <h2 class="mt-1 text-xl font-bold text-slate-950">Laporan Sudah Ditangani</h2>
        </div>

        <select v-model="resolvedFilterType" class="form-input text-sm">
          <option value="">Semua Tipe</option>
          <option value="congestion">Kemacetan</option>
          <option value="accident">Kecelakaan</option>
          <option value="hazard">Hambatan</option>
          <option value="maintenance">Perbaikan</option>
          <option value="other">Lainnya</option>
        </select>
      </div>

      <div class="space-y-4">
        <article v-for="report in filteredResolvedReports" :key="report.id" class="card p-4">
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
            </div>
          </div>

          <p class="mt-3 text-slate-700">{{ report.description }}</p>
          <div class="mt-4 flex flex-col gap-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>Reporter: {{ report.reporter }}</span>
            <span>{{ report.responses }} respons</span>
          </div>
        </article>
        <p v-if="!filteredResolvedReports.length" class="rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
          Belum ada laporan selesai pada filter ini.
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from '../../shared/api/client'

const newReport = ref({
  type: '',
  location: '',
  description: '',
  priority: 'medium',
  evidence: {
    photo: null,
    video: null
  }
})

const openFilterType = ref('')
const openFilterStatus = ref('')
const resolvedFilterType = ref('')
const successMessage = ref('')
const uploadMessage = ref('')
const photoInput = ref(null)
const videoInput = ref(null)
const dragState = ref({
  photo: false,
  video: false
})

const fallbackReports = [
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
]

const reports = ref(fallbackReports)

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

const filteredOpenReports = computed(() => {
  return reports.value.filter(report => {
    const matchesType = !openFilterType.value || report.type === openFilterType.value
    const matchesStatus = !openFilterStatus.value || report.status === openFilterStatus.value
    return report.status !== 'resolved' && matchesType && matchesStatus
  })
})

const filteredResolvedReports = computed(() => {
  return reports.value.filter(report => {
    const matchesType = !resolvedFilterType.value || report.type === resolvedFilterType.value
    return report.status === 'resolved' && matchesType
  })
})

const formatBytes = (bytes = 0) => {
  if (!bytes) {
    return '0 KB'
  }

  const units = ['B', 'KB', 'MB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / (1024 ** index)
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const handlePhotoUpload = async (event) => {
  const file = event.target.files?.[0]
  await processPhotoFile(file)
}

const processPhotoFile = async (file) => {
  uploadMessage.value = ''

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    uploadMessage.value = 'File foto harus berupa gambar.'
    return
  }

  if (file.size > 1.5 * 1024 * 1024) {
    uploadMessage.value = 'Ukuran foto terlalu besar untuk prototype. Gunakan foto maksimal 1.5 MB.'

    if (photoInput.value) {
      photoInput.value.value = ''
    }

    return
  }

  const dataUrl = await readFileAsDataUrl(file)
  newReport.value.evidence.photo = {
    type: 'photo',
    name: file.name,
    size: file.size,
    mimeType: file.type,
    dataUrl
  }
}

const handleVideoUpload = (event) => {
  const file = event.target.files?.[0]
  processVideoFile(file)
}

const processVideoFile = (file) => {
  uploadMessage.value = ''

  if (!file) {
    return
  }

  if (!file.type.startsWith('video/')) {
    uploadMessage.value = 'File video harus berupa video.'
    return
  }

  newReport.value.evidence.video = {
    type: 'video',
    name: file.name,
    size: file.size,
    mimeType: file.type,
    status: 'Simulasi upload video prototype'
  }
}

const setDragState = (type, value) => {
  dragState.value[type] = value
}

const handleEvidenceDrop = async (event, type) => {
  setDragState(type, false)
  const file = event.dataTransfer?.files?.[0]

  if (type === 'photo') {
    await processPhotoFile(file)
    return
  }

  processVideoFile(file)
}

const removePhotoEvidence = () => {
  newReport.value.evidence.photo = null

  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

const removeVideoEvidence = () => {
  newReport.value.evidence.video = null

  if (videoInput.value) {
    videoInput.value.value = ''
  }
}

const submitReport = async () => {
  if (!newReport.value.type || !newReport.value.location || !newReport.value.description) {
    return
  }

  const payload = {
    type: newReport.value.type,
    location: newReport.value.location,
    description: newReport.value.description,
    priority: newReport.value.priority,
    reporter: 'Anda',
    evidence: newReport.value.evidence.photo || newReport.value.evidence.video
      ? newReport.value.evidence
      : null
  }

  try {
    const createdReport = await api.createReport(payload)
    reports.value.unshift(createdReport)
  } catch {
    reports.value.unshift({
      id: Date.now(),
      ...payload,
      status: 'new',
      time: 'Baru saja',
      responses: 0
    })
  }

  newReport.value = {
    type: '',
    location: '',
    description: '',
    priority: 'medium',
    evidence: {
      photo: null,
      video: null
    }
  }

  if (photoInput.value) {
    photoInput.value.value = ''
  }

  if (videoInput.value) {
    videoInput.value.value = ''
  }

  uploadMessage.value = ''
  successMessage.value = 'Laporan berhasil dikirim dan masuk status Baru.'
}

onMounted(async () => {
  try {
    reports.value = await api.getPublicReports()
  } catch {
    reports.value = fallbackReports
  }
})
</script>

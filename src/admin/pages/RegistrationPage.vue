<template>
  <div class="register-page min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
    <div class="w-full max-w-md">
      <!-- Logo/Header -->
      <div class="mb-8 text-center">
        <div class="inline-flex h-16 w-16 items-center justify-center rounded-2xl
                    bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg">
          <span class="text-2xl font-black text-white">MH</span>
        </div>
        <h1 class="mt-4 text-3xl font-black text-white">Balikpapan MoveHub</h1>
        <p class="mt-2 text-slate-400">Dashboard Mobilitas & Transportasi Kota</p>
      </div>

      <!-- Registration Card -->
      <div class="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-xl
                  shadow-2xl overflow-hidden">
        <div class="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-6 py-4 border-b border-slate-700/30">
          <h2 class="text-xl font-bold text-white">Daftar Akun Admin</h2>
          <p class="mt-1 text-sm text-slate-400">Buat akun baru untuk mengakses dashboard</p>
        </div>

        <form @submit.prevent="handleRegister" class="p-6 space-y-4">
          <!-- Username Input -->
          <div>
            <label for="username" class="block text-sm font-semibold text-slate-300 mb-2">
              Nama Lengkap
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="Nama admin"
              required
              class="w-full px-4 py-2.5 rounded-lg border border-slate-600/50 bg-slate-700/30
                     text-white placeholder-slate-500 focus:border-cyan-500 focus:bg-slate-700/50
                     focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
            />
          </div>

          <!-- Email Input -->
          <div>
            <label for="reg-email" class="block text-sm font-semibold text-slate-300 mb-2">
              Email
            </label>
            <input
              id="reg-email"
              v-model="form.email"
              type="email"
              placeholder="admin@example.com"
              required
              class="w-full px-4 py-2.5 rounded-lg border border-slate-600/50 bg-slate-700/30
                     text-white placeholder-slate-500 focus:border-cyan-500 focus:bg-slate-700/50
                     focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
            />
          </div>

          <!-- Password Input -->
          <div>
            <label for="reg-password" class="block text-sm font-semibold text-slate-300 mb-2">
              Password
            </label>
            <input
              id="reg-password"
              v-model="form.password"
              type="password"
              placeholder="Minimal 6 karakter"
              required
              minlength="6"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-600/50 bg-slate-700/30
                     text-white placeholder-slate-500 focus:border-cyan-500 focus:bg-slate-700/50
                     focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
            />
            <p class="mt-1 text-xs text-slate-400">Minimal 6 karakter</p>
          </div>

          <!-- Confirm Password Input -->
          <div>
            <label for="confirm-password" class="block text-sm font-semibold text-slate-300 mb-2">
              Konfirmasi Password
            </label>
            <input
              id="confirm-password"
              v-model="form.confirmPassword"
              type="password"
              placeholder="Ulangi password"
              required
              class="w-full px-4 py-2.5 rounded-lg border border-slate-600/50 bg-slate-700/30
                     text-white placeholder-slate-500 focus:border-cyan-500 focus:bg-slate-700/50
                     focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
            />
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
            <p class="text-sm font-medium text-red-300">{{ errorMessage }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
            <p class="text-sm font-medium text-emerald-300">{{ successMessage }}</p>
          </div>

          <!-- Register Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600
                   text-white font-semibold shadow-lg hover:shadow-xl hover:from-cyan-400 hover:to-blue-500
                   disabled:opacity-50 disabled:cursor-not-allowed transition mt-6"
          >
            {{ isLoading ? 'Sedang Mendaftar...' : 'Daftar' }}
          </button>
        </form>

        <!-- Login Link -->
        <div class="px-6 py-4 border-t border-slate-700/30 bg-slate-900/30">
          <p class="text-center text-slate-400">
            Sudah punya akun?
            <button
              @click="$emit('switchToLogin')"
              class="text-cyan-400 hover:text-cyan-300 font-semibold transition"
            >
              Login di sini
            </button>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <p class="mt-6 text-center text-xs text-slate-500">
        Balikpapan Smart City 2026 &copy; All rights reserved
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authService } from '../../shared/services/authService'

const emit = defineEmits(['switchToLogin', 'registerSuccess'])

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  // Validation
  if (!form.value.username || !form.value.email || !form.value.password || !form.value.confirmPassword) {
    errorMessage.value = 'Semua field harus diisi'
    return
  }

  if (form.value.password.length < 6) {
    errorMessage.value = 'Password minimal 6 karakter'
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'Password tidak cocok'
    return
  }

  isLoading.value = true

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800))

  const result = authService.register(form.value.email, form.value.password, form.value.username)

  isLoading.value = false

  if (result.success) {
    successMessage.value = result.message
    setTimeout(() => {
      emit('registerSuccess')
    }, 1500)
  } else {
    errorMessage.value = result.message
  }
}
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>

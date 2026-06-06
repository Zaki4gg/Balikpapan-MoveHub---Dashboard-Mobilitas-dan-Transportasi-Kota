## Progress Realisasi mingggu ke-2
Progress Terbaru: 
- memisahkan program admin dan publik supaya publik tidak asal mengakses dashboard bagian admin.
- memperbaiki tampilan dan mengoptimalkan peta supaya lebih interaktif dan simulasi lebih terlihat bagus
- menambahkan halaman pada dashboard publik
- memperbaiki fitur laporan pada dashboard publik agar datanya tersimpan sebagai simulasi dan menampilkan pada dashboard admin, selain itu juga simulasi penanggulangan laporan terlihat lebih bagus dan nyata sehingga status bisa berubah.

## Progress Realisasi mingggu ke-3 (6 Juni 2026)

### ✅ Authentication System - Login & Registration Pages
#### Fitur yang telah ditambahkan:
1. **Authentication Service** (`src/shared/services/authService.js`)
   - Mengelola login, registrasi, dan logout
   - Menyimpan data pengguna di localStorage
   - Validasi email dan password
   - Support untuk multiple admin accounts

2. **Login Page** (`src/admin/pages/LoginPage.vue`)
   - Form login dengan email dan password
   - Validasi input form
   - Error message yang user-friendly
   - Demo credentials ditampilkan: 
     - Email: `admin@balikpapan.id`
     - Password: `admin123`
   - Link untuk switch ke registration page
   - Loading state saat proses login

3. **Registration Page** (`src/admin/pages/RegistrationPage.vue`)
   - Form registrasi dengan validasi lengkap
   - Validasi password minimum 6 karakter
   - Validasi konfirmasi password sama
   - Validasi email belum terdaftar
   - Error message yang informatif
   - Link untuk switch ke login page
   - Loading state saat proses registrasi

4. **Logout Button**
   - Tombol logout di AdminHeader (warna merah)
   - Menghapus session dan kembali ke login page
   - Menampilkan nama user yang sedang login

5. **Updated AppAdmin.vue**
   - Implementasi proteksi akses
   - Cek authentication saat component mount
   - Routing otomatis antara login/register/dashboard
   - Display nama user di header dengan initial

#### Testing Results:
✅ Login dengan demo user berhasil
✅ Registrasi user baru berhasil
✅ Login dengan user baru berhasil
✅ Logout berfungsi dengan baik
✅ Nama user ditampilkan di header dengan initial
✅ Redirect otomatis ke login ketika belum authenticated

# Admin Authentication System

## Overview
Sistem autentikasi lengkap untuk dashboard admin Balikpapan MoveHub dengan fitur login, registrasi, dan logout.

## Fitur Utama

### 1. Login Page
- Form login dengan email dan password
- Validasi kredensial
- Demo account yang dapat langsung digunakan
- Error handling yang user-friendly

**Demo Credentials:**
- Email: `admin@balikpapan.id`
- Password: `admin123`

### 2. Registration Page
- Form registrasi untuk admin baru
- Validasi:
  - Email tidak boleh sudah terdaftar
  - Password minimum 6 karakter
  - Konfirmasi password harus sama
- Validasi form real-time
- Redirect ke login setelah registrasi sukses

### 3. Logout Functionality
- Tombol logout di header dashboard
- Logout menghapus session dan redirect ke login page
- Display nama user yang sedang login dengan initial

## File Structure

```
src/
├── shared/
│   └── services/
│       └── authService.js          # Authentication service
├── admin/
│   ├── pages/
│   │   ├── LoginPage.vue           # Login page component
│   │   └── RegistrationPage.vue    # Registration page component
│   ├── components/
│   │   └── AdminHeader.vue         # Updated dengan logout button
│   └── ...
└── AppAdmin.vue                     # Updated dengan auth logic
```

## How It Works

### Authentication Flow

1. **Initial Load**
   - App checks localStorage untuk token authenticated
   - Jika tidak ada, tampilkan login page
   - Jika ada, tampilkan dashboard

2. **Login Process**
   - User memasukkan email & password
   - Service mencari user di localStorage
   - Jika cocok, simpan session di localStorage
   - Redirect ke dashboard

3. **Registration Process**
   - User mengisi form dengan nama, email, password
   - Service validasi email belum terdaftar
   - Simpan user baru di localStorage
   - Redirect ke login page

4. **Logout Process**
   - User klik logout button
   - Session dihapus dari localStorage
   - Redirect ke login page

## API Service Structure

### authService Methods

```javascript
// Check if user is authenticated
authService.isAuthenticated()

// Get current logged-in user
authService.getCurrentUser()

// Login with email and password
authService.login(email, password)

// Register new admin
authService.register(email, password, username)

// Logout
authService.logout()

// Get all registered users
authService.getAllUsers()

// Find user by email
authService.findUserByEmail(email)

// Initialize demo user
authService.initializeDemoUser()
```

## Data Storage

User data disimpan di localStorage dengan struktur:

**Auth Session (admin_auth)**
```json
{
  "isAuthenticated": true,
  "user": {
    "id": 1,
    "email": "admin@balikpapan.id",
    "username": "Administrator"
  },
  "loginTime": "2026-06-06T11:42:44.000Z"
}
```

**Users Registry (admin_users)**
```json
[
  {
    "id": 1,
    "email": "admin@balikpapan.id",
    "password": "admin123",
    "username": "Administrator",
    "createdAt": "2026-06-06T11:42:44.000Z"
  }
]
```

## Component Props & Events

### LoginPage.vue
**Emits:**
- `switchToRegister` - Switch ke registration page
- `loginSuccess` - Login berhasil

### RegistrationPage.vue
**Emits:**
- `switchToLogin` - Switch ke login page
- `registerSuccess` - Registrasi berhasil

### AdminHeader.vue
**Props:**
- `title` - Judul halaman
- `sectionLabel` - Label section
- `userLabel` - Nama user
- `userInitials` - Initial nama user

**Emits:**
- `logout` - Emit saat logout button diklik

## Security Notes

⚠️ **Current Implementation:**
- Password disimpan plain text (hanya untuk demo)
- Menggunakan localStorage (accessible dari console)

⚠️ **For Production:**
- Hash password dengan bcrypt atau similar
- Gunakan secure session/JWT tokens
- Implementasi HTTPS
- Add CSRF protection
- Input sanitization

## Testing Checklist

✅ Login dengan demo credentials
✅ Login dengan akun baru
✅ Registrasi akun baru
✅ Password validation (minimum 6 karakter)
✅ Email validation (tidak boleh duplicate)
✅ Logout functionality
✅ Redirect logic
✅ Error messages
✅ Success messages

## Future Enhancements

- [ ] Password hashing (bcrypt)
- [ ] JWT token implementation
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Role-based access control (RBAC)
- [ ] Admin user management panel
- [ ] Login history/audit log
- [ ] Session timeout
- [ ] Remember me functionality

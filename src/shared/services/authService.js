// Simple authentication service using localStorage
const STORAGE_KEY = 'admin_auth'
const USERS_KEY = 'admin_users'

export const authService = {
  // Initialize with demo user
  initializeDemoUser() {
    const users = this.getAllUsers()
    if (users.length === 0) {
      const demoUser = {
        id: 1,
        email: 'admin@balikpapan.id',
        password: 'admin123', // In production, this should be hashed
        username: 'Administrator',
        createdAt: new Date().toISOString()
      }
      localStorage.setItem(USERS_KEY, JSON.stringify([demoUser]))
    }
  },

  // Get all registered users
  getAllUsers() {
    const users = localStorage.getItem(USERS_KEY)
    return users ? JSON.parse(users) : []
  },

  // Find user by email
  findUserByEmail(email) {
    const users = this.getAllUsers()
    return users.find(user => user.email === email)
  },

  // Register new user
  register(email, password, username) {
    const existingUser = this.findUserByEmail(email)
    if (existingUser) {
      return { success: false, message: 'Email sudah terdaftar' }
    }

    const newUser = {
      id: Date.now(),
      email,
      password, // In production, hash this!
      username,
      createdAt: new Date().toISOString()
    }

    const users = this.getAllUsers()
    users.push(newUser)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))

    return { success: true, message: 'Registrasi berhasil, silakan login', user: newUser }
  },

  // Login user
  login(email, password) {
    const user = this.findUserByEmail(email)
    
    if (!user) {
      return { success: false, message: 'Email tidak ditemukan' }
    }

    if (user.password !== password) {
      return { success: false, message: 'Password salah' }
    }

    const authData = {
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      loginTime: new Date().toISOString()
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData))
    return { success: true, message: 'Login berhasil', user: authData.user }
  },

  // Logout user
  logout() {
    localStorage.removeItem(STORAGE_KEY)
    return { success: true, message: 'Logout berhasil' }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const authData = localStorage.getItem(STORAGE_KEY)
    if (!authData) return false

    try {
      const data = JSON.parse(authData)
      return data.isAuthenticated === true
    } catch {
      return false
    }
  },

  // Get current authenticated user
  getCurrentUser() {
    const authData = localStorage.getItem(STORAGE_KEY)
    if (!authData) return null

    try {
      const data = JSON.parse(authData)
      return data.user || null
    } catch {
      return null
    }
  },

  // Get auth data
  getAuthData() {
    const authData = localStorage.getItem(STORAGE_KEY)
    if (!authData) return null

    try {
      return JSON.parse(authData)
    } catch {
      return null
    }
  }
}

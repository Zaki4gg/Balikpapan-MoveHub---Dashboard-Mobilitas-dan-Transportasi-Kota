import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'admin-dev-entry',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (request.url === '/' || request.url === '/index.html') {
            response.writeHead(302, { Location: '/admin.html' })
            response.end()
            return
          }

          next()
        })
      }
    }
  ],
  build: {
    outDir: 'dist-admin',
    rollupOptions: {
      input: {
        admin: 'admin.html'
      }
    }
  }
})

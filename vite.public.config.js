import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'public-dev-entry',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (request.url === '/admin.html') {
            response.writeHead(404, { 'Content-Type': 'text/plain' })
            response.end('Admin app is not served by the public dev server.')
            return
          }

          next()
        })
      }
    }
  ],
  build: {
    outDir: 'dist-public',
    rollupOptions: {
      input: {
        public: 'index.html'
      }
    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist-public',
    rollupOptions: {
      input: {
        public: 'index.html'
      }
    }
  }
})

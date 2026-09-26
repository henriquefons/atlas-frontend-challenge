import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Compiles the .vue single file components mounted by @vue/test-utils.
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '#data': fileURLToPath(new URL('./data', import.meta.url)),
      '#server': fileURLToPath(new URL('./server', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['test/unit/**/*.spec.ts'],
  },
})

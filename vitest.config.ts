import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '#data': fileURLToPath(new URL('./data', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['test/unit/**/*.spec.ts'],
  },
})

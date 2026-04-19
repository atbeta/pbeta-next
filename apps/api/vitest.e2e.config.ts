import { defineConfig } from 'vitest/config'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env before tests — ensures DATABASE_URL and REDIS_URL are available
config({ path: resolve(__dirname, '.env') })

export default defineConfig({
  test: {
    include: ['test/**/*.e2e-spec.ts'],
    globals: true,
    environment: 'node',
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Run E2E tests serially — shared DB state
    fileParallelism: false,
    sequence: { concurrent: false },
  },
})

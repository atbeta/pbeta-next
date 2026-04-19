import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname } from 'node:path'

// Polyfill import.meta for Jest CJS mode.
// Prisma 7 generated client uses import.meta.url to resolve __dirname.
if (typeof (global as Record<string, unknown>)['import'] === 'undefined') {
  Object.defineProperty(global, 'import', {
    value: {
      meta: {
        url: pathToFileURL(__filename).href,
      },
    },
    writable: true,
    configurable: true,
  })
}

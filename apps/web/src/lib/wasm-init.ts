import init, {
  matmul,
  gaussian_filter,
  dot_product,
  prime_sieve,
  mandelbrot,
  initSync,
} from './wasm/pbeta_wasm.js'

let ready = false
let initPromise: Promise<void> | null = null

async function tryInit(): Promise<void> {
  try {
    await init()
    console.log('[WASM] init() succeeded via fetch')
    ready = true
    return
  } catch (e) {
    console.warn('[WASM] init() fetch failed, trying initSync...', e)
  }

  try {
    const resp = await fetch('/pbeta_wasm_bg.wasm')
    if (!resp.ok) throw new Error('fetch public/ failed: ' + resp.status)
    const buf = await resp.arrayBuffer()
    initSync(buf)
    console.log('[WASM] initSync() from public/ succeeded')
    ready = true
  } catch (e2) {
    console.error('[WASM] initSync() also failed:', e2)
    throw e2
  }
}

export async function initWasm(): Promise<void> {
  if (ready) return
  if (!initPromise) {
    initPromise = tryInit()
  }
  return initPromise
}

export function isWasmReady(): boolean {
  return ready
}

export { matmul, gaussian_filter, dot_product, prime_sieve, mandelbrot }

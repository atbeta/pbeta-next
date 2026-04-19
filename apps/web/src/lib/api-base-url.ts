const PROD_API_FALLBACK = 'https://appsapi-production-3396.up.railway.app'
const DEV_API_FALLBACK = 'http://localhost:3001'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'production' ? PROD_API_FALLBACK : DEV_API_FALLBACK)


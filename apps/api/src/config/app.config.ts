import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  CORS_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  API_KEY: z.string().min(8),
})

export type AppEnv = z.infer<typeof envSchema>

export function validateEnv(env: Record<string, unknown>): AppEnv {
  const result = envSchema.safeParse(env)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    throw new Error(`Invalid environment variables:\n${JSON.stringify(errors, null, 2)}`)
  }
  return result.data
}

export default () => {
  const env = validateEnv(process.env)
  return {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    corsOrigin: env.CORS_ORIGIN,
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
    },
    apiKey: env.API_KEY,
  }
}

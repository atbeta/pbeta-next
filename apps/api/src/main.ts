import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = (process.env.CORS_ORIGIN ?? 'https://pbeta.me')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    app.enableCors({
      origin: (
        origin: string | undefined,
        callback: (error: Error | null, allow?: boolean) => void,
      ) => {
        // Allow same-origin and server-to-server requests without Origin header.
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
          return
        }

        callback(new Error(`Origin not allowed by CORS: ${origin}`), false)
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    })
  } else {
    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    })
  }

  app.setGlobalPrefix('api/v1')

  // Swagger — available at /api/docs (dev only in production)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('pbeta API')
      .setDescription('API for pbeta.me — service monitoring, comments, and feedback')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
  }

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.log(`API running on http://localhost:${port}/api/v1`)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Swagger docs: http://localhost:${port}/api/docs`)
  }
}

bootstrap()

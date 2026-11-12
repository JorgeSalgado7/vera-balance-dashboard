import { AppLogger } from './shared/logger/app-logger.service'
import type { ValidationError } from 'class-validator'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { HttpProblemFilter } from './shared/http-problem/http-problem.filter'
import { HttpProblem } from './shared/http-problem/http-problem.util'
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module'
import { openApiHeader } from './docs/openapi.header';
import { usersOperationsSorter } from './docs/users-operations-sorter'

const logger = new AppLogger()

async function bootstrap() {
  logger.info('Bootstrap', 'app.starting', { runtime: process.version })
  logger.info('Bootstrap', 'app.configuration', {
    environment: ['development', 'production', 'test'].includes(process.env.NODE_ENV ?? '') ? process.env.NODE_ENV : 'custom',
    configured: {
      dynamodb: Boolean(process.env.DYNAMO_TABLE_NAME),
      resend: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
      jwt: Boolean(process.env.JWT_ACCESS_SECRET && process.env.JWT_REFRESH_SECRET),
    },
  })
  const app = await NestFactory.create(AppModule)

  //*CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    exposedHeaders: ['Content-Disposition', 'Content-Length'],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const extractErrors = (errorsArray: ValidationError[], parent = ''): { field: string; message: string }[] => {
          const messages: { field: string; message: string }[] = []

          for (const err of errorsArray) {
            const field = parent ? `${parent}.${err.property}` : err.property
            if (err.constraints) {
              messages.push(...Object.entries(err.constraints).map(([constraint, message]) => ({ field, message: constraint === 'whitelistValidation' ? `El campo «${field}» no está permitido en esta solicitud.` : message })))
            }

            if (err.children?.length) {
              messages.push(...extractErrors(err.children, field))
            }
          }

          return messages
        }

        return HttpProblem.badRequest('Revisa los campos indicados e inténtalo de nuevo.', '', extractErrors(errors))
      },
    }),
  )

  app.useGlobalFilters(new HttpProblemFilter())
	
	const documentation = SwaggerModule.createDocument(app, openApiHeader)
	SwaggerModule.setup('docs', app, documentation, {
    swaggerOptions: { operationsSorter: usersOperationsSorter },
  })

  await app.listen(process.env.PORT ?? 3000)
  logger.info('Bootstrap', 'app.listening', { port: process.env.PORT ?? 3000, docsPath: '/docs' })
}

void bootstrap().catch(error => {
  logger.error('Bootstrap', 'app.start.failed', error)
  process.exitCode = 1
})

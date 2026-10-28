import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { HttpProblemFilter } from './shared/http-problem/http-problem.filter'
import { HttpProblem } from './shared/http-problem/http-problem.util'
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module'
import { openApiHeader } from './docs/openapi.header';

async function bootstrap() {
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
        const extractErrors = (errorsArray: any[]): { message: string }[] => {
          const messages: { message: string }[] = []

          for (const err of errorsArray) {
            if (err.constraints) {
              messages.push(...(Object.values(err.constraints) as string[]).map((message) => ({ message })))
            }

            if (err.children?.length) {
              messages.push(...extractErrors(err.children))
            }
          }

          return messages
        }

        return HttpProblem.badRequest('Validate that the elements in the errors parameter exist and are correct.', '', extractErrors(errors))
      },
    }),
  )

  app.useGlobalFilters(new HttpProblemFilter())
	
	const documentation = SwaggerModule.createDocument(app, openApiHeader)
	SwaggerModule.setup('docs', app, documentation)

  await app.listen(process.env.PORT ?? 3000)
}

void bootstrap()

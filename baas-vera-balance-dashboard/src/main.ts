import {
  ValidationError,
  ValidationPipe,
  VersioningType
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpProblemFilter } from './shared/http-problem/http-problem.filter';
import { HttpProblem } from './shared/http-problem/http-problem.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({ type: VersioningType.URI  });

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PATCH,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization'
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const extractErrors = ( errorsArray: ValidationError[] ): { message: string }[] => {
          const messages: { message: string }[] = [];

          for (const error of errorsArray) {
            if (error.constraints) {
              messages.push( ...Object.values(error.constraints).map((message) => ({  message })));
            }

            if (error.children?.length) {
              messages.push(...extractErrors(error.children));
            }
          }

          return messages;
        };

        return HttpProblem.badRequest(
          'Validate that the elements in the errors parameter exist and are correct.',
          '',
          extractErrors(errors)
        );
      }
    })
  );

  app.useGlobalFilters( new HttpProblemFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vera Balance API')
    .setDescription('Vera Balance Dashboard API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
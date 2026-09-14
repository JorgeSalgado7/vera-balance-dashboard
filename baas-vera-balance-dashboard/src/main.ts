import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpProblemFilter } from './shared/http-problem/http-problem.filter';
import { HttpProblem } from './shared/http-problem/http-problem.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.enableCors({
    origin: '*',
    methods: 'GET,POST,PATCH,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const extractErrors = (errorsArray: any[]): { message: string }[] => {
          const messages: { message: string }[] = [];

          for (const err of errorsArray) {
            if (err.constraints) {
              messages.push( ...(Object.values(err.constraints) as string[]).map((message) => ({ message  })));
            }

            if (err.children?.length) {
              messages.push(...extractErrors(err.children));
            }
          }

          return messages;
        };

        return HttpProblem.badRequest(
          'Validate that the elements in the errors parameter exist and are correct.',
          '',
          extractErrors(errors),
        );
      },
    }),
  );

  app.useGlobalFilters(new HttpProblemFilter());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

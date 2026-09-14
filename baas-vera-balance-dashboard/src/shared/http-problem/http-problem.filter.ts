import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

//* Error translators

import { HttpProblem } from './http-problem.util';

type ErrorTranslator = { translate(error: unknown, instance: string): never | void; };

type HttpExceptionResponse = {
  type?: string;
  title?: string;
  status?: number;
  instance?: string;
  detail?: string;
  statusCode?: number;
  message?: string | string[];
  error?: string;
  errors?: Array<{ field?: string;  message: string; }>;
};

//* List translators
const errorTranslators: ErrorTranslator[] = [];

@Catch()
export class HttpProblemFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const instance = request.originalUrl;

    if (instance === '/favicon.ico') {
      return response.status(HttpStatus.NO_CONTENT).send();
    }

    const translatedProblem = this.translate( exception, instance);

    if (translatedProblem) {
      return this.sendProblem(response, translatedProblem, instance);
    }

    if (exception instanceof HttpProblem) {
      return this.sendProblem(response, exception, instance);
    }

    if (exception instanceof HttpException) {
      return this.handleHttpException(response, exception, instance);
    }

    console.error('ERROR:', exception);

    return this.sendProblem(
      response,
      HttpProblem.internal(
        'An unexpected error has occurred. Please try again later.',
        instance,
      ),
      instance,
    );
  }

  private translate(exception: unknown, instance: string): HttpException | null {
    for (const translator of errorTranslators) {
      try {
        translator.translate(exception, instance);
      } catch (translated) {
        if (translated instanceof HttpException) {
          return translated;
        }

        throw translated;
      }
    }

    return null;
  }

  private handleHttpException(response: Response, exception: HttpException, instance: string) {
    const status = exception.getStatus();
    const rawResponse = exception.getResponse();

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error('ERROR:', exception);
    }

    if (typeof rawResponse === 'string') {
      return this.sendProblem(
        response,
        this.createProblemByStatus(
          status,
          rawResponse,
          instance,
        ),
        instance,
      );
    }

    const normalized = rawResponse as HttpExceptionResponse;

    if (
      normalized.type &&
      normalized.title &&
      normalized.status &&
      normalized.detail
    ) {
      return response.status(status).json({ ...normalized, instance });
    }

    if ( status === HttpStatus.BAD_REQUEST && Array.isArray(normalized.message)) {
      const errors = normalized.message.map((message) => ({ message }));

      return this.sendProblem(
        response,
        HttpProblem.badRequest(
          'Validate that the elements in the errors parameter exist and are correct.',
          instance,
          errors,
        ),
        instance,
      );
    }

    const detail = typeof normalized.message === 'string' ? normalized.message : normalized.detail ?? this.resolveDefaultDetail(status);

    return this.sendProblem( response,  this.createProblemByStatus(status, detail, instance), instance );
  }

  private createProblemByStatus(status: number, detail: string, instance: string): HttpProblem {
    switch (status) {
      case HttpStatus.BAD_REQUEST: return HttpProblem.badRequest(detail, instance);
      case HttpStatus.UNAUTHORIZED: return HttpProblem.unauthorized(detail, instance);
      case HttpStatus.FORBIDDEN: return HttpProblem.forbidden(detail, instance);
      case HttpStatus.NOT_FOUND:  return HttpProblem.notFound(detail, instance,);
      case HttpStatus.CONFLICT: return HttpProblem.conflict(detail, instance);
      case HttpStatus.SERVICE_UNAVAILABLE: return HttpProblem.serviceUnavailable(detail, instance);
      default: return HttpProblem.internal(detail, instance);
    }
  }

  private resolveDefaultDetail(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST: return 'Validate that the elements in the errors parameter exist and are correct.';
      case HttpStatus.UNAUTHORIZED: return 'Authentication is required to access this resource.';
      case HttpStatus.FORBIDDEN: return 'You do not have permission to access this resource.';
      case HttpStatus.NOT_FOUND: return 'No resource was found with the provided ID.';
      case HttpStatus.CONFLICT: return 'A resource with the same identifier already exists.';
      case HttpStatus.SERVICE_UNAVAILABLE: return 'The service is temporarily unavailable.';
      default: return 'An unexpected error has occurred. Please try again later.';
    }
  }

  private sendProblem(response: Response, problem: HttpException, instance: string) {
    const status = problem.getStatus();
    const rawResponse = problem.getResponse();

    const normalizedResponse = typeof rawResponse === 'string' ? { detail: rawResponse } : rawResponse;

    return response.status(status).json({ ...(normalizedResponse as Record<string, unknown>), instance });
  }
}
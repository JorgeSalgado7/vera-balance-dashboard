import { HttpException, HttpStatus } from '@nestjs/common';

type HttpProblemError = {
  field?: string;
  message: string;
};

type HttpProblemResponse = {
  type: string;
  title: string;
  status: number;
  instance: string;
  detail: string;
  errors?: HttpProblemError[];
};

export class HttpProblem extends HttpException {
  private constructor(response: HttpProblemResponse,status: number) {
    super(response, status);
  }

  static badRequest(detail: string, instance: string,errors?: HttpProblemError[]) {
    return new HttpProblem(
      {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
        title: 'Bad request.',
        status: HttpStatus.BAD_REQUEST,
        instance,
        detail,
        ...(errors?.length ? { errors } : {}),
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  static unauthorized(detail: string,instance: string) {
    return new HttpProblem(
      {
        type: 'https://tools.ietf.org/html/rfc7235#section-3.1',
        title: 'Unauthorized.',
        status: HttpStatus.UNAUTHORIZED,
        instance,
        detail,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }

  static forbidden( detail: string, instance: string) {
    return new HttpProblem(
      {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.3',
        title: 'Forbidden.',
        status: HttpStatus.FORBIDDEN,
        instance,
        detail,
      },
      HttpStatus.FORBIDDEN,
    );
  }

  static notFound( detail: string,instance: string) {
    return new HttpProblem(
      {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
        title: 'Resource not found.',
        status: HttpStatus.NOT_FOUND,
        instance,
        detail,
      },
      HttpStatus.NOT_FOUND,
    );
  }

  static conflict(detail: string,instance: string) {
    return new HttpProblem(
      {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.8',
        title: 'The resource already exists.',
        status: HttpStatus.CONFLICT,
        instance,
        detail,
      },
      HttpStatus.CONFLICT,
    );
  }

  static internal(detail: string,instance: string) {
    return new HttpProblem(
      {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.6.1',
        title: 'Internal Server Error.',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        instance,
        detail,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static serviceUnavailable(detail: string,instance: string) {
    return new HttpProblem(
      {
        type: 'https://tools.ietf.org/html/rfc7231#section-6.6.4',
        title: 'Service Unavailable.',
        status: HttpStatus.SERVICE_UNAVAILABLE,
        instance,
        detail,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  static external( response: Record<string, any> | null,instance: string,status: number) {
    const detail =
      response?.detail ??
      response?.Message ??
      response?.message ??
      'An unexpected error has occurred. Please try again later.';

    if (status === HttpStatus.BAD_REQUEST) {
      return HttpProblem.badRequest(detail,instance);
    }

    if (status === HttpStatus.NOT_FOUND) {
      return HttpProblem.notFound(detail,instance);
    }

    if (status === HttpStatus.CONFLICT) {
      return HttpProblem.conflict(detail,instance);
    }

    if (status === HttpStatus.SERVICE_UNAVAILABLE) {
      return HttpProblem.serviceUnavailable(detail,instance);
    }

    return HttpProblem.internal(detail,instance);
  }
}
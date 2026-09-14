import { HttpException, HttpStatus } from '@nestjs/common';

export class HttpProblemException extends HttpException {
  constructor(detail: string, status: HttpStatus, type: string, title: string, instance: string) {
    super(
      {
        type,
        title,
        status,
        instance,
        detail
      },
      status
    );
  }
}

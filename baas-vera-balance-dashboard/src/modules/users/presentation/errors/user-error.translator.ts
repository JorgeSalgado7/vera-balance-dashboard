import { UserNotFoundError } from '../../domain/errors/user.error';
import { HttpProblem } from '../../../../shared/http-problem/http-problem.util';

export class UserErrorTranslator {
  static translate(error: unknown, instance: string): never | void {
    if (error instanceof UserNotFoundError) {
      throw HttpProblem.notFound(error.message, instance);
    }
  }
}

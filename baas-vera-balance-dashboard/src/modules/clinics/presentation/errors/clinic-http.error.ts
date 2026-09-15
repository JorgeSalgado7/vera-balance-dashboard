import {
  ClinicNotFoundError,
  InvalidClinicStatusError,
  MissingClinicAddressError,
  MissingClinicCreatedAtError,
  MissingClinicIdError,
  MissingClinicNameError,
  MissingClinicPhoneNumberError,
  MissingClinicTherapyTypesError,
  MissingClinicUpdatedAtError,
  MissingTherapyTypeIconError,
  MissingTherapyTypeNameError
} from '../../domain/errors/clinic.error';
import { HttpProblem } from '../../../../shared/http-problem/http-problem.util';

export class ClinicErrorTranslator {
  static translate(error: unknown, instance: string): never | void {
    if (
      error instanceof MissingClinicIdError
      || error instanceof MissingClinicNameError
      || error instanceof MissingClinicAddressError
      || error instanceof MissingClinicPhoneNumberError
      || error instanceof MissingClinicTherapyTypesError
      || error instanceof MissingTherapyTypeNameError
      || error instanceof MissingTherapyTypeIconError
      || error instanceof InvalidClinicStatusError
      || error instanceof MissingClinicCreatedAtError
      || error instanceof MissingClinicUpdatedAtError
    ) {
      throw HttpProblem.badRequest(
        error.message,
        instance
      );
    }

    if (error instanceof ClinicNotFoundError) {
      throw HttpProblem.notFound(
        error.message,
        instance
      );
    }
  }
}
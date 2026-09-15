import { Injectable } from '@nestjs/common';
import type { TherapyType } from '../entities/clinic.entity';
import {
  MissingClinicTherapyTypesError,
  MissingTherapyTypeIconError,
  MissingTherapyTypeNameError
} from '../errors/clinic.error';

@Injectable()
export class ValidateTherapyTypesDomainService {

  execute(therapyTypes: TherapyType[]): void {
    if (!therapyTypes.length) {
      throw new MissingClinicTherapyTypesError();
    }

    therapyTypes.forEach((therapyType) => {
      if (!therapyType.name) {
        throw new MissingTherapyTypeNameError();
      }

      if ( therapyType.icon === undefined || therapyType.icon === null) {
        throw new MissingTherapyTypeIconError();
      }
    });
  }
  
}
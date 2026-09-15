import { Injectable } from '@nestjs/common';
import {
  ClinicEntity,
  ClinicStatus,
  TherapyType
} from '../entities/clinic.entity';
import {
  MissingClinicAddressError,
  MissingClinicNameError,
  MissingClinicPhoneNumberError,
  MissingClinicUpdatedAtError
} from '../errors/clinic.error';
import { ValidateClinicStatusDomainService } from './validate-clinic-status.domain-service';
import { ValidateTherapyTypesDomainService } from './validate-therapy-types.domain-service';

@Injectable()
export class UpdateClinicDomainService {
  constructor(
    private readonly validateTherapyTypesDomainService: ValidateTherapyTypesDomainService,
    private readonly validateClinicStatusDomainService: ValidateClinicStatusDomainService
  ) {}

  execute(
    existing: ClinicEntity,
    data: {
      name?: string;
      logo?: string | null;
      address?: string;
      phoneNumber?: string;
      therapyTypes?: TherapyType[];
      status?: ClinicStatus;
      updatedAt: string;
    }
  ): ClinicEntity {
    if (!data.updatedAt) {
      throw new MissingClinicUpdatedAtError();
    }

    if (data.name !== undefined) {
      if (!data.name) {
        throw new MissingClinicNameError();
      }

      existing.name = data.name;
    }

    if (data.logo !== undefined) {
      existing.logo = data.logo;
    }

    if (data.address !== undefined) {
      if (!data.address) {
        throw new MissingClinicAddressError();
      }

      existing.address = data.address;
    }

    if (data.phoneNumber !== undefined) {
      if (!data.phoneNumber) {
        throw new MissingClinicPhoneNumberError();
      }

      existing.phoneNumber = data.phoneNumber;
    }

    if (data.therapyTypes !== undefined) {
      this.validateTherapyTypesDomainService.execute(data.therapyTypes);

      existing.therapyTypes = data.therapyTypes;
    }

    if (data.status !== undefined) {
      this.validateClinicStatusDomainService.execute(data.status);

      existing.status = data.status;
    }

    existing.updatedAt = data.updatedAt;

    return existing;
  }
}
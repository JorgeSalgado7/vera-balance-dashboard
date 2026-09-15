import { Injectable } from '@nestjs/common';
import {
  ClinicEntity,
  TherapyType
} from '../entities/clinic.entity';
import {
  MissingClinicAddressError,
  MissingClinicCreatedAtError,
  MissingClinicIdError,
  MissingClinicNameError,
  MissingClinicPhoneNumberError,
  MissingClinicUpdatedAtError
} from '../errors/clinic.error';
import { ValidateTherapyTypesDomainService } from './validate-therapy-types.domain-service';

@Injectable()
export class CreateClinicDomainService {
  constructor(
    private readonly validateTherapyTypesDomainService: ValidateTherapyTypesDomainService
  ) {}

  execute(data: {
    id: string;
    name: string;
    logo: string | null;
    address: string;
    phoneNumber: string;
    therapyTypes: TherapyType[];
    createdAt: string;
    updatedAt: string;
  }): ClinicEntity {
    if (!data.id) {
      throw new MissingClinicIdError();
    }

    if (!data.name) {
      throw new MissingClinicNameError();
    }

    if (!data.address) {
      throw new MissingClinicAddressError();
    }

    if (!data.phoneNumber) {
      throw new MissingClinicPhoneNumberError();
    }

    if (!data.createdAt) {
      throw new MissingClinicCreatedAtError();
    }

    if (!data.updatedAt) {
      throw new MissingClinicUpdatedAtError();
    }

    this.validateTherapyTypesDomainService.execute(data.therapyTypes);

    const entity = new ClinicEntity();

    entity.id = data.id;
    entity.name = data.name;
    entity.logo = data.logo;
    entity.address = data.address;
    entity.phoneNumber = data.phoneNumber;
    entity.therapyTypes = data.therapyTypes;
    entity.status = 'active';
    entity.createdAt = data.createdAt;
    entity.updatedAt = data.updatedAt;

    return entity;
  }
}
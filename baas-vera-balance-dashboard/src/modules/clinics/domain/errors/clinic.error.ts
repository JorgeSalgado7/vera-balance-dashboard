export class ClinicNotFoundError extends Error {
  constructor() {
    super('Clinic not found.');
  }
}

export class MissingClinicIdError extends Error {
  constructor() {
    super('Clinic id is required.');
  }
}

export class MissingClinicNameError extends Error {
  constructor() {
    super('Clinic name is required.');
  }
}

export class MissingClinicAddressError extends Error {
  constructor() {
    super('Clinic address is required.');
  }
}

export class MissingClinicPhoneNumberError extends Error {
  constructor() {
    super('Clinic phone number is required.');
  }
}

export class MissingClinicTherapyTypesError extends Error {
  constructor() {
    super('Clinic therapy types are required.');
  }
}

export class MissingTherapyTypeNameError extends Error {
  constructor() {
    super('Therapy type name is required.');
  }
}

export class MissingTherapyTypeIconError extends Error {
  constructor() {
    super('Therapy type icon is required.');
  }
}

export class InvalidClinicStatusError extends Error {
  constructor() {
    super('Clinic status is invalid.');
  }
}

export class MissingClinicCreatedAtError extends Error {
  constructor() {
    super('Clinic createdAt is required.');
  }
}

export class MissingClinicUpdatedAtError extends Error {
  constructor() {
    super('Clinic updatedAt is required.');
  }
}
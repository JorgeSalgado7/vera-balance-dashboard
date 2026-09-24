import {
  MissingUserNameError,
  MissingUserEmailError,
  InvalidUserEmailError,
  MissingUserPasswordError,
  MissingUserProfessionalLicenseError,
  MissingUserClinicError,
  InvalidUserClinicError
} from '../errors/user.error';

export class ValidateUserDataDomainService {
  execute(data: {
    name: string;
    email: string;
    password: string;
    professionalLicense: string;
    clinicId: string;
  }): void {
    if (typeof data.name !== 'string' || !data.name.trim()) {
      throw new MissingUserNameError();
    }
    if (typeof data.email !== 'string' || !data.email.trim()) {
      throw new MissingUserEmailError();
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new InvalidUserEmailError();
    }
    if (typeof data.password !== 'string' || !data.password.trim()) {
      throw new MissingUserPasswordError();
    }
    if (typeof data.professionalLicense !== 'string' || !data.professionalLicense.trim()) {
      throw new MissingUserProfessionalLicenseError();
    }
    if (typeof data.clinicId !== 'string' || !data.clinicId.trim()) {
      throw new MissingUserClinicError();
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.clinicId)) {
      throw new InvalidUserClinicError();
    }
  }
}

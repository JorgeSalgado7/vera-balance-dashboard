import { ValidateClinicStatusDomainService } from '../../../domain/services/validate-clinic-status.domain-service';
import { InvalidClinicStatusError } from '../../../domain/errors/clinic.error';

describe('ValidateClinicStatusDomainService', () => {
  let service: ValidateClinicStatusDomainService;

  beforeEach(() => {
    service = new ValidateClinicStatusDomainService();
  });

  it('should accept active status', () => {
    expect(() =>
      service.execute('active')
    ).not.toThrow();
  });

  it('should accept inactive status', () => {
    expect(() =>
      service.execute('inactive')
    ).not.toThrow();
  });

  it('should throw InvalidClinicStatusError for invalid status', () => {
    expect(() =>
      service.execute('invalid' as never)
    ).toThrow(InvalidClinicStatusError);
  });
});
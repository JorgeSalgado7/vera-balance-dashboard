import { ValidateCreateUserDomainService } from '../../../domain/services/validate-create-user.domain-service'
import { UserEntity } from '../../../domain/entities/user.entity'

import {
  MissingUserNameError,
  MissingUserEmailError,
  InvalidUserEmailError,
  MissingUserPasswordError,
  MissingUserProfessionalLicenseError,
  InvalidUserRoleError,
  InvalidUserStatusError,
  InvalidUserClinicError,
} from '../../../domain/errors/user.error'

import { USER_ROLES, USER_ROLE_VALUES } from '../../../../../constants/user-roles.constant'

describe('ValidateCreateUserDomainService', () => {
  let service: ValidateCreateUserDomainService

  const clinicId = '11111111-1111-4111-8111-111111111111'

  const createValidEntity = (overrides: Partial<UserEntity> = {}): UserEntity => {
    const entity = new UserEntity()

    Object.assign(entity, {
      pk: '33333333-3333-4333-8333-333333333333',
      sk: 'USER',
      name: 'Mónica Vera',
      email: 'monica@example.com',
      password: 'hashed-password',
      professional_license: '12345678',
      role: USER_ROLES.THERAPIST,
      status: 'Activo',
      clinic: clinicId,
      gsi1pk: `CLINIC#${clinicId}`,
      gsi1sk: 'USER#33333333-3333-4333-8333-333333333333',
      gsi2pk: 'EMAIL#monica@example.com',
      gsi2sk: 'USER#33333333-3333-4333-8333-333333333333',
      created_at: '2026-10-27T10:00:00.000Z',
      updated_at: '2026-10-27T10:00:00.000Z',
      ...overrides,
    })

    return entity
  }

  beforeEach(() => {
    service = new ValidateCreateUserDomainService()
  })

  // =========================================
  // SUCCESS
  // =========================================

  describe('Valid users', () => {
    it('should validate a therapist with clinic', () => {
      const entity = createValidEntity()

      expect(() => service.execute(entity)).not.toThrow()
    })

    it('should validate a clinic user with clinic', () => {
      const entity = createValidEntity({
        role: USER_ROLES.CLINIC,
      })

      expect(() => service.execute(entity)).not.toThrow()
    })

    it('should validate an admin without clinic', () => {
      const entity = createValidEntity({
        role: USER_ROLES.ADMIN,
        clinic: null,
      })

      expect(() => service.execute(entity)).not.toThrow()
    })

    it('should validate an inactive user', () => {
      const entity = createValidEntity({
        status: 'Inactivo',
      })

      expect(() => service.execute(entity)).not.toThrow()
    })

    it('should return undefined when validation succeeds', () => {
      const entity = createValidEntity()

      const result = service.execute(entity)

      expect(result).toBeUndefined()
    })

    it('should accept every configured user role with valid clinic association', () => {
      for (const role of USER_ROLE_VALUES) {
        const entity = createValidEntity({
          role,
          clinic: role === USER_ROLES.ADMIN ? null : clinicId,
        })

        expect(() => service.execute(entity)).not.toThrow()
      }
    })
  })

  // =========================================
  // NAME
  // =========================================

  describe('Name validation', () => {
    it('should reject empty name', () => {
      const entity = createValidEntity({
        name: '',
      })

      expect(() => service.execute(entity)).toThrow(MissingUserNameError)
    })

    it('should reject whitespace-only name', () => {
      const entity = createValidEntity({
        name: '   ',
      })

      expect(() => service.execute(entity)).toThrow(MissingUserNameError)
    })

    it('should reject undefined name', () => {
      const entity = createValidEntity({
        name: undefined,
      })

      expect(() => service.execute(entity)).toThrow(MissingUserNameError)
    })

    it('should accept name with surrounding spaces', () => {
      const entity = createValidEntity({
        name: '  Mónica Vera  ',
      })

      expect(() => service.execute(entity)).not.toThrow()
    })
  })

  // =========================================
  // EMAIL
  // =========================================

  describe('Email validation', () => {
    it('should reject empty email', () => {
      const entity = createValidEntity({
        email: '',
      })

      expect(() => service.execute(entity)).toThrow(MissingUserEmailError)
    })

    it('should reject whitespace-only email', () => {
      const entity = createValidEntity({
        email: '   ',
      })

      expect(() => service.execute(entity)).toThrow(MissingUserEmailError)
    })

    it('should reject undefined email', () => {
      const entity = createValidEntity({
        email: undefined,
      })

      expect(() => service.execute(entity)).toThrow(MissingUserEmailError)
    })

    it.each(['invalid-email', 'monica@', '@example.com', 'monica@example', 'monica example@example.com', 'monica@@example.com', 'monica@example .com', 'monica@ example.com'])(
      'should reject invalid email: %s',
      (email) => {
        const entity = createValidEntity({ email })

        expect(() => service.execute(entity)).toThrow(InvalidUserEmailError)
      },
    )

    it.each(['monica@example.com', 'monica.vera@example.com', 'monica+test@example.com', 'monica@example.com.mx', 'MONICA@EXAMPLE.COM'])('should accept valid email: %s', (email) => {
      const entity = createValidEntity({ email })

      expect(() => service.execute(entity)).not.toThrow()
    })

    it('should reject email with leading whitespace', () => {
      const entity = createValidEntity({
        email: ' monica@example.com',
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserEmailError)
    })

    it('should reject email with trailing whitespace', () => {
      const entity = createValidEntity({
        email: 'monica@example.com ',
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserEmailError)
    })
  })

  // =========================================
  // PASSWORD
  // =========================================

  describe('Password validation', () => {
    it('should reject empty password', () => {
      const entity = createValidEntity({
        password: '',
      })

      expect(() => service.execute(entity)).toThrow(MissingUserPasswordError)
    })

    it('should reject whitespace-only password', () => {
      const entity = createValidEntity({
        password: '   ',
      })

      expect(() => service.execute(entity)).toThrow(MissingUserPasswordError)
    })

    it('should reject undefined password', () => {
      const entity = createValidEntity({
        password: undefined,
      })

      expect(() => service.execute(entity)).toThrow(MissingUserPasswordError)
    })

    it('should accept non-empty hashed password', () => {
      const entity = createValidEntity({
        password: '$2b$12$hashed-password-value',
      })

      expect(() => service.execute(entity)).not.toThrow()
    })
  })

  // =========================================
  // PROFESSIONAL LICENSE
  // =========================================

  describe('Professional license validation', () => {
    it('should reject empty professional license', () => {
      const entity = createValidEntity({
        professional_license: '',
      })

      expect(() => service.execute(entity)).toThrow(MissingUserProfessionalLicenseError)
    })

    it('should reject whitespace-only professional license', () => {
      const entity = createValidEntity({
        professional_license: '   ',
      })

      expect(() => service.execute(entity)).toThrow(MissingUserProfessionalLicenseError)
    })

    it('should reject undefined professional license', () => {
      const entity = createValidEntity({
        professional_license: undefined,
      })

      expect(() => service.execute(entity)).toThrow(MissingUserProfessionalLicenseError)
    })

    it('should accept non-empty professional license', () => {
      const entity = createValidEntity({
        professional_license: 'ABC123456',
      })

      expect(() => service.execute(entity)).not.toThrow()
    })
  })

  // =========================================
  // ROLE
  // =========================================

  describe('Role validation', () => {
    it('should reject unknown role', () => {
      const entity = createValidEntity({
        role: 'superadmin' as UserEntity['role'],
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserRoleError)
    })

    it('should reject empty role', () => {
      const entity = createValidEntity({
        role: '' as UserEntity['role'],
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserRoleError)
    })

    it('should reject undefined role', () => {
      const entity = createValidEntity({
        role: undefined,
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserRoleError)
    })

    it('should reject role with incorrect capitalization', () => {
      const entity = createValidEntity({
        role: 'Admin' as UserEntity['role'],
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserRoleError)
    })

    it('should reject role with surrounding spaces', () => {
      const entity = createValidEntity({
        role: ' therapist ' as UserEntity['role'],
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserRoleError)
    })
  })

  // =========================================
  // STATUS
  // =========================================

  describe('Status validation', () => {
    it('should reject unknown status', () => {
      const entity = createValidEntity({
        status: 'Pendiente' as UserEntity['status'],
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserStatusError)
    })

    it('should reject empty status', () => {
      const entity = createValidEntity({
        status: '' as UserEntity['status'],
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserStatusError)
    })

    it('should reject undefined status', () => {
      const entity = createValidEntity({
        status: undefined,
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserStatusError)
    })

    it('should reject lowercase status', () => {
      const entity = createValidEntity({
        status: 'activo' as UserEntity['status'],
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserStatusError)
    })
  })

  // =========================================
  // CLINIC
  // =========================================

  describe('Clinic validation', () => {
    it('should reject invalid clinic UUID', () => {
      const entity = createValidEntity({
        clinic: 'invalid-uuid',
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserClinicError)
    })

    it('should reject empty clinic ID', () => {
      const entity = createValidEntity({
        clinic: '',
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserClinicError)
    })

    it('should reject UUID without hyphens', () => {
      const entity = createValidEntity({
        clinic: '11111111111141118111111111111111',
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserClinicError)
    })

    it('should reject UUID with invalid version', () => {
      const entity = createValidEntity({
        clinic: '11111111-1111-0111-8111-111111111111',
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserClinicError)
    })

    it('should reject UUID with invalid variant', () => {
      const entity = createValidEntity({
        clinic: '11111111-1111-4111-1111-111111111111',
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserClinicError)
    })

    it('should reject clinic UUID with surrounding spaces', () => {
      const entity = createValidEntity({
        clinic: ` ${clinicId} `,
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserClinicError)
    })

    it('should accept valid clinic UUID', () => {
      const entity = createValidEntity({
        clinic: clinicId,
      })

      expect(() => service.execute(entity)).not.toThrow()
    })

    it('should accept uppercase UUID', () => {
      const entity = createValidEntity({
        clinic: 'AAAAAAAA-BBBB-4CCC-8DDD-EEEEEEEEEEEE',
      })

      expect(() => service.execute(entity)).not.toThrow()
    })

    it('should reject admin with assigned clinic', () => {
      const entity = createValidEntity({
        role: USER_ROLES.ADMIN,
        clinic: clinicId,
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserClinicError)
    })

    it('should reject therapist without clinic', () => {
      const entity = createValidEntity({
        role: USER_ROLES.THERAPIST,
        clinic: null,
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserClinicError)
    })

    it('should reject clinic user without clinic', () => {
      const entity = createValidEntity({
        role: USER_ROLES.CLINIC,
        clinic: null,
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserClinicError)
    })

    it('should accept admin with null clinic', () => {
      const entity = createValidEntity({
        role: USER_ROLES.ADMIN,
        clinic: null,
      })

      expect(() => service.execute(entity)).not.toThrow()
    })
  })

  // =========================================
  // VALIDATION ORDER
  // =========================================

  describe('Validation order', () => {
    it('should validate name before email', () => {
      const entity = createValidEntity({
        name: '',
        email: '',
      })

      expect(() => service.execute(entity)).toThrow(MissingUserNameError)
    })

    it('should validate email before password', () => {
      const entity = createValidEntity({
        email: '',
        password: '',
      })

      expect(() => service.execute(entity)).toThrow(MissingUserEmailError)
    })

    it('should validate email format before password', () => {
      const entity = createValidEntity({
        email: 'invalid-email',
        password: '',
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserEmailError)
    })

    it('should validate password before professional license', () => {
      const entity = createValidEntity({
        password: '',
        professional_license: '',
      })

      expect(() => service.execute(entity)).toThrow(MissingUserPasswordError)
    })

    it('should validate professional license before role', () => {
      const entity = createValidEntity({
        professional_license: '',
        role: 'invalid' as UserEntity['role'],
      })

      expect(() => service.execute(entity)).toThrow(MissingUserProfessionalLicenseError)
    })

    it('should validate role before status', () => {
      const entity = createValidEntity({
        role: 'invalid' as UserEntity['role'],
        status: 'invalid' as UserEntity['status'],
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserRoleError)
    })

    it('should validate status before clinic', () => {
      const entity = createValidEntity({
        status: 'invalid' as UserEntity['status'],
        clinic: 'invalid-uuid',
      })

      expect(() => service.execute(entity)).toThrow(InvalidUserStatusError)
    })
  })
})

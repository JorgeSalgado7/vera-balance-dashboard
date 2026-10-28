import { USER_ROLES, USER_ROLE_VALUES } from '../../../../../constants/user-roles.constant'

import { CreateUserDomainService } from '../../../domain/services/create-user.domain-service'
import { ValidateCreateUserDomainService } from '../../../domain/services/validate-create-user.domain-service'
import { UserEntity } from '../../../domain/entities/user.entity'

describe('CreateUserDomainService', () => {
  let service: CreateUserDomainService
  let validateCreate: jest.Mocked<ValidateCreateUserDomainService>

  const userId = '33333333-3333-4333-8333-333333333333'
  const clinicId = '11111111-1111-4111-8111-111111111111'

  const baseData: Parameters<CreateUserDomainService['create']>[0] = {
    id: userId,
    name: 'Mónica Vera',
    email: 'monica@example.com',
    password: 'hashed-password',
    professional_license: '12345678',
    role: USER_ROLES.THERAPIST,
    status: 'Activo',
    clinic: clinicId,
    created_at: '2026-10-27T10:00:00.000Z',
    updated_at: '2026-10-27T10:00:00.000Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()

    validateCreate = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ValidateCreateUserDomainService>

    service = new CreateUserDomainService(validateCreate)
  })

  // =========================================
  // ENTITY CREATION
  // =========================================

  describe('Entity creation', () => {
    it('should create a UserEntity instance', () => {
      const result = service.create(baseData)

      expect(result).toBeInstanceOf(UserEntity)
    })

    it('should assign primary key from user ID', () => {
      const result = service.create(baseData)

      expect(result.pk).toBe(userId)
    })

    it('should assign USER as sort key', () => {
      const result = service.create(baseData)

      expect(result.sk).toBe('USER')
    })

    it('should assign all user properties correctly', () => {
      const result = service.create(baseData)

      expect(result).toEqual(
        expect.objectContaining({
          pk: userId,
          sk: 'USER',
          name: 'Mónica Vera',
          email: 'monica@example.com',
          password: 'hashed-password',
          professional_license: '12345678',
          role: USER_ROLES.THERAPIST,
          status: 'Activo',
          clinic: clinicId,
          created_at: baseData.created_at,
          updated_at: baseData.updated_at,
        }),
      )
    })

    it('should create a new entity for every invocation', () => {
      const first = service.create(baseData)
      const second = service.create(baseData)

      expect(first).not.toBe(second)
      expect(first).toEqual(second)
    })
  })

  // =========================================
  // DATA NORMALIZATION
  // =========================================

  describe('Data normalization', () => {
    it('should trim user name', () => {
      const result = service.create({
        ...baseData,
        name: '  Mónica Vera  ',
      })

      expect(result.name).toBe('Mónica Vera')
    })

    it('should trim and lowercase email', () => {
      const result = service.create({
        ...baseData,
        email: '  MONICA@EXAMPLE.COM  ',
      })

      expect(result.email).toBe('monica@example.com')
    })

    it('should trim professional license', () => {
      const result = service.create({
        ...baseData,
        professional_license: '  12345678  ',
      })

      expect(result.professional_license).toBe('12345678')
    })

    it('should preserve hashed password without modification', () => {
      const result = service.create({
        ...baseData,
        password: '  hashed-password  ',
      })

      expect(result.password).toBe('  hashed-password  ')
    })

    it('should preserve user ID without modification', () => {
      const result = service.create(baseData)

      expect(result.pk).toBe(baseData.id)
    })

    it('should preserve creation and update timestamps', () => {
      const result = service.create(baseData)

      expect(result.created_at).toBe(baseData.created_at)
      expect(result.updated_at).toBe(baseData.updated_at)
    })
  })

  // =========================================
  // CLINIC INDEX - GSI1
  // =========================================

  describe('Clinic index (GSI1)', () => {
    it('should generate GSI1 when clinic is provided', () => {
      const result = service.create(baseData)

      expect(result.gsi1pk).toBe(`CLINIC#${clinicId}`)
      expect(result.gsi1sk).toBe(`USER#${userId}`)
    })

    it('should not generate GSI1 when clinic is null', () => {
      const result = service.create({
        ...baseData,
        role: USER_ROLES.ADMIN,
        clinic: null,
      })

      expect(result.gsi1pk).toBeUndefined()
      expect(result.gsi1sk).toBeUndefined()
    })

    it('should generate GSI1 using the provided clinic ID', () => {
      const otherClinicId = '22222222-2222-4222-8222-222222222222'

      const result = service.create({
        ...baseData,
        clinic: otherClinicId,
      })

      expect(result.gsi1pk).toBe(`CLINIC#${otherClinicId}`)
      expect(result.gsi1sk).toBe(`USER#${userId}`)
    })

    it('should generate GSI1 using the provided user ID', () => {
      const otherUserId = '44444444-4444-4444-8444-444444444444'

      const result = service.create({
        ...baseData,
        id: otherUserId,
      })

      expect(result.gsi1pk).toBe(`CLINIC#${clinicId}`)
      expect(result.gsi1sk).toBe(`USER#${otherUserId}`)
    })
  })

  // =========================================
  // EMAIL INDEX - GSI2
  // =========================================

  describe('Email index (GSI2)', () => {
    it('should generate GSI2 using normalized email', () => {
      const result = service.create({
        ...baseData,
        email: '  MONICA@EXAMPLE.COM  ',
      })

      expect(result.gsi2pk).toBe('EMAIL#monica@example.com')
      expect(result.gsi2sk).toBe(`USER#${userId}`)
    })

    it('should generate GSI2 when clinic is null', () => {
      const result = service.create({
        ...baseData,
        role: USER_ROLES.ADMIN,
        clinic: null,
      })

      expect(result.gsi2pk).toBe('EMAIL#monica@example.com')
      expect(result.gsi2sk).toBe(`USER#${userId}`)
    })

    it('should generate GSI2 using the provided user ID', () => {
      const otherUserId = '44444444-4444-4444-8444-444444444444'

      const result = service.create({
        ...baseData,
        id: otherUserId,
      })

      expect(result.gsi2pk).toBe('EMAIL#monica@example.com')
      expect(result.gsi2sk).toBe(`USER#${otherUserId}`)
    })

    it('should generate GSI2 independently of GSI1', () => {
      const result = service.create({
        ...baseData,
        role: USER_ROLES.ADMIN,
        clinic: null,
      })

      expect(result.gsi1pk).toBeUndefined()
      expect(result.gsi1sk).toBeUndefined()

      expect(result.gsi2pk).toBeDefined()
      expect(result.gsi2sk).toBeDefined()
    })
  })

  // =========================================
  // ROLES AND STATUS
  // =========================================

  describe('Roles and status', () => {
    it.each(USER_ROLE_VALUES)('should preserve role %s', (role) => {
      const result = service.create({
        ...baseData,
        role,
        clinic: role === USER_ROLES.ADMIN ? null : clinicId,
      })

      expect(result.role).toBe(role)
    })

    it.each(['Activo', 'Inactivo'] as const)('should preserve status %s', (status) => {
      const result = service.create({
        ...baseData,
        status,
      })

      expect(result.status).toBe(status)
    })
  })

  // =========================================
  // DOMAIN VALIDATION
  // =========================================

  describe('Domain validation', () => {
    it('should execute validation exactly once', () => {
      service.create(baseData)

      expect(validateCreate.execute).toHaveBeenCalledTimes(1)
    })

    it('should validate the created UserEntity', () => {
      const result = service.create(baseData)

      expect(validateCreate.execute).toHaveBeenCalledWith(result)
    })

    it('should validate normalized data', () => {
      service.create({
        ...baseData,
        name: '  Mónica Vera  ',
        email: '  MONICA@EXAMPLE.COM  ',
        professional_license: '  12345678  ',
      })

      expect(validateCreate.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Mónica Vera',
          email: 'monica@example.com',
          professional_license: '12345678',
        }),
      )
    })

    it('should validate generated indexes', () => {
      service.create(baseData)

      expect(validateCreate.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          gsi1pk: `CLINIC#${clinicId}`,
          gsi1sk: `USER#${userId}`,
          gsi2pk: 'EMAIL#monica@example.com',
          gsi2sk: `USER#${userId}`,
        }),
      )
    })

    it('should propagate validation errors', () => {
      validateCreate.execute.mockImplementation(() => {
        throw new Error('Domain validation failed')
      })

      expect(() => service.create(baseData)).toThrow('Domain validation failed')

      expect(validateCreate.execute).toHaveBeenCalledTimes(1)
    })

    it('should propagate the original error instance', () => {
      const validationError = new Error('Invalid user')

      validateCreate.execute.mockImplementation(() => {
        throw validationError
      })

      expect(() => service.create(baseData)).toThrow(validationError)
    })

    it('should return the same entity passed to validation', () => {
      const result = service.create(baseData)

      const validatedEntity = validateCreate.execute.mock.calls[0][0]

      expect(result).toBe(validatedEntity)
    })

    it('should not modify the original input object', () => {
      const data = {
        ...baseData,
        name: '  Mónica Vera  ',
        email: '  MONICA@EXAMPLE.COM  ',
      }

      service.create(data)

      expect(data.name).toBe('  Mónica Vera  ')
      expect(data.email).toBe('  MONICA@EXAMPLE.COM  ')
    })
  })
})

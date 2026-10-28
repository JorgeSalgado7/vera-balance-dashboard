import { USER_ROLES } from '../../../../../constants/user-roles.constant'

import { CreateUserUseCase, type CreateUserActor } from '../../../application/use-cases/create-user.use-case'

import { CreateUserDomainService } from '../../../domain/services/create-user.domain-service'

import type { CreateUserDto } from '../../../application/dtos/create-user.dto'
import type { IUserRepository } from '../../../domain/repositories/user.repository'
import type { IHashPasswordService } from '../../../../auth/domain/services/hash-password.service'

import { UserAlreadyExistsError, UserCreationNotAllowedError } from '../../../domain/errors/user.error'

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase

  let domain: jest.Mocked<Pick<CreateUserDomainService, 'create'>>

  let repository: jest.Mocked<IUserRepository>

  let hashPasswordService: jest.Mocked<IHashPasswordService>

  const clinicId = '11111111-1111-4111-8111-111111111111'
  const otherClinicId = '22222222-2222-4222-8222-222222222222'
  const userId = '33333333-3333-4333-8333-333333333333'

  const baseDto: CreateUserDto = {
    name: 'Mónica Vera',
    email: 'monica@example.com',
    password: 'Password123!',
    professional_license: '12345678',
    role: USER_ROLES.THERAPIST,
    clinic: clinicId,
  }

  const adminActor: CreateUserActor = {
    id: 'admin-123',
    role: USER_ROLES.ADMIN,
    clinic: null,
  }

  const clinicActor: CreateUserActor = {
    id: 'clinic-123',
    role: USER_ROLES.CLINIC,
    clinic: clinicId,
  }

  const therapistActor: CreateUserActor = {
    id: 'therapist-123',
    role: USER_ROLES.THERAPIST,
    clinic: clinicId,
  }

  const savedUser = {
    pk: userId,
    sk: 'USER' as const,
    name: 'Mónica Vera',
    email: 'monica@example.com',
    password: 'hashed-password',
    professional_license: '12345678',
    role: USER_ROLES.THERAPIST,
    status: 'Activo' as const,
    clinic: clinicId,
    gsi1pk: `CLINIC#${clinicId}`,
    gsi1sk: `USER#${userId}`,
    gsi2pk: 'EMAIL#monica@example.com',
    gsi2sk: `USER#${userId}`,
    created_at: '2026-10-27T10:00:00.000Z',
    updated_at: '2026-10-27T10:00:00.000Z',
  }

  const expectedResponse = {
    id: savedUser.pk,
    name: savedUser.name,
    email: savedUser.email,
    professional_license: savedUser.professional_license,
    role: savedUser.role,
    status: savedUser.status,
    clinic: savedUser.clinic,
    created_at: savedUser.created_at,
    updated_at: savedUser.updated_at,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    domain = {
      create: jest.fn(),
    }

    repository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    }

    hashPasswordService = {
      hash: jest.fn(),
    }

    useCase = new CreateUserUseCase(domain as unknown as CreateUserDomainService, repository, hashPasswordService)
  })

  const mockSuccessfulCreation = () => {
    repository.findByEmail.mockResolvedValue(null)

    hashPasswordService.hash.mockResolvedValue('hashed-password')

    domain.create.mockReturnValue(savedUser)

    repository.create.mockResolvedValue(savedUser)
  }

  // =========================================
  // AUTHORIZATION
  // =========================================

  describe('Authorization', () => {
    it('should reject therapist creating a user', async () => {
      await expect(useCase.execute(baseDto, therapistActor)).rejects.toThrow(UserCreationNotAllowedError)

      expect(repository.findByEmail).not.toHaveBeenCalled()
      expect(hashPasswordService.hash).not.toHaveBeenCalled()
      expect(domain.create).not.toHaveBeenCalled()
      expect(repository.create).not.toHaveBeenCalled()
    })

    it('should reject clinic creating an admin', async () => {
      await expect(
        useCase.execute(
          {
            ...baseDto,
            role: USER_ROLES.ADMIN,
            clinic: null,
          },
          clinicActor,
        ),
      ).rejects.toThrow(UserCreationNotAllowedError)

      expect(repository.findByEmail).not.toHaveBeenCalled()
      expect(repository.create).not.toHaveBeenCalled()
    })

    it('should reject clinic creating another clinic user', async () => {
      await expect(
        useCase.execute(
          {
            ...baseDto,
            role: USER_ROLES.CLINIC,
          },
          clinicActor,
        ),
      ).rejects.toThrow(UserCreationNotAllowedError)

      expect(repository.findByEmail).not.toHaveBeenCalled()
      expect(repository.create).not.toHaveBeenCalled()
    })

    it('should reject clinic creating therapist in another clinic', async () => {
      await expect(
        useCase.execute(
          {
            ...baseDto,
            clinic: otherClinicId,
          },
          clinicActor,
        ),
      ).rejects.toThrow(UserCreationNotAllowedError)

      expect(repository.findByEmail).not.toHaveBeenCalled()
      expect(repository.create).not.toHaveBeenCalled()
    })

    it('should reject clinic without assigned clinic', async () => {
      await expect(
        useCase.execute(baseDto, {
          ...clinicActor,
          clinic: null,
        }),
      ).rejects.toThrow(UserCreationNotAllowedError)

      expect(repository.findByEmail).not.toHaveBeenCalled()
      expect(repository.create).not.toHaveBeenCalled()
    })

    it('should allow admin creating a therapist', async () => {
      mockSuccessfulCreation()

      const result = await useCase.execute(baseDto, adminActor)

      expect(result.role).toBe(USER_ROLES.THERAPIST)
      expect(repository.create).toHaveBeenCalledTimes(1)
    })

    it('should allow admin creating another admin', async () => {
      mockSuccessfulCreation()

      const dto: CreateUserDto = {
        ...baseDto,
        role: USER_ROLES.ADMIN,
        clinic: null,
      }

      const result = await useCase.execute(dto, adminActor)

      expect(result.id).toBe(savedUser.pk)

      expect(domain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: USER_ROLES.ADMIN,
          clinic: null,
        }),
      )
    })

    it('should allow admin creating a clinic user', async () => {
      mockSuccessfulCreation()

      const dto: CreateUserDto = {
        ...baseDto,
        role: USER_ROLES.CLINIC,
      }

      await useCase.execute(dto, adminActor)

      expect(domain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: USER_ROLES.CLINIC,
          clinic: clinicId,
        }),
      )

      expect(repository.create).toHaveBeenCalledTimes(1)
    })

    it('should allow clinic creating therapist in its own clinic', async () => {
      mockSuccessfulCreation()

      const result = await useCase.execute(baseDto, clinicActor)

      expect(result.clinic).toBe(clinicId)
      expect(result.role).toBe(USER_ROLES.THERAPIST)

      expect(repository.create).toHaveBeenCalledTimes(1)
    })
  })

  // =========================================
  // DUPLICATE EMAIL
  // =========================================

  describe('Duplicate email', () => {
    it('should throw UserAlreadyExistsError when email exists', async () => {
      repository.findByEmail.mockResolvedValue(savedUser)

      await expect(useCase.execute(baseDto, adminActor)).rejects.toThrow(UserAlreadyExistsError)

      expect(hashPasswordService.hash).not.toHaveBeenCalled()
      expect(domain.create).not.toHaveBeenCalled()
      expect(repository.create).not.toHaveBeenCalled()
    })

    it('should normalize email before checking duplicates', async () => {
      repository.findByEmail.mockResolvedValue(savedUser)

      await expect(
        useCase.execute(
          {
            ...baseDto,
            email: '  MONICA@EXAMPLE.COM  ',
          },
          adminActor,
        ),
      ).rejects.toThrow(UserAlreadyExistsError)

      expect(repository.findByEmail).toHaveBeenCalledWith('monica@example.com')

      expect(repository.create).not.toHaveBeenCalled()
    })

    it('should check email before hashing password', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto, adminActor)

      const findOrder = repository.findByEmail.mock.invocationCallOrder[0]

      const hashOrder = hashPasswordService.hash.mock.invocationCallOrder[0]

      expect(findOrder).toBeLessThan(hashOrder)
    })
  })

  // =========================================
  // PASSWORD
  // =========================================

  describe('Password', () => {
    it('should hash the original password', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto, adminActor)

      expect(hashPasswordService.hash).toHaveBeenCalledWith('Password123!')

      expect(hashPasswordService.hash).toHaveBeenCalledTimes(1)
    })

    it('should pass hashed password to domain', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto, adminActor)

      expect(domain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashed-password',
        }),
      )
    })

    it('should never pass plain password to domain', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto, adminActor)

      expect(domain.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          password: baseDto.password,
        }),
      )
    })

    it('should not create user when hashing fails', async () => {
      repository.findByEmail.mockResolvedValue(null)

      hashPasswordService.hash.mockRejectedValue(new Error('Hashing failed'))

      await expect(useCase.execute(baseDto, adminActor)).rejects.toThrow('Hashing failed')

      expect(domain.create).not.toHaveBeenCalled()
      expect(repository.create).not.toHaveBeenCalled()
    })
  })

  // =========================================
  // DATA NORMALIZATION
  // =========================================

  describe('Data normalization', () => {
    it('should trim user name', async () => {
      mockSuccessfulCreation()

      await useCase.execute(
        {
          ...baseDto,
          name: '  Mónica Vera  ',
        },
        adminActor,
      )

      expect(domain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Mónica Vera',
        }),
      )
    })

    it('should trim professional license', async () => {
      mockSuccessfulCreation()

      await useCase.execute(
        {
          ...baseDto,
          professional_license: '  12345678  ',
        },
        adminActor,
      )

      expect(domain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          professional_license: '12345678',
        }),
      )
    })

    it('should lowercase and trim email before domain creation', async () => {
      mockSuccessfulCreation()

      await useCase.execute(
        {
          ...baseDto,
          email: '  MONICA@EXAMPLE.COM  ',
        },
        adminActor,
      )

      expect(domain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'monica@example.com',
        }),
      )
    })

    it('should preserve clinic association', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto, adminActor)

      expect(domain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clinic: clinicId,
        }),
      )
    })
  })

  // =========================================
  // DOMAIN
  // =========================================

  describe('Domain integration', () => {
    it('should pass required data to domain service', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto, adminActor)

      expect(domain.create).toHaveBeenCalledWith({
        id: expect.any(String),
        name: 'Mónica Vera',
        email: 'monica@example.com',
        password: 'hashed-password',
        professional_license: '12345678',
        role: USER_ROLES.THERAPIST,
        status: 'Activo',
        clinic: clinicId,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    })

    it('should propagate domain validation errors', async () => {
      repository.findByEmail.mockResolvedValue(null)
      hashPasswordService.hash.mockResolvedValue('hashed-password')

      domain.create.mockImplementation(() => {
        throw new Error('Domain validation failed')
      })

      await expect(useCase.execute(baseDto, adminActor)).rejects.toThrow('Domain validation failed')

      expect(repository.create).not.toHaveBeenCalled()
    })

    it('should persist the entity returned by domain', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto, adminActor)

      expect(repository.create).toHaveBeenCalledWith(savedUser)
    })

    it('should create domain entity only once', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto, adminActor)

      expect(domain.create).toHaveBeenCalledTimes(1)
    })
  })

  // =========================================
  // REPOSITORY ERRORS
  // =========================================

  describe('Repository errors', () => {
    it('should propagate error when finding email fails', async () => {
      repository.findByEmail.mockRejectedValue(new Error('DynamoDB query failed'))

      await expect(useCase.execute(baseDto, adminActor)).rejects.toThrow('DynamoDB query failed')

      expect(hashPasswordService.hash).not.toHaveBeenCalled()
      expect(domain.create).not.toHaveBeenCalled()
      expect(repository.create).not.toHaveBeenCalled()
    })

    it('should propagate error when creating user fails', async () => {
      repository.findByEmail.mockResolvedValue(null)
      hashPasswordService.hash.mockResolvedValue('hashed-password')

      domain.create.mockReturnValue(savedUser)

      repository.create.mockRejectedValue(new Error('DynamoDB write failed'))

      await expect(useCase.execute(baseDto, adminActor)).rejects.toThrow('DynamoDB write failed')

      expect(repository.create).toHaveBeenCalledTimes(1)
    })
  })

  // =========================================
  // SUCCESS
  // =========================================

  describe('Successful creation', () => {
    it('should return expected response DTO', async () => {
      mockSuccessfulCreation()

      const result = await useCase.execute(baseDto, adminActor)

      expect(result).toEqual(expectedResponse)
    })

    it('should not expose password in response', async () => {
      mockSuccessfulCreation()

      const result = await useCase.execute(baseDto, adminActor)

      expect(result).not.toHaveProperty('password')
    })

    it('should not expose DynamoDB keys or indexes', async () => {
      mockSuccessfulCreation()

      const result = await useCase.execute(baseDto, adminActor)

      expect(result).not.toHaveProperty('pk')
      expect(result).not.toHaveProperty('sk')
      expect(result).not.toHaveProperty('gsi1pk')
      expect(result).not.toHaveProperty('gsi1sk')
      expect(result).not.toHaveProperty('gsi2pk')
      expect(result).not.toHaveProperty('gsi2sk')
    })

    it('should generate a valid UUID', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto, adminActor)

      expect(domain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
        }),
      )
    })

    it('should generate matching creation and update timestamps', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto, adminActor)

      const data = domain.create.mock.calls[0][0]

      expect(data.created_at).toBe(data.updated_at)

      expect(Number.isNaN(Date.parse(data.created_at))).toBe(false)
    })

    it('should set initial status to Activo', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto, adminActor)

      expect(domain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Activo',
        }),
      )
    })

    it('should return saved user ID instead of actor ID', async () => {
      mockSuccessfulCreation()

      const result = await useCase.execute(baseDto, adminActor)

      expect(result.id).toBe(savedUser.pk)
      expect(result.id).not.toBe(adminActor.id)
    })

    it('should return data from persisted entity', async () => {
      mockSuccessfulCreation()

      const persistedUser = {
        ...savedUser,
        name: 'Nombre actualizado en persistencia',
      }

      repository.create.mockResolvedValue(persistedUser)

      const result = await useCase.execute(baseDto, adminActor)

      expect(result.name).toBe('Nombre actualizado en persistencia')
    })
  })
})

import { SendWelcomeEmailUseCase } from '../../../../emails/application/use-cases/send-welcome-email.use-case'
import { WelcomeEmailTemplate } from '../../../../emails/infrastructure/templates/welcome-email.template'
import { EmailLayoutTemplate } from '../../../../emails/infrastructure/templates/email-layout.template'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case'

import { CreateUserDomainService } from '../../../domain/services/create-user.domain-service'

import type { CreateUserDto } from '../../../application/dtos/create-user.dto'
import type { IUserRepository } from '../../../domain/repositories/user.repository'
import type { IHashPasswordService } from '../../../../auth/domain/services/hash-password.service'

import { UserAlreadyExistsError, UserCreationNotAllowedError } from '../../../domain/errors/user.error'

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase
  const send = jest.fn()
  const reportFailure = jest.fn()

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
    gsi1pk: 'USER',
    gsi1sk: `USER#${userId}`,
    gsi2pk: `CLINIC#${clinicId}`,
    gsi2sk: `USER#${userId}`,
    gsi3pk: 'EMAIL#monica@example.com',
    gsi3sk: `USER#${userId}`,
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
    send.mockReset().mockResolvedValue(undefined)
    reportFailure.mockReset()

    domain = {
      create: jest.fn(),
    }

    repository = {
      findByClinic: jest.fn(),
    findByIds: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      changePassword: jest.fn(),
      delete: jest.fn(),
      hasTherapeuticProcesses: jest.fn(),
      reset: jest.fn(),
      set: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    }

    hashPasswordService = {
      hash: jest.fn(),
    }

    useCase = new CreateUserUseCase(domain as unknown as CreateUserDomainService, repository, hashPasswordService,
      new SendWelcomeEmailUseCase(new WelcomeEmailTemplate(new EmailLayoutTemplate()), { send }, reportFailure))
  })

  const mockSuccessfulCreation = () => {
    repository.findByEmail.mockResolvedValue(null)

    hashPasswordService.hash.mockResolvedValue('hashed-password')

    domain.create.mockReturnValue(savedUser)

    repository.create.mockResolvedValue(savedUser)
  }

  it('sends the HTML welcome email only after the user is saved', async () => {
    mockSuccessfulCreation()
    await useCase.execute(baseDto)
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: savedUser.email, subject: 'Bienvenida a Vera Balance', html: expect.stringContaining('Mónica Vera') }))
    expect(send.mock.calls[0][0].html).not.toContain(baseDto.password)
    expect(repository.create.mock.invocationCallOrder[0]).toBeLessThan(send.mock.invocationCallOrder[0])
  })

  it('does not send a welcome email if persistence fails', async () => {
    mockSuccessfulCreation()
    repository.create.mockRejectedValue(new Error('DynamoDB unavailable'))
    await expect(useCase.execute(baseDto)).rejects.toThrow('DynamoDB unavailable')
    expect(send).not.toHaveBeenCalled()
  })

  it('preserves user creation success when welcome delivery fails', async () => {
    mockSuccessfulCreation()
    send.mockRejectedValue(new Error('Resend unavailable'))
    await expect(useCase.execute(baseDto)).resolves.toEqual(expectedResponse)
    expect(reportFailure).toHaveBeenCalledWith()
  })

  // =========================================
  // AUTHORIZATION
  // =========================================

  it('normalizes an omitted clinic to null before creating the entity', async () => {
    mockSuccessfulCreation()
    const { clinic, ...input } = baseDto
    await useCase.execute(input)
    expect(domain.create).toHaveBeenCalledWith(expect.objectContaining({ clinic: null }))
  })

  it('creates a user without an authenticated actor', async () => {
    mockSuccessfulCreation()
    await expect(useCase.execute(baseDto)).resolves.toMatchObject({ id: savedUser.pk })
    expect(repository.create).toHaveBeenCalled()
  })

  // =========================================
  // DUPLICATE EMAIL
  // =========================================

  describe('Duplicate email', () => {
    it('should throw UserAlreadyExistsError when email exists', async () => {
      repository.findByEmail.mockResolvedValue(savedUser)

      await expect(useCase.execute(baseDto)).rejects.toThrow(UserAlreadyExistsError)

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
          }),
      ).rejects.toThrow(UserAlreadyExistsError)

      expect(repository.findByEmail).toHaveBeenCalledWith('monica@example.com')

      expect(repository.create).not.toHaveBeenCalled()
    })

    it('should check email before hashing password', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto)

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

      await useCase.execute(baseDto)

      expect(hashPasswordService.hash).toHaveBeenCalledWith('Password123!')

      expect(hashPasswordService.hash).toHaveBeenCalledTimes(1)
    })

    it('should pass hashed password to domain', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto)

      expect(domain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashed-password',
        }),
      )
    })

    it('should never pass plain password to domain', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto)

      expect(domain.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          password: baseDto.password,
        }),
      )
    })

    it('should not create user when hashing fails', async () => {
      repository.findByEmail.mockResolvedValue(null)

      hashPasswordService.hash.mockRejectedValue(new Error('Hashing failed'))

      await expect(useCase.execute(baseDto)).rejects.toThrow('Hashing failed')

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
        })

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
        })

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
        })

      expect(domain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'monica@example.com',
        }),
      )
    })

    it('should preserve clinic association', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto)

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

      await useCase.execute(baseDto)

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

      await expect(useCase.execute(baseDto)).rejects.toThrow('Domain validation failed')

      expect(repository.create).not.toHaveBeenCalled()
    })

    it('should persist the entity returned by domain', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto)

      expect(repository.create).toHaveBeenCalledWith(savedUser)
    })

    it('should create domain entity only once', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto)

      expect(domain.create).toHaveBeenCalledTimes(1)
    })
  })

  // =========================================
  // REPOSITORY ERRORS
  // =========================================

  describe('Repository errors', () => {
    it('should propagate error when finding email fails', async () => {
      repository.findByEmail.mockRejectedValue(new Error('DynamoDB query failed'))

      await expect(useCase.execute(baseDto)).rejects.toThrow('DynamoDB query failed')

      expect(hashPasswordService.hash).not.toHaveBeenCalled()
      expect(domain.create).not.toHaveBeenCalled()
      expect(repository.create).not.toHaveBeenCalled()
    })

    it('should propagate error when creating user fails', async () => {
      repository.findByEmail.mockResolvedValue(null)
      hashPasswordService.hash.mockResolvedValue('hashed-password')

      domain.create.mockReturnValue(savedUser)

      repository.create.mockRejectedValue(new Error('DynamoDB write failed'))

      await expect(useCase.execute(baseDto)).rejects.toThrow('DynamoDB write failed')

      expect(repository.create).toHaveBeenCalledTimes(1)
    })
  })

  // =========================================
  // SUCCESS
  // =========================================

  describe('Successful creation', () => {
    it('should return expected response DTO', async () => {
      mockSuccessfulCreation()

      const result = await useCase.execute(baseDto)

      expect(result).toEqual(expectedResponse)
    })

    it('should not expose password in response', async () => {
      mockSuccessfulCreation()

      const result = await useCase.execute(baseDto)

      expect(result).not.toHaveProperty('password')
    })

    it('should not expose DynamoDB keys or indexes', async () => {
      mockSuccessfulCreation()

      const result = await useCase.execute(baseDto)

      expect(result).not.toHaveProperty('pk')
      expect(result).not.toHaveProperty('sk')
      expect(result).not.toHaveProperty('gsi2pk')
      expect(result).not.toHaveProperty('gsi2sk')
      expect(result).not.toHaveProperty('gsi3pk')
      expect(result).not.toHaveProperty('gsi3sk')
    })

    it('should generate a valid UUID', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto)

      expect(domain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
        }),
      )
    })

    it('should generate matching creation and update timestamps', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto)

      const data = domain.create.mock.calls[0][0]

      expect(data.created_at).toBe(data.updated_at)

      expect(Number.isNaN(Date.parse(data.created_at))).toBe(false)
    })

    it('should set initial status to Activo', async () => {
      mockSuccessfulCreation()

      await useCase.execute(baseDto)

      expect(domain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Activo',
        }),
      )
    })

    it('should return the saved user ID', async () => {
      mockSuccessfulCreation()

      const result = await useCase.execute(baseDto)

      expect(result.id).toBe(savedUser.pk)
    })

    it('should return data from persisted entity', async () => {
      mockSuccessfulCreation()

      const persistedUser = {
        ...savedUser,
        name: 'Nombre actualizado en persistencia',
      }

      repository.create.mockResolvedValue(persistedUser)

      const result = await useCase.execute(baseDto)

      expect(result.name).toBe('Nombre actualizado en persistencia')
    })
  })
})

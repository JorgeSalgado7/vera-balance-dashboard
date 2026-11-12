import { Test, type TestingModule } from '@nestjs/testing'
import { PasswordHasher } from '@nestjs/authentication'
import { ConfigService } from '@nestjs/config'
import { SwaggerModule } from '@nestjs/swagger'
import { AuthModule } from '../auth.module'
import { ForgotPasswordUseCase } from '../application/use-cases/forgot-password.use-case'
import { LoginUseCase } from '../application/use-cases/login.use-case'
import { ResetPasswordController } from '../presentation/http/controllers/reset-password.controller'
import { FindUserByEmailDynamooseAdapter } from '../../users/infrastructure/persistance/adapters/find-user-by-email-dynamoose.adapter'
import { SetUserPasswordRecoveryDynamooseAdapter } from '../../users/infrastructure/persistance/adapters/set-user-password-recovery-dynamoose.adapter'
import { ResetUserPasswordDynamooseAdapter } from '../../users/infrastructure/persistance/adapters/reset-user-password-dynamoose.adapter'
import { SendEmailResendService } from '../../emails/infrastructure/services/send-email-resend.service'
import { GenerateRecoveryCodeCryptoService } from '../infrastructure/services/generate-recovery-code-crypto.service'
import { UserEntity } from '../../users/domain/entities/user.entity'
import { openApiHeader } from '../../../docs/openapi.header'

jest.mock('../../users/infrastructure/persistance/models/user.model', () => ({ UserModel: {} }))

describe('Password reset composition', () => {
  const hasher = new PasswordHasher()
  const send = jest.fn()
  const reset = jest.fn()
  let record: UserEntity
  let module: TestingModule

  beforeEach(async () => {
    jest.resetAllMocks()
    let sequence = 0
    record = Object.assign(new UserEntity(), {
      pk: 'user-id', sk: 'USER', name: 'User', email: 'user@example.com',
      password: await hasher.hash('original password'), professional_license: '123',
      role: 'therapist', status: 'Activo', clinic: null,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    })
    // Simulate DynamoDB's atomic compare-and-set; production condition construction has its own real-request tests.
    reset.mockImplementation(async (input, updatedAt) => {
      if (record.password !== input.currentPasswordHash || record.password_recovery_code_hash !== input.codeHash ||
        record.password_recovery_expires_at !== input.expiresAt || input.expiresAt <= updatedAt) return false
      record.password = input.passwordHash
      record.updated_at = updatedAt
      delete record.password_recovery_code_hash
      delete record.password_recovery_expires_at
      return true
    })
    module = await Test.createTestingModule({ imports: [AuthModule] })
      .overrideProvider(ConfigService).useValue(new ConfigService({ JWT_ACCESS_SECRET: 'test-access-secret', JWT_REFRESH_SECRET: 'test-refresh-secret' }))
      .overrideProvider(FindUserByEmailDynamooseAdapter).useValue({ findByEmail: jest.fn(async () => ({ ...record })) })
      .overrideProvider(SetUserPasswordRecoveryDynamooseAdapter).useValue({ set: jest.fn(async (input, updatedAt) => {
        record.password_recovery_code_hash = input.codeHash
        record.password_recovery_expires_at = input.expiresAt
        record.updated_at = updatedAt
        return true
      }) })
      .overrideProvider(ResetUserPasswordDynamooseAdapter).useValue({ reset })
      .overrideProvider(SendEmailResendService).useValue({ send })
      .overrideProvider(GenerateRecoveryCodeCryptoService).useValue({ generate: () => String(++sequence).padStart(6, '0') })
      .compile()
  })
  afterEach(async () => { await module.close() })

  async function requestCode() {
    module.get(ForgotPasswordUseCase).execute({ email: 'user@example.com' })
    await module.get(ForgotPasswordUseCase).waitForPendingRequests()
    return send.mock.calls[send.mock.calls.length - 1][0].text.match(/\d{6}/)![0] as string
  }

  it('supports forgot/reset/login, rejects replaced and reused codes and exposes only the success message', async () => {
    const firstCode = await requestCode()
    const currentCode = await requestCode()
    const controller = module.get(ResetPasswordController)
    const input = { email: 'user@example.com', code: currentCode, password: 'new password', password_confirmation: 'new password' }
    await expect(controller.execute({ ...input, code: firstCode })).rejects.toMatchObject({ response: expect.objectContaining({ status: 400 }) })
    expect(reset).not.toHaveBeenCalled()
    await expect(controller.execute(input)).resolves.toEqual({ message: 'Contraseña restablecida' })
    expect(record.password).not.toBe('new password')
    expect(await hasher.verify('new password', record.password)).toBe(true)
    expect(record).not.toHaveProperty('password_recovery_code_hash')
    expect(record).not.toHaveProperty('password_recovery_expires_at')
    await expect(controller.execute(input)).rejects.toMatchObject({ response: expect.objectContaining({ status: 400 }) })
    expect(reset).toHaveBeenCalledTimes(1)
    const notifications = send.mock.calls.map(([message]) => message).filter(message => message.subject === 'Contraseña actualizada en Vera Balance')
    expect(notifications).toEqual([expect.objectContaining({ to: record.email, subject: 'Contraseña actualizada en Vera Balance', text: 'Tu contraseña de Vera Balance se actualizó correctamente.' })])
    expect(notifications[0].text).not.toContain(input.password)
    await expect(module.get(LoginUseCase).execute({ email: input.email, password: 'original password' })).rejects.toThrow()
    await expect(module.get(LoginUseCase).execute({ email: input.email, password: 'new password' })).resolves.toHaveProperty('access_token')
  }, 15000)

  it('allows only one of two concurrent resets using the same code', async () => {
    const code = await requestCode()
    const input = { email: 'user@example.com', code, password: 'new password', password_confirmation: 'new password' }
    const controller = module.get(ResetPasswordController)
    const results = await Promise.allSettled([controller.execute(input), controller.execute(input)])
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1)
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(1)
    const rejected = results.find(result => result.status === 'rejected') as PromiseRejectedResult
    expect(rejected.reason).toMatchObject({ response: expect.objectContaining({ status: 400 }) })
    expect(record).not.toHaveProperty('password_recovery_code_hash')
    expect(send.mock.calls.filter(([message]) => message.subject === 'Contraseña actualizada en Vera Balance')).toHaveLength(1)
  }, 15000)

  it('documents the public endpoint and the exact request/response fields', async () => {
    const app = module.createNestApplication()
    try {
      const document = SwaggerModule.createDocument(app, openApiHeader)
      const operation = document.paths['/auth/forgot-password/reset']!.post!
      expect(operation.operationId).toBe('resetPassword')
      expect(operation.security ?? []).toEqual([])
      expect(Object.keys(operation.responses).sort()).toEqual(['200', '400', '429', '500'])
      expect(document.components!.schemas!.ResetPasswordDto).toMatchObject({
        required: ['email', 'code', 'password', 'password_confirmation'],
        properties: { code: { type: 'string', pattern: '^[0-9]{6}$', minLength: 6, maxLength: 6 } },
      })
      expect(document.components!.schemas!.ResetPasswordResponseDto).toMatchObject({ required: ['message'] })
      expect(document.components!.schemas!.ResetPasswordResponseDto).not.toHaveProperty('properties.password')
    } finally { await app.close() }
  })
})

import { Test } from '@nestjs/testing'
import { PasswordHasher } from '@nestjs/authentication'
import { SwaggerModule } from '@nestjs/swagger'
import { AuthModule } from '../auth.module'
import { ForgotPasswordUseCase } from '../application/use-cases/forgot-password.use-case'
import { ForgotPasswordController } from '../presentation/http/controllers/forgot-password.controller'
import { FindUserByEmailDynamooseAdapter } from '../../users/infrastructure/persistance/adapters/find-user-by-email-dynamoose.adapter'
import { SetUserPasswordRecoveryDynamooseAdapter } from '../../users/infrastructure/persistance/adapters/set-user-password-recovery-dynamoose.adapter'
import { SendEmailResendService } from '../../emails/infrastructure/services/send-email-resend.service'
import { openApiHeader } from '../../../docs/openapi.header'

jest.mock('../../users/infrastructure/persistance/models/user.model', () => ({ UserModel: {} }))

describe('Forgot-password composition', () => {
  it('uses Users capabilities, securely hashes the code and sends no credentials in the public response', async () => {
    const findByEmail = jest.fn().mockResolvedValue({ pk: 'user-id', email: 'user@example.com', password: 'current-hash', clinic: null })
    const set = jest.fn().mockResolvedValue(true)
    const send = jest.fn()
    const module = await Test.createTestingModule({ imports: [AuthModule] })
      .overrideProvider(FindUserByEmailDynamooseAdapter).useValue({ findByEmail })
      .overrideProvider(SetUserPasswordRecoveryDynamooseAdapter).useValue({ set })
      .overrideProvider(SendEmailResendService).useValue({ send }).compile()
    const app = module.createNestApplication()
    try {
      const response = module.get(ForgotPasswordController).execute({ email: 'USER@EXAMPLE.COM' })
      expect(Object.keys(response)).toEqual(['message'])
      await module.get(ForgotPasswordUseCase).waitForPendingRequests()
      expect(findByEmail).toHaveBeenCalledWith('user@example.com')
      const { to: recipient, text } = send.mock.calls[0][0]
      const code = text.match(/\d{6}/)![0]
      const input = set.mock.calls[0][0]
      expect(recipient).toBe('user@example.com')
      expect(code).toMatch(/^\d{6}$/)
      expect(input.codeHash).not.toBe(code)
      expect(await module.get(PasswordHasher).verify(code, input.codeHash)).toBe(true)
      expect(Date.parse(input.expiresAt)).toBeGreaterThan(Date.now())
      const document = SwaggerModule.createDocument(app, openApiHeader)
      const operation = document.paths['/auth/forgot-password']!.post!
      expect(operation.operationId).toBe('forgotPassword')
      expect(operation.security ?? []).toEqual([])
      expect(Object.keys(operation.responses).sort()).toEqual(['200', '400', '500'])
      expect(document.components!.schemas!.ForgotPasswordResponseDto).toMatchObject({ required: ['message'] })
      expect(document.components!.schemas!.ForgotPasswordResponseDto).not.toHaveProperty('properties.code')
    } finally { await app.close() }
  }, 15000)
})

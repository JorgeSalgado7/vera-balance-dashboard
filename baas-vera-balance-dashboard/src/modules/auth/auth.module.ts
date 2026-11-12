import { LoggerModule } from '../../shared/logger/logger.module'
import { AppLogger } from '../../shared/logger/app-logger.service'
import { EmailsModule } from '../emails/emails.module'
import { SendRecoveryCodeEmailUseCase } from '../emails/application/use-cases/send-recovery-code-email.use-case'
import { SendPasswordUpdatedEmailUseCase } from '../emails/application/use-cases/send-password-updated-email.use-case'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { UsersModule } from '../users/users.module'
import { PasswordModule } from './password.module'
import type { IVerifyPasswordService } from './domain/services/verify-password.service'
import { LoginUseCase } from './application/use-cases/login.use-case'
import { FindUserByEmailUseCase } from '../users/application/use-cases/find-user-by-email.use-case'
import type { IIssueLoginTokensService } from './domain/services/issue-login-tokens.service'
import { ValidateLoginDomainService } from './domain/services/validate-login.domain-service'
import { IssueLoginTokensJwtService } from './infrastructure/services/issue-login-tokens-jwt.service'
import { LoginController } from './presentation/http/controllers/login.controller'

import { RefreshUseCase } from './application/use-cases/refresh.use-case'
import type { IVerifyRefreshTokenService } from './domain/services/verify-refresh-token.service'
import { VerifyRefreshTokenJwtService } from './infrastructure/services/verify-refresh-token-jwt.service'
import { RefreshController } from './presentation/http/controllers/refresh.controller'

import { LogoutUseCase } from './application/use-cases/logout.use-case'
import type { IVerifyAccessTokenService } from './domain/services/verify-access-token.service'
import { VerifyAccessTokenJwtService } from './infrastructure/services/verify-access-token-jwt.service'
import { LogoutController } from './presentation/http/controllers/logout.controller'

import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case'
import { SetUserPasswordRecoveryUseCase } from '../users/application/use-cases/set-user-password-recovery.use-case'
import type { IHashPasswordService } from './domain/services/hash-password.service'
import type { IGenerateRecoveryCodeService } from './domain/services/generate-recovery-code.service'
import { CreatePasswordRecoveryDomainService } from './domain/services/create-password-recovery.domain-service'
import { GenerateRecoveryCodeCryptoService } from './infrastructure/services/generate-recovery-code-crypto.service'
import { PasswordRecoveryShutdownService } from './infrastructure/services/password-recovery-shutdown.service'
import { ForgotPasswordController } from './presentation/http/controllers/forgot-password.controller'

import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case'
import { ResetUserPasswordUseCase } from '../users/application/use-cases/reset-user-password.use-case'
import { ValidatePasswordRecoveryDomainService } from './domain/services/validate-password-recovery.domain-service'
import { ResetPasswordController } from './presentation/http/controllers/reset-password.controller'

@Module({
  imports: [LoggerModule, ConfigModule, JwtModule.register({}), PasswordModule, UsersModule, EmailsModule],
  controllers: [LoginController, RefreshController, LogoutController, ForgotPasswordController, ResetPasswordController],
  providers: [
    ValidatePasswordRecoveryDomainService,
    {
      provide: ResetPasswordUseCase,
      useFactory: (users: FindUserByEmailUseCase, verifier: IVerifyPasswordService,
        domain: ValidatePasswordRecoveryDomainService, reset: ResetUserPasswordUseCase, notification: SendPasswordUpdatedEmailUseCase) =>
        new ResetPasswordUseCase(users, verifier, domain, reset, notification),
      inject: [FindUserByEmailUseCase, 'IVerifyPasswordService', ValidatePasswordRecoveryDomainService, ResetUserPasswordUseCase, SendPasswordUpdatedEmailUseCase],
    },
    CreatePasswordRecoveryDomainService,
    GenerateRecoveryCodeCryptoService,
    PasswordRecoveryShutdownService,
    { provide: 'IGenerateRecoveryCodeService', useExisting: GenerateRecoveryCodeCryptoService },
    {
      provide: ForgotPasswordUseCase,
      useFactory: (users: FindUserByEmailUseCase, store: SetUserPasswordRecoveryUseCase,
        generator: IGenerateRecoveryCodeService, domain: CreatePasswordRecoveryDomainService,
        hasher: IHashPasswordService, sender: SendRecoveryCodeEmailUseCase, logger: AppLogger) => {
        return new ForgotPasswordUseCase(users, store, generator, domain, hasher, sender,
          () => { logger.warn(ForgotPasswordUseCase.name, 'password.recovery.background.failed') })
      },
      inject: [FindUserByEmailUseCase, SetUserPasswordRecoveryUseCase, 'IGenerateRecoveryCodeService',
        CreatePasswordRecoveryDomainService, 'IHashPasswordService', SendRecoveryCodeEmailUseCase, AppLogger],
    },
    VerifyAccessTokenJwtService,
    { provide: 'IVerifyAccessTokenService', useExisting: VerifyAccessTokenJwtService },
    {
      provide: LogoutUseCase,
      useFactory: (verifier: IVerifyAccessTokenService) => new LogoutUseCase(verifier),
      inject: ['IVerifyAccessTokenService'],
    },
    VerifyRefreshTokenJwtService,
    { provide: 'IVerifyRefreshTokenService', useExisting: VerifyRefreshTokenJwtService },
    {
      provide: RefreshUseCase,
      useFactory: (verifier: IVerifyRefreshTokenService, tokens: IIssueLoginTokensService) =>
        new RefreshUseCase(verifier, tokens),
      inject: ['IVerifyRefreshTokenService', 'IIssueLoginTokensService'],
    },
    ValidateLoginDomainService,
    IssueLoginTokensJwtService,
    { provide: 'IIssueLoginTokensService', useExisting: IssueLoginTokensJwtService },
    {
      provide: LoginUseCase,
      useFactory: (users: FindUserByEmailUseCase, verifier: IVerifyPasswordService,
        validator: ValidateLoginDomainService, tokens: IIssueLoginTokensService) =>
        new LoginUseCase(users, verifier, validator, tokens),
      inject: [FindUserByEmailUseCase, 'IVerifyPasswordService', ValidateLoginDomainService, 'IIssueLoginTokensService'],
    },
  ],
  exports: [LoginUseCase, RefreshUseCase, LogoutUseCase, ForgotPasswordUseCase, ResetPasswordUseCase],
})
export class AuthModule {}

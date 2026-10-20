import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SessionGuard } from './presentation/guards/session.guard';
import { ConfiguredPasswordPolicyAdapter } from './infrastructure/providers/configured-password-policy.adapter';
import { ClinicsModule } from '../clinics/clinics.module';
import { UsersModule } from '../users/users.module';
import { DynamooseModule } from '../../infrastructure/dynamoose/dynamoose.module';
import { EmailModule } from '../email/email.module';
import { ValidatePasswordDomainService } from './domain/services/validate-password.domain-service';
import { ValidatePasswordRecoveryDomainService } from './domain/services/validate-password-recovery.domain-service';
import { ValidateAuthAccountService } from './application/services/validate-auth-account.service';
import { SignInUseCase } from './application/use-cases/sign-in.use-case';
import { VerifySessionUseCase } from './application/use-cases/verify-session.use-case';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ForgotPasswordResetUseCase } from './application/use-cases/forgot-password-reset.use-case';
import { AuthUserReaderAdapter } from './infrastructure/providers/auth-user-reader.adapter';
import { AuthClinicReaderAdapter } from './infrastructure/providers/auth-clinic-reader.adapter';
import { ScryptPasswordHasherAdapter } from './infrastructure/providers/scrypt-password-hasher.adapter';
import { JwtSessionAdapter } from './infrastructure/providers/jwt-session.adapter';
import { HmacRecoveryCodeAdapter } from './infrastructure/providers/hmac-recovery-code.adapter';
import { RecoveryEmailAdapter } from './infrastructure/providers/recovery-email.adapter';
import { UserPasswordWriterAdapter } from './infrastructure/providers/user-password-writer.adapter';
import { SavePasswordRecoveryDynamooseAdapter } from './infrastructure/persistence/adapters/save-password-recovery-dynamoose.adapter';
import { FindPasswordRecoveryDynamooseAdapter } from './infrastructure/persistence/adapters/find-password-recovery-dynamoose.adapter';
import { RegisterRecoveryAttemptDynamooseAdapter } from './infrastructure/persistence/adapters/register-recovery-attempt-dynamoose.adapter';
import { ConsumePasswordRecoveryDynamooseAdapter } from './infrastructure/persistence/adapters/consume-password-recovery-dynamoose.adapter';
import { CsrfGuard } from './presentation/guards/csrf.guard';
import { AuthRateLimitGuard } from './presentation/guards/auth-rate-limit.guard';
import { SignInController } from './presentation/controllers/sign-in.controller';
import { SignOutController } from './presentation/controllers/sign-out.controller';
import { VerifySessionController } from './presentation/controllers/verify-session.controller';
import { RefreshSessionController } from './presentation/controllers/refresh-session.controller';
import { ResetPasswordController } from './presentation/controllers/reset-password.controller';
import { ForgotPasswordController } from './presentation/controllers/forgot-password.controller';
import { ForgotPasswordResetController } from './presentation/controllers/forgot-password-reset.controller';

@Module({
  imports: [ClinicsModule, UsersModule, EmailModule, DynamooseModule],
  controllers: [
    SignInController, SignOutController, VerifySessionController, RefreshSessionController,
    ResetPasswordController, ForgotPasswordController, ForgotPasswordResetController
  ],
  providers: [
    { provide: APP_GUARD, useClass: SessionGuard },
    ValidatePasswordDomainService, ValidatePasswordRecoveryDomainService, ValidateAuthAccountService,
    SignInUseCase, VerifySessionUseCase, RefreshSessionUseCase, ResetPasswordUseCase,
    ForgotPasswordUseCase, ForgotPasswordResetUseCase, CsrfGuard, AuthRateLimitGuard,
    { provide: 'AuthUserReaderPort', useClass: AuthUserReaderAdapter },
    { provide: 'AuthClinicReaderPort', useClass: AuthClinicReaderAdapter },
    { provide: 'PasswordHasherPort', useClass: ScryptPasswordHasherAdapter },
    { provide: 'PasswordPolicyProvider', useClass: ConfiguredPasswordPolicyAdapter },
    { provide: 'SessionPort', useClass: JwtSessionAdapter },
    { provide: 'RecoveryCodePort', useClass: HmacRecoveryCodeAdapter },
    { provide: 'RecoveryEmailPort', useClass: RecoveryEmailAdapter },
    { provide: 'UserPasswordWriterPort', useClass: UserPasswordWriterAdapter },
    { provide: 'ISavePasswordRecoveryRepository', useClass: SavePasswordRecoveryDynamooseAdapter },
    { provide: 'IFindPasswordRecoveryRepository', useClass: FindPasswordRecoveryDynamooseAdapter },
    { provide: 'IRegisterRecoveryAttemptRepository', useClass: RegisterRecoveryAttemptDynamooseAdapter },
    { provide: 'IConsumePasswordRecoveryRepository', useClass: ConsumePasswordRecoveryDynamooseAdapter }
  ],
  exports: [VerifySessionUseCase]
})
export class AuthModule {}

import { Module } from '@nestjs/common'
import { PasswordHashService } from './infrastructure/services/password-hash.service'
import { PasswordVerifyService } from './infrastructure/services/password-verify.service'

@Module({
  providers: [
    PasswordVerifyService,
    { provide: 'IVerifyPasswordService', useExisting: PasswordVerifyService },
    PasswordHashService,
    {
      provide: 'IHashPasswordService',
      useExisting: PasswordHashService,
    },
  ],

  exports: ['IHashPasswordService', 'IVerifyPasswordService'],
})
export class AuthModule {}

import { Module } from '@nestjs/common'
import { PasswordHasher } from '@nestjs/authentication'
import { PasswordHashService } from './infrastructure/services/password-hash.service'
import { PasswordVerifyService } from './infrastructure/services/password-verify.service'

@Module({
  providers: [
    { provide: PasswordHasher, useFactory: () => new PasswordHasher() },
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

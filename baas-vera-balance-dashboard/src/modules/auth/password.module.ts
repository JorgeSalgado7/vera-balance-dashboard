import { Module } from '@nestjs/common'
import { PasswordHasher } from '@nestjs/authentication'
import { PasswordHashService } from './infrastructure/services/password-hash.service'
import { PasswordVerifyService } from './infrastructure/services/password-verify.service'

@Module({
  providers: [
    { provide: PasswordHasher, useFactory: () => new PasswordHasher() },
    PasswordHashService,
    PasswordVerifyService,
    { provide: 'IHashPasswordService', useExisting: PasswordHashService },
    { provide: 'IVerifyPasswordService', useExisting: PasswordVerifyService },
  ],
  exports: ['IHashPasswordService', 'IVerifyPasswordService'],
})
export class PasswordModule {}

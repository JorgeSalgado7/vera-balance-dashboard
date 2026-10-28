import { Module } from '@nestjs/common'
import { PasswordHashService } from './infrastructure/services/password-hash.service'

@Module({
  providers: [
    PasswordHashService,
    {
      provide: 'IHashPasswordService',
      useExisting: PasswordHashService,
    },
  ],

  exports: ['IHashPasswordService'],
})
export class AuthModule {}

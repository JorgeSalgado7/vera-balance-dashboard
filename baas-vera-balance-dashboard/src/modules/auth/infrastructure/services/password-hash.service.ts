import { Injectable } from '@nestjs/common'
import { PasswordHasher } from '@nestjs/authentication'

import type { IHashPasswordService } from '../../domain/services/hash-password.service'

@Injectable()
export class PasswordHashService implements IHashPasswordService {
  constructor(private readonly passwordHasher: PasswordHasher) {}

  async hash(password: string): Promise<string> {
    return this.passwordHasher.hash(password)
  }
}

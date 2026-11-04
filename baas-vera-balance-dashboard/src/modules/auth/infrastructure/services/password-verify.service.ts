import { Injectable } from '@nestjs/common'
import { PasswordHasher } from '@nestjs/authentication'
import type { IVerifyPasswordService } from '../../domain/services/verify-password.service'

@Injectable()
export class PasswordVerifyService implements IVerifyPasswordService {
  constructor(private readonly passwordHasher: PasswordHasher) {}

  async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await this.passwordHasher.verify(password, hash)
    } catch {
      throw new Error('No se pudo verificar la contraseña.')
    }
  }
}

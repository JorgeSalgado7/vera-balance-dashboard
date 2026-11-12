import { randomInt } from 'node:crypto'
import type { IGenerateRecoveryCodeService } from '../../domain/services/generate-recovery-code.service'

export class GenerateRecoveryCodeCryptoService implements IGenerateRecoveryCodeService {
  generate(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0')
  }
}

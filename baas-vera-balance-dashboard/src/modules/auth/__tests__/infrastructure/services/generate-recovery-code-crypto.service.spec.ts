import { randomInt } from 'node:crypto'
import { GenerateRecoveryCodeCryptoService } from '../../../infrastructure/services/generate-recovery-code-crypto.service'

jest.mock('node:crypto', () => ({ randomInt: jest.fn() }))

describe('GenerateRecoveryCodeCryptoService', () => {
  it.each([[0, '000000'], [42, '000042'], [999999, '999999']])('formats secure random value %s as six digits', (value, expected) => {
    ;(randomInt as jest.Mock).mockReturnValue(value)
    expect(new GenerateRecoveryCodeCryptoService().generate()).toBe(expected)
    expect(randomInt).toHaveBeenCalledWith(0, 1_000_000)
  })
})

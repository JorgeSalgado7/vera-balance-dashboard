export class CreatePasswordRecoveryDomainService {
  create(code: string) {
    return { code, expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() }
  }
}

import type { FindUserByEmailUseCase } from '../../../users/application/use-cases/find-user-by-email.use-case'
import type { IIssueLoginTokensService } from '../../domain/services/issue-login-tokens.service'
import type { IVerifyPasswordService } from '../../domain/services/verify-password.service'
import { ValidateLoginDomainService } from '../../domain/services/validate-login.domain-service'
import type { LoginDto } from '../dtos/login.dto'
import type { LoginResponseDto } from '../dtos/login-response.dto'

export class LoginUseCase {
  constructor(
    private readonly findUserByEmail: FindUserByEmailUseCase,
    private readonly verifier: IVerifyPasswordService,
    private readonly validator: ValidateLoginDomainService,
    private readonly tokens: IIssueLoginTokensService,
  ) {}

  async execute(input: LoginDto): Promise<LoginResponseDto> {
    const user = await this.findUserByEmail.execute(input.email)
    const matches = user ? await this.verifier.verify(input.password, user.password) : false
    this.validator.validate(user, matches)

    const tokens = await this.tokens.issue(user.id)
    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinic: user.clinic,
      },
    }
  }
}

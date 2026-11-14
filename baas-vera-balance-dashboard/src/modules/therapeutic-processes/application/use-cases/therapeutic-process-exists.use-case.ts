import { Inject, Injectable } from '@nestjs/common'
import type { ITherapeuticProcessRepository } from '../../domain/repositories/therapeutic-process.repository'

@Injectable()
export class TherapeuticProcessExistsUseCase {
  constructor(@Inject('ITherapeuticProcessRepository') private readonly repository: ITherapeuticProcessRepository) {}

  async execute(id: string): Promise<boolean> {
    return (await this.repository.findById(id)) !== null
  }
}

import { Inject, Injectable } from '@nestjs/common'
import type { ITherapeuticProcessRepository } from '../../domain/repositories/therapeutic-process.repository'
import { TherapeuticProcessNotFoundError } from '../../domain/errors/therapeutic-process.error'

@Injectable()
export class DeleteTherapeuticProcessUseCase {
  constructor(@Inject('ITherapeuticProcessRepository') private readonly repository: ITherapeuticProcessRepository) {}

  async execute(id: string): Promise<void> {
    const entity = await this.repository.findById(id)
    if (!entity) throw new TherapeuticProcessNotFoundError()
    await this.repository.deleteCascade(entity)
  }
}

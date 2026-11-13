import { TherapyTypeInUseError } from '../../domain/errors/therapy-type.error'
import { Inject, Injectable } from '@nestjs/common'
import type { ITherapyTypeRepository } from '../../domain/repositories/therapy-type.repository'

@Injectable()
export class DeleteTherapyTypeUseCase {
  constructor(@Inject('ITherapyTypeRepository') private readonly repository: ITherapyTypeRepository) {}

  async execute(id: string): Promise<void> {
    if (await this.repository.isAssignedToClinic(id)) throw new TherapyTypeInUseError()
    await this.repository.delete(id)
  }
}

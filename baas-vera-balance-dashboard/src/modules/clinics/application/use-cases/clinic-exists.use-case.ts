import { Inject, Injectable } from '@nestjs/common'
import type { IClinicRepository } from '../../domain/repositories/clinic.repository'

@Injectable()
export class ClinicExistsUseCase {
  constructor(@Inject('IClinicRepository') private readonly repository: Pick<IClinicRepository, 'findById'>) {}

  async execute(id: string): Promise<boolean> {
    return (await this.repository.findById(id)) !== null
  }
}

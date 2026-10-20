import { Inject, Injectable } from '@nestjs/common';
import type { IFindClinicByIdRepository } from '../../domain/repositories/find-clinic-by-id.repository';

@Injectable()
export class IsClinicActiveUseCase {
  constructor(
    @Inject('IFindClinicByIdRepository') private readonly repository: IFindClinicByIdRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    return (await this.repository.findById(id))?.status === 'active';
  }
}

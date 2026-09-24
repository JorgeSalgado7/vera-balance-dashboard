import { Inject, Injectable } from '@nestjs/common';
import type { IFindUserClinicIdRepository } from '../../domain/repositories/find-user-clinic-id.repository';

@Injectable()
export class GetUserClinicIdUseCase {
  constructor(
    @Inject('IFindUserClinicIdRepository')
    private readonly findUserClinicIdRepository: IFindUserClinicIdRepository
  ) {}

  execute(userId: string): Promise<string | null> {
    return this.findUserClinicIdRepository.findClinicIdByUserId(userId);
  }
}

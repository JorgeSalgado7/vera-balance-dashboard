import { Inject, Injectable } from '@nestjs/common';
import { UserResponseDto } from '../dtos/user-response.dto';
import type { IFindUsersRepository } from '../../domain/repositories/find-users.repository';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject('IFindUsersRepository')
    private readonly findUsersRepository: IFindUsersRepository
  ) {}

  async execute(): Promise<UserResponseDto[]> {
    const users = await this.findUsersRepository.findAll();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      professional_license: user.professionalLicense,
      clinic: { id: user.clinicId },
      role: user.role,
      status: user.status,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    }));
  }
}

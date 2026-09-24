import { Inject, Injectable } from '@nestjs/common';
import { UserResponseDto } from '../dtos/user-response.dto';
import type { IFindUserByIdRepository } from '../../domain/repositories/find-user-by-id.repository';
import { UserNotFoundError } from '../../domain/errors/user.error';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject('IFindUserByIdRepository')
    private readonly findUserByIdRepository: IFindUserByIdRepository
  ) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const user = await this.findUserByIdRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      professional_license: user.professionalLicense,
      clinic: { id: user.clinicId },
      role: user.role,
      status: user.status,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    };
  }
}

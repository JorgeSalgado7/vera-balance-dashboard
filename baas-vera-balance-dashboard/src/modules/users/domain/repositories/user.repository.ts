import type { SetUserPasswordRecoveryDto } from '../../application/dtos/set-user-password-recovery.dto'
import type { ResetUserPasswordDto } from '../../application/dtos/reset-user-password.dto'
import type { UserEntity } from '../entities/user.entity'
import type { UpdateUserChanges } from '../interfaces/update-user-changes'

export interface IUserRepository {
  create(entity: UserEntity): Promise<UserEntity>
  findByEmail(email: string): Promise<UserEntity | null>
  findById(id: string): Promise<UserEntity | null>
  findAll(): Promise<UserEntity[]>
  update(user: UserEntity, changes: UpdateUserChanges, updatedAt: string): Promise<UserEntity>
  updateStatus(user: UserEntity, status: UserEntity['status'], updatedAt: string): Promise<UserEntity>
  changePassword(user: UserEntity, passwordHash: string, updatedAt: string): Promise<void>
  delete(user: UserEntity): Promise<void>
  hasTherapeuticProcesses(userId: string): Promise<boolean>
  reset(input: ResetUserPasswordDto, updatedAt: string): Promise<boolean>
  set(input: SetUserPasswordRecoveryDto, updatedAt: string): Promise<boolean>
}

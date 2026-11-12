import type { TherapyTypeEntity } from '../entities/therapy-type.entity'

export interface ITherapyTypeRepository {
  create(entity: TherapyTypeEntity): Promise<TherapyTypeEntity>
  findById(id: string): Promise<TherapyTypeEntity | null>
  findAll(): Promise<TherapyTypeEntity[]>
  update(entity: TherapyTypeEntity, changes: Partial<Pick<TherapyTypeEntity, 'name' | 'icon'>>, updatedAt: string): Promise<TherapyTypeEntity>
  delete(id: string): Promise<void>
}

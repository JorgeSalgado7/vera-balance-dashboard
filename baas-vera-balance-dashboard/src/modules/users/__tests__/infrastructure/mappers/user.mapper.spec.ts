import { UserMapper } from '../../../infrastructure/mappers/user.mapper'
import { UserEntity } from '../../../domain/entities/user.entity'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

const item = {
  pk: 'user-1',
  sk: 'USER',
  name: 'User',
  email: 'user@example.com',
  password: 'hashed-password',
  professional_license: '123',
  role: USER_ROLES.THERAPIST,
  status: 'Activo',
  clinic: 'clinic-1',
  gsi1pk: 'CLINIC#clinic-1',
  gsi1sk: 'USER#user-1',
  gsi2pk: 'EMAIL#user@example.com',
  gsi2sk: 'USER#user-1',
  created_at: '2026-10-28T00:00:00.000Z',
  updated_at: '2026-10-28T00:00:00.000Z',
}

describe('UserMapper', () => {
  describe('toEntity', () => {
    it('restores all persisted fields in a new domain entity', () => {
      const result = UserMapper.toEntity(item)
      expect(result).toBeInstanceOf(UserEntity)
      expect(result).toEqual(item)
      expect(result).not.toBe(item)
    })

    it.each([undefined, null])('normalizes absent clinic to null (%s)', (clinic) => {
      expect(UserMapper.toEntity({ ...item, clinic }).clinic).toBeNull()
    })

    it('does not copy unrelated persistence properties into the entity', () => {
      const result = UserMapper.toEntity({ ...item, internalMetadata: 'private' })
      expect(result).not.toHaveProperty('internalMetadata')
    })
  })

  describe('toPersistence', () => {
    it('preserves keys, indexes and hashed password without mutating the entity', () => {
      const entity = Object.assign(new UserEntity(), item)
      expect(UserMapper.toPersistence(entity)).toEqual(item)
      expect(entity).toEqual(item)
    })

    it('omits the sparse clinic index when clinic is null and preserves the email index', () => {
      const entity = Object.assign(new UserEntity(), item, { role: USER_ROLES.ADMIN, clinic: null })
      const result = UserMapper.toPersistence(entity)
      expect(result).not.toHaveProperty('clinic')
      expect(result).not.toHaveProperty('gsi1pk')
      expect(result).not.toHaveProperty('gsi1sk')
      expect(result).toMatchObject({ pk: item.pk, sk: 'USER', gsi2pk: item.gsi2pk, gsi2sk: item.gsi2sk })
    })

    it('does not persist properties outside the storage contract', () => {
      const entity = Object.assign(new UserEntity(), item, { internalMetadata: 'private' })
      expect(UserMapper.toPersistence(entity)).not.toHaveProperty('internalMetadata')
    })
  })
})

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
  gsi1pk: 'USER',
  gsi1sk: 'USER#user-1',
  gsi2pk: 'CLINIC#clinic-1',
  gsi2sk: 'USER#user-1',
  gsi3pk: 'EMAIL#user@example.com',
  gsi3sk: 'USER#user-1',
  created_at: '2026-10-28T00:00:00.000Z',
  updated_at: '2026-10-28T00:00:00.000Z',
}

describe('UserMapper', () => {
  it('round-trips optional recovery metadata only in internal entity and persistence mappings', () => {
    const persisted = { ...item, password_recovery_code_hash: 'recovery-hash', password_recovery_expires_at: '2026-11-11T00:05:00.000Z' }
    expect(UserMapper.toPersistence(UserMapper.toEntity(persisted))).toEqual(persisted)
  })
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
      expect(result).toHaveProperty('clinic', null)
      expect(result).not.toHaveProperty('gsi2pk')
      expect(result).not.toHaveProperty('gsi2sk')
      expect(result).toMatchObject({ pk: item.pk, sk: 'USER', gsi3pk: item.gsi3pk, gsi3sk: item.gsi3sk })
    })

    it('does not persist properties outside the storage contract', () => {
      const entity = Object.assign(new UserEntity(), item, { internalMetadata: 'private' })
      expect(UserMapper.toPersistence(entity)).not.toHaveProperty('internalMetadata')
    })
  })
})

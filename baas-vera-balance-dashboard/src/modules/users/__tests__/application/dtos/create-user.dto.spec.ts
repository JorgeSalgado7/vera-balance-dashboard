import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { CreateUserDto } from '../../../application/dtos/create-user.dto'
import { USER_ROLES, USER_ROLE_VALUES } from '../../../../../constants/user-roles.constant'

const body = {
  name: 'User',
  email: 'user@example.com',
  password: 'Password123!',
  professional_license: '123',
  role: USER_ROLES.THERAPIST,
  clinic: '11111111-1111-4111-8111-111111111111',
}

describe('CreateUserDto', () => {
  it.each(USER_ROLE_VALUES)('accepts role %s', async (role) => {
    expect(await validate(plainToInstance(CreateUserDto, { ...body, role }))).toEqual([])
  })

  it('accepts an explicit null clinic', async () => {
    expect(await validate(plainToInstance(CreateUserDto, { ...body, role: USER_ROLES.ADMIN, clinic: null }))).toEqual([])
  })

  it.each(Object.keys(body))('requires field %s', async (field) => {
    const payload: Record<string, unknown> = { ...body }
    delete payload[field]
    const errors = await validate(plainToInstance(CreateUserDto, payload))
    expect(errors.some((error) => error.property === field)).toBe(true)
  })

  it.each([
    ['name', ''],
    ['name', 123],
    ['email', 'invalid'],
    ['email', null],
    ['password', ''],
    ['password', 123],
    ['professional_license', ''],
    ['professional_license', null],
    ['role', 'superadmin'],
    ['role', 'Admin'],
    ['clinic', 'invalid'],
    ['clinic', 123],
  ])('rejects invalid %s (%s)', async (field, value) => {
    const errors = await validate(plainToInstance(CreateUserDto, { ...body, [field]: value }))
    expect(errors.some((error) => error.property === field)).toBe(true)
  })

  it('rejects fields outside the request contract with the configured whitelist options', async () => {
    const errors = await validate(plainToInstance(CreateUserDto, { ...body, actor: { role: USER_ROLES.ADMIN } }), { whitelist: true, forbidNonWhitelisted: true })
    expect(errors.some((error) => error.property === 'actor')).toBe(true)
  })
})

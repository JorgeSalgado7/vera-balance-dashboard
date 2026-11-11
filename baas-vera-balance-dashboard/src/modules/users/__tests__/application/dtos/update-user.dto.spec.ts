import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { UpdateUserDto } from '../../../application/dtos/update-user.dto'
import { UpdateUserBodyPipe } from '../../../presentation/http/pipes/update-user-body.pipe'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

const options = { whitelist: true, forbidNonWhitelisted: true }

describe('UpdateUserDto', () => {
  it.each([{ name: 'User' }, { professional_license: '123' }, { role: USER_ROLES.ADMIN }, { clinic: null }, { clinic: '11111111-1111-4111-8111-111111111111' }])(
    'accepts a partial patch %j',
    async (body) => {
      expect(await validate(plainToInstance(UpdateUserDto, body), options)).toEqual([])
    },
  )

  it.each(['new@example.com', ' USER@EXAMPLE.COM ', null])('rejects email in a patch (%s)', async email => {
    const body = plainToInstance(UpdateUserDto, { name: 'New', email })
    const errors = await validate(body, options)
    expect(errors.some(error => error.property === 'email')).toBe(true)
  })

  it.each([
    ['name', ''],
    ['name', null],
    ['name', 123],
    ['email', null],
    ['email', 123],
    ['email', 'invalid'],
    ['professional_license', ''],
    ['professional_license', null],
    ['role', 'owner'],
    ['role', null],
    ['clinic', 'invalid'],
  ])('rejects invalid %s (%s)', async (field, value) => {
    const errors = await validate(plainToInstance(UpdateUserDto, { [field]: value }), options)
    expect(errors.some((error) => error.property === field)).toBe(true)
  })

  it.each(['password', 'status', 'pk', 'sk', 'created_at', 'updated_at', 'gsi1pk', 'gsi1sk', 'gsi2pk', 'gsi2sk', 'gsi3pk', 'gsi3sk'])('rejects forbidden field %s', async (field) => {
    const errors = await validate(plainToInstance(UpdateUserDto, { name: 'New', [field]: 'forged' }), options)
    expect(errors.some((error) => error.property === field)).toBe(true)
  })

  it('rejects an empty transformed DTO despite its undefined optional properties', () => {
    const pipe = new UpdateUserBodyPipe()
    expect(() => pipe.transform(plainToInstance(UpdateUserDto, {}))).toThrow()
    const body = plainToInstance(UpdateUserDto, { clinic: null })
    expect(pipe.transform(body)).toBe(body)
  })
})

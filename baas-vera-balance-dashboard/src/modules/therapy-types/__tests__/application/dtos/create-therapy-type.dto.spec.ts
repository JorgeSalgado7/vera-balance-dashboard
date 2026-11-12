import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { CreateTherapyTypeDto } from '../../../application/dtos/create-therapy-type.dto'

describe('CreateTherapyTypeDto', () => {
  it.each([{ name: 'Individual' }, { name: 'Pareja', icon: null }, { name: 'Familiar', icon: 'family' }])('accepts %j', async value => {
    expect(await validate(plainToInstance(CreateTherapyTypeDto, value), { whitelist: true, forbidNonWhitelisted: true })).toEqual([])
  })
  it.each([{ name: null }, { name: 5 }, { icon: 5, name: 'Individual' }, { name: 'Individual', id: 'immutable' }, {}])('rejects %j', async value => {
    expect((await validate(plainToInstance(CreateTherapyTypeDto, value), { whitelist: true, forbidNonWhitelisted: true })).length).toBeGreaterThan(0)
  })
})

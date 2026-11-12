import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { UpdateTherapyTypeDto } from '../../../application/dtos/update-therapy-type.dto'

describe('UpdateTherapyTypeDto', () => {
  it.each([{ name: 'Individual' }, { name: 'Pareja', icon: null }, { name: 'Familiar', icon: 'family' }, { icon: null }])('accepts %j', async value => {
    expect(await validate(plainToInstance(UpdateTherapyTypeDto, value), { whitelist: true, forbidNonWhitelisted: true })).toEqual([])
  })
  it.each([{ name: null }, { name: 5 }, { icon: 5, name: 'Individual' }, { name: 'Individual', id: 'immutable' }])('rejects %j', async value => {
    expect((await validate(plainToInstance(UpdateTherapyTypeDto, value), { whitelist: true, forbidNonWhitelisted: true })).length).toBeGreaterThan(0)
  })
})

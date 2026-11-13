import { validate } from 'class-validator'
import { UpdateClinicDto } from '../../../application/dtos/update-clinic.dto'

describe('UpdateClinicDto', () => {
  it.each([{ status: 'Inactivo' }, { logo: null }, { therapy_types: [] }, { name: 'Nueva' }])('accepts partial changes %j', async changes => {
    expect(await validate(Object.assign(new UpdateClinicDto(), changes))).toEqual([])
  })
  it.each(['name', 'address', 'phone_number', 'therapy_types', 'status'])('rejects null for %s', async field => {
    expect((await validate(Object.assign(new UpdateClinicDto(), { [field]: null }))).map(error => error.property)).toContain(field)
  })
  it('rejects duplicate therapies', async () => {
    expect((await validate(Object.assign(new UpdateClinicDto(), { therapy_types: ['a', 'a'] }))).map(error => error.property)).toContain('therapy_types')
  })
})

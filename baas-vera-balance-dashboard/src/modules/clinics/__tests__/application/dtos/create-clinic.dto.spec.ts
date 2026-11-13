import { validate } from 'class-validator'
import { CreateClinicDto } from '../../../application/dtos/create-clinic.dto'

const valid = { name: 'Clínica', address: 'Centro', phone_number: '+52 55', therapy_types: [], status: 'Activo' }
describe('CreateClinicDto', () => {
  it('accepts an empty therapy selection and optional or null logo', async () => {
    for (const logo of [undefined, null, 'logo.svg']) expect(await validate(Object.assign(new CreateClinicDto(), valid, { logo }))).toEqual([])
  })
  it.each(['name', 'address', 'phone_number', 'therapy_types', 'status'])('requires %s and identifies the missing field', async field => {
    const dto = Object.assign(new CreateClinicDto(), valid)
    Reflect.deleteProperty(dto, field)
    expect((await validate(dto)).map(error => error.property)).toContain(field)
  })
  it.each([{ therapy_types: ['a', 'a'] }, { therapy_types: [1] }, { therapy_types: null }, { status: 'Otro' }, { logo: 2 }])('rejects invalid values %j', async changes => {
    expect((await validate(Object.assign(new CreateClinicDto(), valid, changes))).length).toBeGreaterThan(0)
  })
})

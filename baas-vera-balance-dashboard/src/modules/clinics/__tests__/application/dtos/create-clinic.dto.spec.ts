import { validate } from 'class-validator'
import { CreateClinicDto } from '../../../application/dtos/create-clinic.dto'

const valid = { name: 'Clínica', address: 'Centro', phone_number: '+52 55', therapy_types: [], status: 'Activo' }
describe('CreateClinicDto', () => {
  it('accepts an empty therapy selection', async () => {
    expect(await validate(Object.assign(new CreateClinicDto(), valid))).toEqual([])
  })
  it('rejects the removed logo property', async () => {
    const dto = Object.assign(new CreateClinicDto(), valid, { logo: 'old-logo.svg' })
    expect((await validate(dto, { whitelist: true, forbidNonWhitelisted: true })).map(error => error.property)).toContain('logo')
  })
  it('accepts creating a clinic without therapy_types', async () => {
    const dto = Object.assign(new CreateClinicDto(), valid)
    Reflect.deleteProperty(dto, 'therapy_types')
    expect(await validate(dto)).toEqual([])
  })
  it.each(['name', 'address', 'phone_number', 'status'])('requires %s and identifies the missing field', async field => {
    const dto = Object.assign(new CreateClinicDto(), valid)
    Reflect.deleteProperty(dto, field)
    expect((await validate(dto)).map(error => error.property)).toContain(field)
  })
  it.each([{ therapy_types: ['a', 'a'] }, { therapy_types: [1] }, { therapy_types: null }, { status: 'Otro' }])('rejects invalid values %j', async changes => {
    expect((await validate(Object.assign(new CreateClinicDto(), valid, changes))).length).toBeGreaterThan(0)
  })
})

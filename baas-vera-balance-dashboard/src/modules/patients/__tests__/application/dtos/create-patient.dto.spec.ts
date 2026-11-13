import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { CreatePatientDto } from '../../../application/dtos/create-patient.dto'
import { patientInput } from '../../fixtures/patient.fixture'

describe('CreatePatientDto', () => {
  it('accepts documented fields and nullable optional data', async () => {
    const dto = plainToInstance(CreatePatientDto, { ...patientInput, guardian: null, partner_data: null, phone_number: null })
    expect(await validate(dto)).toEqual([])
  })
  it.each([{ birthday: '2025-02-29' }, { birthday: '2024-02-30' }, { birthday: '2000-01-01T00:00:00Z' }, { birthday: '2000-1-1' }, { gender: 'Otro' }, { educational_level: 'Doctorado' }, { marital_status: 'Otro' }, { guardian: [] }, { guardian: { name: 'Tutor' } }, { partner_data: { name: 'Pareja' } }, { phone_number: 123 }])('rejects invalid values %j', async changes => {
    expect((await validate(plainToInstance(CreatePatientDto, { ...patientInput, ...changes }))).length).toBeGreaterThan(0)
  })
  it('accepts complete nested data and validates nested unknown fields', async () => {
    const valid = { ...patientInput, guardian: { name: 'Tutor', phone_number: '555', relationship: 'Madre' }, partner_data: { name: 'Pareja', relationship_time: '2 años', occupation: 'Docente' } }
    expect(await validate(plainToInstance(CreatePatientDto, valid))).toEqual([])
    expect((await validate(plainToInstance(CreatePatientDto, { ...valid, guardian: { ...valid.guardian, unsupported: true } }), { whitelist: true, forbidNonWhitelisted: true })).map(error => error.property)).toContain('guardian')
  })
  it('accepts leap day on a leap year', async () => {
    expect(await validate(plainToInstance(CreatePatientDto, { ...patientInput, birthday: '2024-02-29' }))).toEqual([])
  })
  it.each(['clinic', 'name', 'birthday', 'gender', 'educational_level', 'occupation', 'marital_status', 'religion', 'address'])('requires %s and identifies the missing field', async field => {
    const input = { ...patientInput }; Reflect.deleteProperty(input, field)
    expect((await validate(plainToInstance(CreatePatientDto, input))).map(error => error.property)).toContain(field)
  })
})

import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { CreateTherapeuticProcessDto } from '../../../application/dtos/create-therapeutic-process.dto'
import { input } from '../../fixtures/process.fixture'

describe('CreateTherapeuticProcessDto', () => {
  it('accepts documented input', async () => { expect(await validate(plainToInstance(CreateTherapeuticProcessDto, input))).toEqual([]) })
  it('rejects null clinic', async () => { expect((await validate(plainToInstance(CreateTherapeuticProcessDto, { ...input, clinic: null }))).map(error => error.property)).toContain('clinic') })
  it('rejects null therapy_type', async () => { expect((await validate(plainToInstance(CreateTherapeuticProcessDto, { ...input, therapy_type: null }))).map(error => error.property)).toContain('therapy_type') })
  it('rejects null therapist', async () => { expect((await validate(plainToInstance(CreateTherapeuticProcessDto, { ...input, therapist: null }))).map(error => error.property)).toContain('therapist') })
  it('rejects null patients', async () => { expect((await validate(plainToInstance(CreateTherapeuticProcessDto, { ...input, patients: null }))).map(error => error.property)).toContain('patients') })
  it('rejects null is_first_time', async () => { expect((await validate(plainToInstance(CreateTherapeuticProcessDto, { ...input, is_first_time: null }))).map(error => error.property)).toContain('is_first_time') })
  it('rejects null consultation_reason', async () => { expect((await validate(plainToInstance(CreateTherapeuticProcessDto, { ...input, consultation_reason: null }))).map(error => error.property)).toContain('consultation_reason') })
  it('rejects null goals', async () => { expect((await validate(plainToInstance(CreateTherapeuticProcessDto, { ...input, goals: null }))).map(error => error.property)).toContain('goals') })
  it('rejects null status', async () => { expect((await validate(plainToInstance(CreateTherapeuticProcessDto, { ...input, status: null }))).map(error => error.property)).toContain('status') })
  it.each(['clinic', 'therapy_type', 'therapist', 'patients', 'is_first_time', 'consultation_reason', 'goals', 'status'])('requires %s', async field => { const data = { ...input }; Reflect.deleteProperty(data, field); expect((await validate(plainToInstance(CreateTherapeuticProcessDto, data))).map(error => error.property)).toContain(field) })
  it.each([{ patients: [] }, { patients: ['same', 'same'] }, { patients: [123] }])('rejects invalid patients %j', async ({ patients }) => { expect((await validate(plainToInstance(CreateTherapeuticProcessDto, { ...input, patients }))).map(error => error.property)).toContain('patients') })
  it('preserves false as a valid boolean', async () => { expect(await validate(plainToInstance(CreateTherapeuticProcessDto, { ...input, is_first_time: false }))).toEqual([]) })
})

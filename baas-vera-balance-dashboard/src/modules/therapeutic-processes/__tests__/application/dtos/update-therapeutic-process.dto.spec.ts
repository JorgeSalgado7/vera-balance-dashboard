import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { UpdateTherapeuticProcessDto } from '../../../application/dtos/update-therapeutic-process.dto'
import { input } from '../../fixtures/process.fixture'

describe('UpdateTherapeuticProcessDto', () => {
  it('accepts documented input', async () => { expect(await validate(plainToInstance(UpdateTherapeuticProcessDto, { goals: 'Nuevos' }))).toEqual([]) })
  it('rejects null therapy_type', async () => { expect((await validate(plainToInstance(UpdateTherapeuticProcessDto, { ...{ goals: 'Nuevos' }, therapy_type: null }))).map(error => error.property)).toContain('therapy_type') })
  it('rejects null therapist', async () => { expect((await validate(plainToInstance(UpdateTherapeuticProcessDto, { ...{ goals: 'Nuevos' }, therapist: null }))).map(error => error.property)).toContain('therapist') })
  it('rejects null patients', async () => { expect((await validate(plainToInstance(UpdateTherapeuticProcessDto, { ...{ goals: 'Nuevos' }, patients: null }))).map(error => error.property)).toContain('patients') })
  it('rejects null is_first_time', async () => { expect((await validate(plainToInstance(UpdateTherapeuticProcessDto, { ...{ goals: 'Nuevos' }, is_first_time: null }))).map(error => error.property)).toContain('is_first_time') })
  it('rejects null consultation_reason', async () => { expect((await validate(plainToInstance(UpdateTherapeuticProcessDto, { ...{ goals: 'Nuevos' }, consultation_reason: null }))).map(error => error.property)).toContain('consultation_reason') })
  it('rejects null goals', async () => { expect((await validate(plainToInstance(UpdateTherapeuticProcessDto, { ...{ goals: 'Nuevos' }, goals: null }))).map(error => error.property)).toContain('goals') })
  it.each([{ patients: [] }, { patients: ['same', 'same'] }, { patients: [123] }])('rejects invalid patients %j', async ({ patients }) => { expect((await validate(plainToInstance(UpdateTherapeuticProcessDto, { ...{ goals: 'Nuevos' }, patients }))).map(error => error.property)).toContain('patients') })
  it('preserves false as a valid boolean', async () => { expect(await validate(plainToInstance(UpdateTherapeuticProcessDto, { ...{ goals: 'Nuevos' }, is_first_time: false }))).toEqual([]) })
  it.each(['clinic', 'status', 'created_at'])('rejects protected field %s', async field => { expect((await validate(plainToInstance(UpdateTherapeuticProcessDto, { [field]: 'value' }), { whitelist: true, forbidNonWhitelisted: true })).map(error => error.property)).toContain(field) })
})

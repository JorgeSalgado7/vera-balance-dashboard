import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { CreateRecordDto } from '../../../application/dtos/create-record.dto'
import { input } from '../../fixtures/record.fixture'
const valid = input
async function fields(data: unknown) { return (await validate(plainToInstance(CreateRecordDto, data), { whitelist: true, forbidNonWhitelisted: true })).map(error => error.property) }
describe('CreateRecordDto', () => {
  it('accepts documented fields', async () => { expect(await fields(valid)).toEqual([]) })
  it.each(['resume', 'tools'])('accepts nullable %s', async field => { expect(await fields({ ...valid, [field]: null })).toEqual([]) })
  it.each(['session_date', 'attendance'])('rejects null %s', async field => { expect(await fields({ ...valid, [field]: null })).toContain(field) })
  it('rejects invalid calendar dates', async () => { expect(await fields({ ...valid, session_date: '2026-02-30T10:00:00Z' })).toContain('session_date') })
  it.each(['2026-11-13', '2026-11-13T10:00:00'])('rejects dates without a time and timezone: %s', async session_date => { expect(await fields({ ...valid, session_date })).toContain('session_date') })
  it('rejects unsupported attendance', async () => { expect(await fields({ ...valid, attendance: 'Activo' })).toContain('attendance') })
  it('rejects unknown fields', async () => { expect(await fields({ ...valid, other: 'x' })).toContain('other') })
  it.each(["session_date", "attendance", "therapeutic_process"])("requires %s", async field => { const value = { ...input }; Reflect.deleteProperty(value, field); expect(await fields(value)).toContain(field) })
})

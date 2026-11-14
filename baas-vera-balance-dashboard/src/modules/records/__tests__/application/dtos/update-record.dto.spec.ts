import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { UpdateRecordDto } from '../../../application/dtos/update-record.dto'
import { input } from '../../fixtures/record.fixture'
const valid = { resume: 'Resumen' }
async function fields(data: unknown) { return (await validate(plainToInstance(UpdateRecordDto, data), { whitelist: true, forbidNonWhitelisted: true })).map(error => error.property) }
describe('UpdateRecordDto', () => {
  it('accepts documented fields', async () => { expect(await fields(valid)).toEqual([]) })
  it.each(['resume', 'tools'])('accepts nullable %s', async field => { expect(await fields({ ...valid, [field]: null })).toEqual([]) })
  it.each(['session_date', 'attendance'])('rejects null %s', async field => { expect(await fields({ ...valid, [field]: null })).toContain(field) })
  it('rejects invalid calendar dates', async () => { expect(await fields({ ...valid, session_date: '2026-02-30T10:00:00Z' })).toContain('session_date') })
  it.each(['2026-11-13', '2026-11-13T10:00:00'])('rejects dates without a time and timezone: %s', async session_date => { expect(await fields({ ...valid, session_date })).toContain('session_date') })
  it('rejects unsupported attendance', async () => { expect(await fields({ ...valid, attendance: 'Activo' })).toContain('attendance') })
  it('rejects unknown fields', async () => { expect(await fields({ ...valid, other: 'x' })).toContain('other') })
  it("forbids moving records to another process", async () => { expect(await fields({ ...valid, therapeutic_process: "other" })).toContain("therapeutic_process") })
})

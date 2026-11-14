import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { UpdateHomeworkDto } from '../../../application/dtos/update-homework.dto'
import { input } from '../../fixtures/homework.fixture'
const valid = { description: input.description }
async function fields(data: unknown) { return (await validate(plainToInstance(UpdateHomeworkDto, data), { whitelist: true, forbidNonWhitelisted: true })).map(error => error.property) }
describe('UpdateHomeworkDto', () => {
  it('accepts documented input', async () => { expect(await fields(valid)).toEqual([]) })
  it.each([null, 12, '', [], {}].map(description => ({ description })))('rejects invalid descriptions $description', async ({ description }) => { expect(await fields({ ...valid, description })).toContain('description') })
  it('rejects unknown fields', async () => { expect(await fields({ ...valid, unexpected: 'x' })).toContain('unexpected') })
  it("rejects moving the homework to another record", async () => { expect(await fields({ ...valid, record: "other" })).toContain("record") })
  it('rejects a client-supplied therapeutic process ID', async () => {
    expect(await fields({ ...valid, therapeutic_process: 'other-process' })).toContain('therapeutic_process')
  })

})

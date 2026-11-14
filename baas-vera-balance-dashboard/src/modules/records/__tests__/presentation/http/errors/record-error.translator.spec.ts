import { HttpException } from '@nestjs/common'
import { RecordErrorTranslator } from '../../../../presentation/http/errors/record-error.translator'
import { RecordNotFoundError, RecordProcessNotFoundError, InvalidRecordFieldError, EmptyRecordUpdateError, InvalidRecordUpdateFieldsError } from '../../../../domain/errors/record.error'
describe('RecordErrorTranslator', () => {
  it.each([[new RecordNotFoundError(), 404], [new RecordProcessNotFoundError(), 404], [new InvalidRecordFieldError('attendance'), 400], [new EmptyRecordUpdateError(), 400], [new InvalidRecordUpdateFieldsError(['therapeutic_process']), 400]] as const)('translates %s into a frontend-readable problem', (error, status) => {
    try { RecordErrorTranslator.translate(error, '/records/id'); throw new Error('Expected a problem') }
    catch (problem) {
      expect(problem).toBeInstanceOf(HttpException)
      expect((problem as HttpException).getStatus()).toBe(status)
      expect((problem as HttpException).getResponse()).toMatchObject({ detail: error.message, instance: '/records/id' })
    }
  })
  it('leaves unknown infrastructure failures to the global filter', () => { expect(RecordErrorTranslator.translate(new Error('Network'), '/records')).toBeUndefined() })
})

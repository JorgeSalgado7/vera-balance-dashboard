import { HttpException } from '@nestjs/common'
import { HomeworkErrorTranslator } from '../../../../presentation/http/errors/homework-error.translator'
import { HomeworkNotFoundError, InvalidHomeworkFieldError, EmptyHomeworkUpdateError, InvalidHomeworkUpdateFieldsError } from '../../../../domain/errors/homework.error'
describe('HomeworkErrorTranslator', () => {
  it.each([[new HomeworkNotFoundError(), 404], [new InvalidHomeworkFieldError('description'), 400], [new EmptyHomeworkUpdateError(), 400], [new InvalidHomeworkUpdateFieldsError(['record']), 400]] as const)('translates %s to a friendly problem', (error, status) => {
    try { HomeworkErrorTranslator.translate(error, '/homeworks/id'); throw new Error('Expected a problem') }
    catch (problem) {
      expect(problem).toBeInstanceOf(HttpException)
      expect((problem as HttpException).getStatus()).toBe(status)
      expect((problem as HttpException).getResponse()).toMatchObject({ detail: error.message, instance: '/homeworks/id' })
    }
  })
  it('leaves unrelated errors to the global filter', () => { expect(HomeworkErrorTranslator.translate(new Error('Network'), '/homeworks')).toBeUndefined() })
})

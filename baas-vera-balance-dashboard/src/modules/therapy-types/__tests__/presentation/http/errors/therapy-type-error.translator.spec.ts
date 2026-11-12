import { HttpException } from '@nestjs/common'
import { EmptyTherapyTypeUpdateError, TherapyTypeNotFoundError, TherapyTypeConflictError } from '../../../../domain/errors/therapy-type.error'
import { TherapyTypeErrorTranslator } from '../../../../presentation/http/errors/therapy-type-error.translator'

describe('TherapyTypeErrorTranslator', () => {
  it.each([[new EmptyTherapyTypeUpdateError(), 400], [new TherapyTypeNotFoundError(), 404], [new TherapyTypeConflictError(), 409]])('translates %s to %s', (error, status) => {
    try { TherapyTypeErrorTranslator.translate(error, '/therapy-types/id'); throw new Error('Expected translation') }
    catch (translated) {
      if (!(translated instanceof HttpException)) throw translated
      expect(translated.getStatus()).toBe(status)
      expect(translated.getResponse()).toMatchObject({ status, instance: '/therapy-types/id', detail: error.message })
    }
  })
  it('leaves unknown failures for the shared exception filter', () => {
    expect(TherapyTypeErrorTranslator.translate(new Error('storage'), '/therapy-types')).toBeUndefined()
  })
})

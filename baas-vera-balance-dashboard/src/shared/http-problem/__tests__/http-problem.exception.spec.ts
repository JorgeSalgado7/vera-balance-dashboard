import { HttpStatus } from '@nestjs/common'
import { HttpProblemException } from '../http-problem.exception'

describe('HttpProblemException', () => {
  it('preserves the explicit problem fields and HTTP status', () => {
    const error = new HttpProblemException('detail', HttpStatus.CONFLICT, 'https://example.com/conflict', 'Conflict', '/users')
    expect(error.getStatus()).toBe(409)
    expect(error.getResponse()).toEqual({ type: 'https://example.com/conflict', title: 'Conflict', status: 409, instance: '/users', detail: 'detail' })
  })
})

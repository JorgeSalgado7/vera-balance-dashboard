import type { PipeTransform } from '@nestjs/common'
import { UPDATE_USER_FIELDS } from '../../../domain/constants/update-user-fields.constant'
import type { UpdateUserDto } from '../../../application/dtos/update-user.dto'
import { HttpProblem } from '../../../../../shared/http-problem/http-problem.util'

export class UpdateUserBodyPipe implements PipeTransform {
  transform(value: UpdateUserDto): UpdateUserDto {
    if (!value || !UPDATE_USER_FIELDS.some((field) => value[field] !== undefined)) {
      throw HttpProblem.badRequest('Debes proporcionar al menos un campo para actualizar.', '')
    }
    return value
  }
}

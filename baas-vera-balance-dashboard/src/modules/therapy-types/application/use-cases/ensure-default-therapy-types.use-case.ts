import { Injectable } from '@nestjs/common'
import { DEFAULT_THERAPY_TYPES } from '../../domain/constants/default-therapy-types.constant'
import { CreateTherapyTypeUseCase } from './create-therapy-type.use-case'
import { GetTherapyTypesUseCase } from './get-therapy-types.use-case'
import { UpdateTherapyTypeUseCase } from './update-therapy-type.use-case'
import type { GetTherapyTypesResponseDto } from '../dtos/get-therapy-types-response.dto'

@Injectable()
export class EnsureDefaultTherapyTypesUseCase {
  constructor(private readonly reader: GetTherapyTypesUseCase,
    private readonly creator: CreateTherapyTypeUseCase,
    private readonly updater: UpdateTherapyTypeUseCase) {}

  async execute(): Promise<GetTherapyTypesResponseDto[]> {
    const existing = await this.reader.execute()
    const defaults: GetTherapyTypesResponseDto[] = []
    for (const { name, icon } of DEFAULT_THERAPY_TYPES) {
      const therapy = existing.find(item => item.name === name)
      if (!therapy) {
        defaults.push(await this.creator.execute({ name, icon }))
      } else if (therapy.icon !== icon) {
        defaults.push(await this.updater.execute(therapy.id, { icon }))
      } else {
        defaults.push(therapy)
      }
    }
    return defaults
  }
}

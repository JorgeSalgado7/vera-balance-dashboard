import { Item } from 'dynamoose/dist/Item'
import { Schema, model } from 'dynamoose'
import { THERAPEUTIC_PROCESS_STATUS } from '../../../domain/constants/therapeutic-process-status.constant'

export class TherapeuticProcessItem extends Item {
  pk!: string
  sk!: string
  gsi1pk!: string
  gsi1sk!: string
  gsi2pk!: string
  gsi2sk!: string
  gsi3pk!: string
  gsi3sk!: string
  clinic!: string
  therapy_type!: string
  therapist!: string
  patients!: string[]
  is_first_time!: boolean
  consultation_reason!: string
  goals!: string
  status!: typeof THERAPEUTIC_PROCESS_STATUS[number]
  created_at!: string
  updated_at!: string
}

const schema = new Schema({
  pk: { type: String, hashKey: true },
  sk: { type: String, rangeKey: true },
  gsi1pk: { type: String, index: { name: 'GSI1', rangeKey: 'gsi1sk', project: true } },
  gsi1sk: String,
  gsi2pk: { type: String, index: { name: 'GSI2', rangeKey: 'gsi2sk', project: true } },
  gsi2sk: String,
  gsi3pk: { type: String, index: { name: 'GSI3', rangeKey: 'gsi3sk', project: true } },
  gsi3sk: String,
  clinic: { type: String, required: true },
  therapy_type: { type: String, required: true },
  therapist: { type: String, required: true },
  patients: { type: Array, schema: [String], required: true },
  is_first_time: { type: Boolean, required: true },
  consultation_reason: { type: String, required: true },
  goals: { type: String, required: true },
  status: { type: String, required: true, enum: [...THERAPEUTIC_PROCESS_STATUS] },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
}, { timestamps: false })

export const TherapeuticProcessModel = model<TherapeuticProcessItem>('TherapeuticProcess', schema, { tableName: process.env.DYNAMO_TABLE_NAME! })

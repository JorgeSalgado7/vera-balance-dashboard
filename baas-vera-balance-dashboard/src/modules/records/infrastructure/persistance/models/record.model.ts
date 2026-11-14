import { Item } from 'dynamoose/dist/Item'
import { Schema, model, type as dynamooseType } from 'dynamoose'
import { RECORD_ATTENDANCE } from '../../../domain/constants/record-attendance.constant'

export class RecordItem extends Item {
  pk!: string
  sk!: string
  gsi1pk!: string
  gsi1sk!: string
  gsi2pk!: string
  gsi2sk!: string
  session_date!: string
  attendance!: typeof RECORD_ATTENDANCE[number]
  resume!: string | null
  tools!: string | null
  therapeutic_process!: string
  created_at!: string
  updated_at!: string
}

const RecordSchema = new Schema({
  pk: { type: String, hashKey: true },
  sk: { type: String, rangeKey: true },
  gsi1pk: { type: String, index: { name: 'GSI1', rangeKey: 'gsi1sk', project: true } },
  gsi1sk: String,
  gsi2pk: { type: String, index: { name: 'GSI2', rangeKey: 'gsi2sk', project: true } },
  gsi2sk: String,
  session_date: { type: String, required: true },
  attendance: { type: String, required: true, enum: [...RECORD_ATTENDANCE] },
  resume: { type: [String, dynamooseType.NULL] },
  tools: { type: [String, dynamooseType.NULL] },
  therapeutic_process: { type: String, required: true },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
}, { timestamps: false })

export const RecordModel = model<RecordItem>('Record', RecordSchema, { tableName: process.env.DYNAMO_TABLE_NAME! })

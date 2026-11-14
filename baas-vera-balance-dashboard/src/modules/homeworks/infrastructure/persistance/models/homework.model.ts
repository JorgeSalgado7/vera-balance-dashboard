import { Item } from 'dynamoose/dist/Item'
import { Schema, model } from 'dynamoose'

export class HomeworkItem extends Item {
  pk!: string
  sk!: string
  gsi1pk!: string
  gsi1sk!: string
  gsi2pk!: string
  gsi2sk!: string
  description!: string
  record!: string
  therapeutic_process?: string
  created_at!: string
  updated_at!: string
}

const HomeworkSchema = new Schema({
  pk: { type: String, hashKey: true },
  sk: { type: String, rangeKey: true },
  gsi1pk: { type: String, index: { name: 'GSI1', rangeKey: 'gsi1sk', project: true } },
  gsi1sk: String,
  gsi2pk: { type: String, index: { name: 'GSI2', rangeKey: 'gsi2sk', project: true } },
  gsi2sk: String,
  description: { type: String, required: true },
  record: { type: String, required: true },
  therapeutic_process: { type: String, required: true },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
}, { timestamps: false })

export const HomeworkModel = model<HomeworkItem>('Homework', HomeworkSchema, { tableName: process.env.DYNAMO_TABLE_NAME! })

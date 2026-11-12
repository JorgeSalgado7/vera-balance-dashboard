import { Item } from 'dynamoose/dist/Item'
import { Schema, model, type as dynamooseType } from 'dynamoose'

export class TherapyTypeItem extends Item {
  pk!: string
  sk!: 'THERAPY_TYPE'
  name!: string
  icon!: string | null
  gsi1pk!: string
  gsi1sk!: string
  created_at!: string
  updated_at!: string
}

const TherapyTypeSchema = new Schema({
  pk: { type: String, hashKey: true },
  sk: { type: String, rangeKey: true },
  name: { type: String, required: true },
  icon: { type: [String, dynamooseType.NULL] },
  gsi1pk: { type: String, index: { name: 'GSI1', rangeKey: 'gsi1sk', project: true } },
  gsi1sk: { type: String },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
}, { timestamps: false })

export const TherapyTypeModel = model<TherapyTypeItem>('TherapyType', TherapyTypeSchema, { tableName: process.env.DYNAMO_TABLE_NAME! })

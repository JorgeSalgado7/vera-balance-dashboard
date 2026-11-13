import { Item } from 'dynamoose/dist/Item'
import { Schema, model, type as dynamooseType } from 'dynamoose'

export class ClinicItem extends Item {
  pk!: string
  sk!: 'CLINIC'
  name!: string
  logo!: string | null
  address!: string
  phone_number!: string
  therapy_types!: string[]
  status!: 'Activo' | 'Inactivo'
  gsi1pk!: string
  gsi1sk!: string
  created_at!: string
  updated_at!: string
}

const ClinicSchema = new Schema({
  pk: { type: String, hashKey: true },
  sk: { type: String, rangeKey: true },
  gsi1pk: { type: String, index: { name: 'GSI1', rangeKey: 'gsi1sk', project: true } },
  gsi1sk: { type: String },
  name: { type: String, required: true },
  logo: { type: [String, dynamooseType.NULL] },
  address: { type: String, required: true },
  phone_number: { type: String, required: true },
  therapy_types: { type: Array, schema: [String], required: true },
  status: { type: String, required: true, enum: ['Activo', 'Inactivo'] },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
}, { timestamps: false })

export const ClinicModel = model<ClinicItem>('Clinic', ClinicSchema, { tableName: process.env.DYNAMO_TABLE_NAME! })

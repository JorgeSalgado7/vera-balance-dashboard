import { Item } from 'dynamoose/dist/Item'
import { Schema, model, type as dynamooseType } from 'dynamoose'
import { GENDER, EDUCATIONAL_LEVEL, MARITAL_STATUS } from '../../../domain/constants/patient-catalogs.constant'

export class PatientItem extends Item {
  pk!: string
  sk!: string
  gsi1pk!: string
  gsi1sk!: string
  gsi2pk!: string
  gsi2sk!: string
  clinic!: string
  name!: string
  birthday!: string
  guardian!: { name: string, phone_number: string, relationship: string } | null
  phone_number!: string | null
  gender!: typeof GENDER[number]
  educational_level!: typeof EDUCATIONAL_LEVEL[number]
  occupation!: string
  marital_status!: typeof MARITAL_STATUS[number]
  partner_data!: { name: string, relationship_time: string, occupation: string } | null
  religion!: string
  address!: string
  created_at!: string
  updated_at!: string
}

const PatientSchema = new Schema({
  pk: { type: String, hashKey: true },
  sk: { type: String, rangeKey: true },
  gsi1pk: { type: String, index: { name: 'GSI1', rangeKey: 'gsi1sk', project: true } },
  gsi1sk: String,
  gsi2pk: { type: String, index: { name: 'GSI2', rangeKey: 'gsi2sk', project: true } },
  gsi2sk: String,
  clinic: { type: String, required: true },
  name: { type: String, required: true },
  birthday: { type: String, required: true },
  guardian: { type: [Object, dynamooseType.NULL], schema: { name: { type: String, required: true }, phone_number: { type: String, required: true }, relationship: { type: String, required: true } } },
  phone_number: { type: [String, dynamooseType.NULL] },
  gender: { type: String, required: true, enum: [...GENDER] },
  educational_level: { type: String, required: true, enum: [...EDUCATIONAL_LEVEL] },
  occupation: { type: String, required: true },
  marital_status: { type: String, required: true, enum: [...MARITAL_STATUS] },
  partner_data: { type: [Object, dynamooseType.NULL], schema: { name: { type: String, required: true }, relationship_time: { type: String, required: true }, occupation: { type: String, required: true } } },
  religion: { type: String, required: true },
  address: { type: String, required: true },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
}, { timestamps: false })

export const PatientModel = model<PatientItem>('Patient', PatientSchema, { tableName: process.env.DYNAMO_TABLE_NAME! })

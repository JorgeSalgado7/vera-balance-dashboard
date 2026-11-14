import { Item } from 'dynamoose/dist/Item'
import { Schema, model } from 'dynamoose'

export class PatientTherapeuticProcessItem extends Item {
  pk!: string
  sk!: string
  created_at!: string
  updated_at!: string
}

const schema = new Schema({
  pk: { type: String, hashKey: true },
  sk: { type: String, rangeKey: true },
  created_at: { type: String, required: true },
  updated_at: { type: String, required: true },
}, { timestamps: false })

export const PatientTherapeuticProcessModel = model<PatientTherapeuticProcessItem>('PatientTherapeuticProcess', schema, { tableName: process.env.DYNAMO_TABLE_NAME! })

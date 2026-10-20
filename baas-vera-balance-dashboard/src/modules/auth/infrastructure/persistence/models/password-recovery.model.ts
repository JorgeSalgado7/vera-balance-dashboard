import { Schema, model } from 'dynamoose';

const PasswordRecoverySchema = new Schema({
  pk: { type: String, hashKey: true },
  sk: { type: String, rangeKey: true, enum: ['PASSWORD_RECOVERY'] },
  code_hash: { type: String, required: true },
  expires_at: { type: String, required: true },
  attempts: { type: Number, required: true },
  created_at: { type: String, required: true },
  ttl: { type: Number, required: true }
}, { timestamps: false, saveUnknown: false });

export const PasswordRecoveryModel = model('VeraBalancePasswordRecovery', PasswordRecoverySchema, {
  tableName: process.env.DYNAMO_TABLE_NAME!,
  create: false,
  update: false,
  waitForActive: false
});

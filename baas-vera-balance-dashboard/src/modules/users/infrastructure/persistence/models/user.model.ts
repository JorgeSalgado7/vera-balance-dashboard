import { Schema, model } from 'dynamoose';

const UserSchema = new Schema(
  {
    pk: {
      type: String,
      hashKey: true,
    },
    sk: {
      type: String,
      rangeKey: true,
      enum: ['USER'],
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    professional_license: {
      type: String,
      required: true,
    },
    clinic: {
      type: Object,
      required: true,
      schema: {
        pk: {
          type: String,
          required: true,
        },
        sk: {
          type: String,
          required: true,
          enum: ['CLINIC']
        }
      }
    },
    role: {
      type: String,
      required: true,
      enum: ['clinic', 'therapist'],
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive'],
    },
    created_at: {
      type: String,
      required: true,
    },
    updated_at: {
      type: String,
      required: true,
    },
  },
  { timestamps: false }
);

export const UserModel = model('User', UserSchema, {
  tableName: process.env.DYNAMO_TABLE_NAME!
});

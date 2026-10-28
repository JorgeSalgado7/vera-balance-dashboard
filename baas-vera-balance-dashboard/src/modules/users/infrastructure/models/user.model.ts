import { USER_ROLE_VALUES } from '../../../../constants/user-roles.constant'
import { Schema, model } from 'dynamoose'

const UserSchema = new Schema(
  {
    pk: {
      type: String,
      hashKey: true,
    },

    sk: {
      type: String,
      rangeKey: true,
    },

    gsi1pk: {
      type: String,
      index: {
        name: 'GSI1',
        rangeKey: 'gsi1sk',
        project: true,
      },
    },

    gsi1sk: {
      type: String,
    },

    gsi2pk: {
      type: String,
      index: {
        name: 'GSI2',
        rangeKey: 'gsi2sk',
        project: true,
      },
    },

    gsi2sk: {
      type: String,
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

    role: {
      type: String,
      required: true,
      enum: USER_ROLE_VALUES,
    },

    status: {
      type: String,
      required: true,
      enum: ['Activo', 'Inactivo'],
    },

    clinic: {
      type: String,
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
  {
    timestamps: false,
    saveUnknown: false,
  },
)

export const UserModel = model(process.env.DYNAMO_TABLE_NAME!, UserSchema, {
  create: false,
  update: false,
})

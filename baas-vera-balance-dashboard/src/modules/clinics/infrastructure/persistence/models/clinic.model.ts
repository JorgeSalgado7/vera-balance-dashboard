import { Schema, model, type } from 'dynamoose';

const TherapyTypeSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    }
  },
  {
    saveUnknown: false,
    timestamps: false
  }
);

const ClinicSchema = new Schema(
  {
    pk: {
      type: String,
      hashKey: true
    },
    sk: {
      type: String,
      rangeKey: true
    },
    name: {
      type: String,
      required: true
    },
    logo: {
      type: [
        String,
        type.NULL
      ],
      required: false
    },
    address: {
      type: String,
      required: true
    },
    phone_number: {
      type: String,
      required: true
    },
    therapy_types: {
      type: Array,
      schema: [
        {
          type: Object,
          schema: TherapyTypeSchema
        }
      ],
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: [
        'active',
        'inactive'
      ]
    },
    created_at: {
      type: String,
      required: true
    },
    updated_at: {
      type: String,
      required: true
    }
  },
  {
    timestamps: false
  }
);

export const ClinicModel = model(process.env.DYNAMO_TABLE_NAME!, ClinicSchema);
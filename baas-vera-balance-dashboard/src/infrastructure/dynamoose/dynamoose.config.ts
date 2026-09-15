import * as dynamoose from 'dynamoose';

const isLocal = process.env.NODE_ENV !== 'production';

if (isLocal) {
  dynamoose.aws.ddb.local(process.env.DYNAMO_ENDPOINT);
}

dynamoose.aws.ddb.set(
  new dynamoose.aws.ddb.DynamoDB({
    region: process.env.AWS_REGION ?? 'us-east-1',
    endpoint: isLocal ? process.env.DYNAMO_ENDPOINT : undefined,
  }),
);

export const dynamooseInstance = dynamoose;

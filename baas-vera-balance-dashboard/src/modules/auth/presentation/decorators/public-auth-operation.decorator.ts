import { SetMetadata } from '@nestjs/common';

export const PUBLIC_AUTH_OPERATION = Symbol('PublicAuthOperation');

export const PublicAuthOperation = () => SetMetadata(PUBLIC_AUTH_OPERATION, true);

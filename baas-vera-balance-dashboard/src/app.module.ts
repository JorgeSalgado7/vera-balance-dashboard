//* Nest
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

//* Infrastructure
import './infrastructure/dynamoose/dynamoose.config';

//* Modules
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthenticationModule } from '@nestjs/authentication';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
		AuthenticationModule.forRoot({
			accessToken: {
				key: process.env.JWT_ACCESS_SECRET!,
				issuer: 'vera-balance-dashboard',
				audience: 'vera-balance-dashboard',
				ttl: '15m',
			},
			refreshToken: false,
		}),
		UsersModule,
		AuthModule
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from './auth/auth.module';
import { User } from './models/user.model';
import { CollectRequestModule } from './collect-request/collect-request.module';
import { Request } from './models/request.model';
import { Subcription } from './models/subcriptions.model';
import { UserModule } from './user/user.module';
import { VkEventModule } from './vk-event/vk-event.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { claimRequest } from './models/request-claim.model';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 20,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'vkma-auth',
      models: [User, Request, Subcription, claimRequest],
      autoLoadModels: true,
      timezone: '+03:00',
      pool: {
        max: 5,
        min: 0,
        idle: 300000,
        acquire: 300000,
      },
      /* sync: { alter: true }, */
      /* dialectOptions:{
        ssl:{
            require: true,
            rejectUnauthorized: false,
        }
    } */
    }),
    AuthModule,
    CollectRequestModule,
    UserModule,
    VkEventModule,
  ],
})
export class AppModule {}

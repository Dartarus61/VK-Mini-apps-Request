import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from './auth/auth.module';
import { User } from './models/user.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'vkma-auth',
      models: [User],
      autoLoadModels: true,
      /* sync: { force: true }, */
      /* dialectOptions:{
        ssl:{
            require: true,
            rejectUnauthorized: false,
        }
    } */
    }),
    AuthModule,
  ],
})
export class AppModule {}

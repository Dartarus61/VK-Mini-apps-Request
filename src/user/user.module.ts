import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/models/user.model';
import { UserService } from './user.service';

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [SequelizeModule.forFeature([User])]
})
export class UserModule {}

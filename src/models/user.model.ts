import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({ tableName: 'User', timestamps: false, freezeTableName: true })
export class User extends Model<User> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: '5345123', description: 'VK user ID' })
  @Column({ type: DataType.INTEGER, unique: true })
  userId: number;
}

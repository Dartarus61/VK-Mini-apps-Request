import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Subcription } from './subcriptions.model';
import { User } from './user.model';

@Table({ tableName: 'Request', timestamps: true, freezeTableName: true })
export class Request extends Model<Request> {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: 'Сбор в университете в 15.00',
    description: 'Название заявки',
  })
  @Column({ type: DataType.STRING })
  title: string;

  @ApiProperty({ example: true, description: 'Активна ли ссылка' })
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  active: boolean;

  @ApiProperty({ example: '3546345_1', description: 'URI заявки' })
  @Column({ type: DataType.STRING, allowNull: true })
  uri: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsToMany(() => User, () => Subcription)
  ownersRequest: User[];
}

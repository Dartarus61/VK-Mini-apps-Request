import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Request } from './request.model';
import { User } from './user.model';

@Table({ tableName: 'ClaimRequest', timestamps: true, freezeTableName: true })
export class claimRequest extends Model<claimRequest> {
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

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Request)
  @Column
  requestId: number;

  @BelongsTo(() => Request)
  request: Request;
}

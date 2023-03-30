import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Request } from './request.model';
import { Subcription } from './subcriptions.model';

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

  @ApiProperty({example: true, description: "Флаг наличия премиума"})
  @Column({type: DataType.BOOLEAN, defaultValue: false})
  isPrem:boolean

  @ApiProperty({example: "15.12.2024", description: "Дата окончания премиума"})
  @Column({type: DataType.STRING, allowNull: true})
  expiredPrem: string

  @HasMany(() => Request)
  requests: Request[];

  @BelongsToMany(() => Request, () => Subcription)
  mySubcription: Request[];
}

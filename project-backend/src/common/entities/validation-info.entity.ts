import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ValidationType } from '../enums';

@Entity({ name: 'validation_info' })
export class ValidationInfo {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'integer',
  })
  id?: number;

  @Column({
    name: 'customer_id',
    type: 'varchar',
    nullable: false,
  })
  customerId: number;

  @Column({
    name: 'type',
    type: 'enum',
    nullable: false,
    default: ValidationType.EMAIL,
  })
  type: ValidationType;

  @Column({
    name: 'code',
    type: 'varchar',
    nullable: false,
  })
  code: string;

  @Column({
    name: 'expired_time',
    type: 'integer',
    nullable: false,
    default: 0,
  })
  expiredTime: number;

  @CreateDateColumn({
    name: 'create_time',
    type: 'timestamp',
  })
  createTime?: Date;

  @UpdateDateColumn({
    name: 'update_time',
    type: 'timestamp',
  })
  updateTime?: Date;
}

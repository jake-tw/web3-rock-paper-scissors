import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'customer' })
export class Customer {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'integer',
  })
  id?: number;

  @Column({
    name: 'wallet_address',
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  walletAddress: string;

  @Column({
    name: 'email',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  email: string;

  @Column({
    name: 'is_verify',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isVerify: boolean;

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

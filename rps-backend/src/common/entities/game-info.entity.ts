import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'game_info' })
export class GameInfo {
  @PrimaryColumn({
    name: 'id',
    type: 'integer',
  })
  id: number;

  @Column({
    name: 'banker',
    type: 'varchar',
    nullable: true,
  })
  banker: string;

  @Column({
    name: 'player',
    type: 'varchar',
    nullable: true,
  })
  player: string;

  @Column({
    name: 'banker_slat',
    type: 'varchar',
    nullable: true,
  })
  bankerSlat: string;

  @Column({
    name: 'player_slat',
    type: 'varchar',
    nullable: true,
  })
  playerSlat: string;

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

import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { CryptoModule } from 'src/crypto/crypto.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameInfo } from '../common/entities/game-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameInfo])],
  controllers: [GameController, CryptoModule],
  providers: [GameService],
})
export class GameModule {}

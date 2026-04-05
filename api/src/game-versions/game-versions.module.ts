import { Module } from '@nestjs/common';
import { GameVersionsController } from './game-versions.controller';
import { GameVersionsService } from './game-versions.service';

@Module({
  controllers: [GameVersionsController],
  providers: [GameVersionsService],
})
export class GameVersionsModule {}
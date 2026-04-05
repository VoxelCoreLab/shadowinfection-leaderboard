import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GameVersionsService } from './game-versions.service';

@ApiTags('Game Versions')
@Controller('game-versions')
export class GameVersionsController {
  constructor(private readonly gameVersionsService: GameVersionsService) {}

  @Get()
  @ApiOperation({ summary: 'List game versions with default latest version' })
  getGameVersions() {
    return this.gameVersionsService.getGameVersions();
  }
}
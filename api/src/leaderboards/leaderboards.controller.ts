import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeaderboardsService } from './leaderboards.service';
import { SeasonLeaderboardQueryDto } from './dto/season-leaderboard-query.dto';
import { SeasonPlayerCountLeaderboardQueryDto } from './dto/season-player-count-leaderboard-query.dto';
import { AllTimeLeaderboardQueryDto } from './dto/all-time-leaderboard-query.dto';
import { UserHistoryQueryDto } from './dto/user-history-query.dto';

@ApiTags('Leaderboards')
@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Get('season')
  @ApiOperation({ summary: 'Season leaderboard by mode and season' })
  getSeasonLeaderboard(@Query() query: SeasonLeaderboardQueryDto) {
    return this.leaderboardsService.getSeasonLeaderboard(query);
  }

  @Get('season/player-count')
  @ApiOperation({ summary: 'Season leaderboard filtered by player count' })
  getSeasonLeaderboardByPlayerCount(
    @Query() query: SeasonPlayerCountLeaderboardQueryDto,
  ) {
    return this.leaderboardsService.getSeasonLeaderboardByPlayerCount(query);
  }

  @Get('all-time')
  @ApiOperation({ summary: 'All-time leaderboard across seasons' })
  getAllTimeLeaderboard(@Query() query: AllTimeLeaderboardQueryDto) {
    return this.leaderboardsService.getAllTimeLeaderboard(query);
  }

  @Get('user-history')
  @ApiOperation({ summary: 'Run history leaderboard rows for one user' })
  getUserHistory(@Query() query: UserHistoryQueryDto) {
    return this.leaderboardsService.getUserHistory(query);
  }

  @Get('seasons')
  @ApiOperation({ summary: 'List all seasons for filters' })
  getSeasons() {
    return this.leaderboardsService.getSeasons();
  }

  @Get('game-modes')
  @ApiOperation({ summary: 'List all game modes for filters' })
  getGameModes() {
    return this.leaderboardsService.getGameModes();
  }
}

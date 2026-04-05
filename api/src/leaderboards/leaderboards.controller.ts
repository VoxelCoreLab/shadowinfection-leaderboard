import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeaderboardsService } from './leaderboards.service';
import { TopRunsQueryDto } from './dto/top-runs-query.dto';
import { UserRunsQueryDto } from './dto/user-runs-query.dto';

@ApiTags('Leaderboards')
@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Get()
  @ApiOperation({ summary: 'Top zombie runs filtered by game version' })
  getTopRuns(@Query() query: TopRunsQueryDto) {
    return this.leaderboardsService.getTopRuns(query);
  }

  @Get('users')
  @ApiOperation({ summary: 'All zombie runs for one username in a version' })
  getUserRuns(@Query() query: UserRunsQueryDto) {
    return this.leaderboardsService.getUserRuns(query);
  }

  @Get('versions')
  @ApiOperation({ summary: 'List all available game versions for filters' })
  getVersions() {
    return this.leaderboardsService.getVersions();
  }
}

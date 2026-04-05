import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { SeasonLeaderboardQueryDto } from './season-leaderboard-query.dto';

export class SeasonPlayerCountLeaderboardQueryDto extends SeasonLeaderboardQueryDto {
  @ApiProperty({ minimum: 1, maximum: 4, example: 4 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  playerCount: number;
}

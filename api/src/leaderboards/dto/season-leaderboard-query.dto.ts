import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class SeasonLeaderboardQueryDto extends PaginationQueryDto {
  @ApiProperty({ minimum: 1, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  gameModeId: number;

  @ApiProperty({ minimum: 1, example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  seasonId: number;
}

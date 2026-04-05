import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class TopRunsQueryDto extends PaginationQueryDto {
  @ApiProperty({ example: '1.4.2' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ required: false, minimum: 1, maximum: 5, example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  playerCount?: number;
}
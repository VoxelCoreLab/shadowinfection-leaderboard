import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class TopRunsQueryDto extends PaginationQueryDto {
  @ApiProperty({ example: '1.4.2' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  version: string;
}
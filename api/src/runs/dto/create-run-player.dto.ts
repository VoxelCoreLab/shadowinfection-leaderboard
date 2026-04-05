import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateRunPlayerDto {
  @ApiProperty({ example: 'PlayerOne', maxLength: 32 })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  nickname: string;

  @ApiProperty({ example: 12000, minimum: 0 })
  @IsInt()
  @Min(0)
  points: number;

  @ApiProperty({ example: 340, minimum: 0 })
  @IsInt()
  @Min(0)
  zombieKills: number;

  @ApiProperty({ example: 1800, minimum: 0 })
  @IsInt()
  @Min(0)
  goldCollected: number;

  @ApiProperty({ example: 2, minimum: 0 })
  @IsInt()
  @Min(0)
  deaths: number;
}

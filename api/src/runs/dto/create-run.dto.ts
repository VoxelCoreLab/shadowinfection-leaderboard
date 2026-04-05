import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateRunPlayerDto } from './create-run-player.dto';

export class CreateRunDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  gameModeId: number;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  seasonId: number;

  @ApiProperty({ example: 4, minimum: 1, maximum: 4 })
  @IsInt()
  @Min(1)
  playerCount: number;

  @ApiProperty({ example: 23, minimum: 0 })
  @IsInt()
  @Min(0)
  wavesSurvived: number;

  @ApiProperty({ example: 1520, minimum: 0, description: 'Duration in seconds' })
  @IsInt()
  @Min(0)
  duration: number;

  @ApiProperty({ example: 48000, minimum: 0 })
  @IsInt()
  @Min(0)
  totalPoints: number;

  @ApiProperty({ type: [CreateRunPlayerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => CreateRunPlayerDto)
  players: CreateRunPlayerDto[];
}

import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RunsService } from './runs.service';
import { CreateRunDto } from './dto/create-run.dto';

@ApiTags('Runs')
@Controller('runs')
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Post('zombie')
  @ApiOperation({ summary: 'Submit a zombie run from game client' })
  createZombieRun(@Body() dto: CreateRunDto) {
    return this.runsService.createZombieRun(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get run detail with full per-player stats' })
  getRunById(@Param('id', ParseIntPipe) id: number) {
    return this.runsService.getRunById(id);
  }
}

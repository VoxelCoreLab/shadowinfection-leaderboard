import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RunsService } from './runs.service';
import { CreateRunDto } from './dto/create-run.dto';

@ApiTags('Runs')
@Controller('runs')
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a run from game client' })
  createRun(@Body() dto: CreateRunDto) {
    return this.runsService.createRun(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get run detail with full per-player stats' })
  getRunById(@Param('id', ParseIntPipe) id: number) {
    return this.runsService.getRunById(id);
  }
}

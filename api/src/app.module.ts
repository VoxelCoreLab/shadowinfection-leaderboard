import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { PrismaModule } from './prisma/prisma.module';
import { RunsModule } from './runs/runs.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';
import { GameVersionsModule } from './game-versions/game-versions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      cache: true,
    }),
    PrismaModule,
    RunsModule,
    LeaderboardsModule,
    GameVersionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

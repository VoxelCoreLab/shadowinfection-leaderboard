import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { PrismaModule } from './prisma/prisma.module';
import { RunsModule } from './runs/runs.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

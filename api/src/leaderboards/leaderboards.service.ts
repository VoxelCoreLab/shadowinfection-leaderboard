import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AllTimeLeaderboardQueryDto } from './dto/all-time-leaderboard-query.dto';
import { SeasonPlayerCountLeaderboardQueryDto } from './dto/season-player-count-leaderboard-query.dto';
import { SeasonLeaderboardQueryDto } from './dto/season-leaderboard-query.dto';
import { UserHistoryQueryDto } from './dto/user-history-query.dto';

@Injectable()
export class LeaderboardsService {
  private readonly defaultLimit = 50;

  constructor(private readonly prisma: PrismaService) {}

  async getSeasonLeaderboard(query: SeasonLeaderboardQueryDto) {
    const { limit, offset } = this.resolvePagination(query.limit, query.offset);

    const where = {
      gameModeId: query.gameModeId,
      seasonId: query.seasonId,
    };

    const [total, rows] = await Promise.all([
      this.prisma.run.count({ where }),
      this.prisma.run.findMany({
        where,
        include: {
          gameMode: true,
          season: true,
          runPlayers: { include: { user: true } },
        },
        orderBy: [
          { wavesSurvived: 'desc' },
          { duration: 'desc' },
          { totalPoints: 'desc' },
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
        skip: offset,
        take: limit,
      }),
    ]);

    return {
      total,
      limit,
      offset,
      rows: this.mapRows(rows, offset),
    };
  }

  async getSeasonLeaderboardByPlayerCount(
    query: SeasonPlayerCountLeaderboardQueryDto,
  ) {
    const { limit, offset } = this.resolvePagination(query.limit, query.offset);

    const where = {
      gameModeId: query.gameModeId,
      seasonId: query.seasonId,
      playerCount: query.playerCount,
    };

    const [total, rows] = await Promise.all([
      this.prisma.run.count({ where }),
      this.prisma.run.findMany({
        where,
        include: {
          gameMode: true,
          season: true,
          runPlayers: { include: { user: true } },
        },
        orderBy: [
          { wavesSurvived: 'desc' },
          { duration: 'desc' },
          { totalPoints: 'desc' },
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
        skip: offset,
        take: limit,
      }),
    ]);

    return {
      total,
      limit,
      offset,
      rows: this.mapRows(rows, offset),
    };
  }

  async getAllTimeLeaderboard(query: AllTimeLeaderboardQueryDto) {
    const { limit, offset } = this.resolvePagination(query.limit, query.offset);
    const where = query.gameModeId ? { gameModeId: query.gameModeId } : {};

    const [total, rows] = await Promise.all([
      this.prisma.run.count({ where }),
      this.prisma.run.findMany({
        where,
        include: {
          gameMode: true,
          season: true,
          runPlayers: { include: { user: true } },
        },
        orderBy: [
          { wavesSurvived: 'desc' },
          { duration: 'desc' },
          { totalPoints: 'desc' },
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
        skip: offset,
        take: limit,
      }),
    ]);

    return {
      total,
      limit,
      offset,
      rows: this.mapRows(rows, offset),
    };
  }

  async getUserHistory(query: UserHistoryQueryDto) {
    const { limit, offset } = this.resolvePagination(query.limit, query.offset);
    const user = await this.prisma.user.findUnique({
      where: { nickname: query.nickname },
    });

    if (!user) {
      return {
        nickname: query.nickname,
        total: 0,
        limit,
        offset,
        rows: [],
      };
    }

    const where = {
      runPlayers: {
        some: {
          userId: user.id,
        },
      },
      ...(query.gameModeId ? { gameModeId: query.gameModeId } : {}),
      ...(query.seasonId ? { seasonId: query.seasonId } : {}),
    };

    const [total, rows] = await Promise.all([
      this.prisma.run.count({ where }),
      this.prisma.run.findMany({
        where,
        include: {
          gameMode: true,
          season: true,
          runPlayers: { include: { user: true } },
        },
        orderBy: [
          { wavesSurvived: 'desc' },
          { duration: 'desc' },
          { totalPoints: 'desc' },
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
        skip: offset,
        take: limit,
      }),
    ]);

    return {
      nickname: query.nickname,
      total,
      limit,
      offset,
      rows: this.mapRows(rows, offset),
    };
  }

  getSeasons() {
    return this.prisma.season.findMany({
      orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }],
    });
  }

  getGameModes() {
    return this.prisma.gameMode.findMany({
      orderBy: { name: 'asc' },
    });
  }

  private resolvePagination(limit?: number, offset?: number) {
    return {
      limit: limit ?? this.defaultLimit,
      offset: offset ?? 0,
    };
  }

  private mapRows(
    rows: Array<{
      id: number;
      gameModeId: number;
      seasonId: number;
      playerCount: number;
      wavesSurvived: number;
      duration: number;
      totalPoints: number;
      createdAt: Date;
      gameMode: { id: number; name: string };
      season: { id: number; version: string };
      runPlayers: Array<{ user: { nickname: string } | null }>;
    }>,
    offset: number,
  ) {
    return rows.map((row, index) => ({
      rank: offset + index + 1,
      runId: row.id,
      gameMode: {
        id: row.gameMode.id,
        name: row.gameMode.name,
      },
      season: {
        id: row.season.id,
        version: row.season.version,
      },
      playerCount: row.playerCount,
      wavesSurvived: row.wavesSurvived,
      duration: row.duration,
      totalPoints: row.totalPoints,
      createdAt: row.createdAt,
      players: row.runPlayers
        .map((player) => player.user?.nickname)
        .filter((nickname): nickname is string => Boolean(nickname)),
    }));
  }
}

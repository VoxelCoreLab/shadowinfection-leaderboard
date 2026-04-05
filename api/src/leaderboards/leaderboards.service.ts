import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TopRunsQueryDto } from './dto/top-runs-query.dto';
import { UserRunsQueryDto } from './dto/user-runs-query.dto';

@Injectable()
export class LeaderboardsService {
  private readonly defaultLimit = 50;
  private readonly zombieGameModeName = 'Zombie';

  constructor(private readonly prisma: PrismaService) {}

  async getTopRuns(query: TopRunsQueryDto) {
    const { limit, offset } = this.resolvePagination(query.limit, query.offset);

    const where = {
      gameMode: { name: this.zombieGameModeName },
      season: { version: query.version },
      ...(query.playerCount ? { playerCount: query.playerCount } : {}),
    };

    const [total, rows] = await Promise.all([
      this.prisma.run.count({ where }),
      this.prisma.run.findMany({
        where,
        include: {
          season: true,
          runPlayers: {
            include: { user: true },
            orderBy: [{ points: 'desc' }, { id: 'asc' }],
          },
        },
        orderBy: [
          { wavesSurvived: 'desc' },
          { duration: 'asc' },
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

  async getUserRuns(query: UserRunsQueryDto) {
    const { limit, offset } = this.resolvePagination(query.limit, query.offset);

    const user = await this.prisma.user.findFirst({
      where: {
        nickname: {
          equals: query.username,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      return {
        username: query.username,
        total: 0,
        limit,
        offset,
        rows: [],
      };
    }

    const where = {
      gameMode: { name: this.zombieGameModeName },
      season: { version: query.version },
      ...(query.playerCount ? { playerCount: query.playerCount } : {}),
      runPlayers: {
        some: {
          userId: user.id,
        },
      },
    };

    const [total, rows] = await Promise.all([
      this.prisma.run.count({ where }),
      this.prisma.run.findMany({
        where,
        include: {
          season: true,
          runPlayers: {
            include: { user: true },
            orderBy: [{ points: 'desc' }, { id: 'asc' }],
          },
        },
        orderBy: [
          { wavesSurvived: 'desc' },
          { duration: 'asc' },
          { totalPoints: 'desc' },
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
        skip: offset,
        take: limit,
      }),
    ]);

    return {
      username: user.nickname,
      total,
      limit,
      offset,
      rows: this.mapRows(rows, offset, user.id),
    };
  }

  async getVersions() {
    const seasons = await this.prisma.season.findMany({
      select: {
        version: true,
        isActive: true,
        startDate: true,
        endDate: true,
      },
      orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }, { id: 'desc' }],
    });

    const versions = new Map<
      string,
      {
        version: string;
        isActive: boolean;
        startDate: Date;
        endDate: Date;
      }
    >();

    for (const season of seasons) {
      if (!versions.has(season.version)) {
        versions.set(season.version, season);
      }
    }

    return [...versions.values()];
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
      playerCount: number;
      wavesSurvived: number;
      duration: number;
      totalPoints: number;
      createdAt: Date;
      season: { id: number; version: string };
      runPlayers: Array<{
        userId: number | null;
        points: number;
        zombieKills: number;
        goldCollected: number;
        deaths: number;
        user: { nickname: string } | null;
      }>;
    }>,
    offset: number,
    matchedUserId?: number,
  ) {
    return rows.map((row, index) => {
      const matchedPlayer =
        matchedUserId === undefined
          ? undefined
          : row.runPlayers.find((player) => player.userId === matchedUserId) ??
            null;

      return {
        rank: offset + index + 1,
        runId: row.id,
        version: row.season.version,
        playerCount: row.playerCount,
        wavesSurvived: row.wavesSurvived,
        duration: row.duration,
        totalPoints: row.totalPoints,
        createdAt: row.createdAt,
        players: row.runPlayers.map((player) => ({
          nickname: player.user?.nickname ?? null,
          points: player.points,
          zombieKills: player.zombieKills,
          goldCollected: player.goldCollected,
          deaths: player.deaths,
        })),
        matchedPlayer:
          matchedPlayer === undefined
            ? undefined
            : matchedPlayer
              ? {
                  nickname: matchedPlayer.user?.nickname ?? null,
                  points: matchedPlayer.points,
                  zombieKills: matchedPlayer.zombieKills,
                  goldCollected: matchedPlayer.goldCollected,
                  deaths: matchedPlayer.deaths,
                }
              : null,
      };
    });
  }
}

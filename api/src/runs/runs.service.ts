import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRunDto } from './dto/create-run.dto';

@Injectable()
export class RunsService {
  private readonly zombieGameModeName = 'Zombie';

  constructor(private readonly prisma: PrismaService) {}

  async createZombieRun(dto: CreateRunDto) {
    if (dto.playerCount !== dto.players.length) {
      throw new BadRequestException(
        'playerCount must match the number of players in payload',
      );
    }

    if (dto.playerCount > 4) {
      throw new BadRequestException('playerCount must be between 1 and 4');
    }

    const normalizedNicknames = dto.players.map((player) =>
      player.nickname.trim().toLowerCase(),
    );
    if (new Set(normalizedNicknames).size !== normalizedNicknames.length) {
      throw new BadRequestException(
        'Each player nickname must be unique within a run',
      );
    }

    const [gameMode, season] = await Promise.all([
      this.prisma.gameMode.findUnique({
        where: { name: this.zombieGameModeName },
      }),
      this.prisma.season.findFirst({
        where: { version: dto.version },
        orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }, { id: 'desc' }],
      }),
    ]);

    if (!gameMode) {
      throw new NotFoundException('Zombie game mode not found');
    }

    if (!season) {
      throw new NotFoundException(
        `No season found for version ${dto.version}`,
      );
    }

    const created = await this.prisma.run.create({
      data: {
        gameModeId: gameMode.id,
        seasonId: season.id,
        playerCount: dto.playerCount,
        wavesSurvived: dto.wavesSurvived,
        duration: dto.duration,
        totalPoints: dto.totalPoints,
        runPlayers: {
          create: dto.players.map((player) => ({
            points: player.points,
            zombieKills: player.zombieKills,
            goldCollected: player.goldCollected,
            deaths: player.deaths,
            user: {
              connectOrCreate: {
                where: { nickname: player.nickname },
                create: { nickname: player.nickname },
              },
            },
          })),
        },
      },
    });

    return {
      id: created.id,
      gameMode: gameMode.name,
      version: season.version,
      playerCount: created.playerCount,
      wavesSurvived: created.wavesSurvived,
      duration: created.duration,
      totalPoints: created.totalPoints,
      createdAt: created.createdAt,
    };
  }

  async getRunById(id: number) {
    const run = await this.prisma.run.findUnique({
      where: { id },
      include: {
        gameMode: true,
        season: true,
        runPlayers: {
          include: {
            user: true,
          },
          orderBy: { points: 'desc' },
        },
      },
    });

    if (!run) {
      throw new NotFoundException('Run not found');
    }

    return {
      id: run.id,
      gameMode: {
        id: run.gameMode.id,
        name: run.gameMode.name,
      },
      season: {
        id: run.season.id,
        version: run.season.version,
        startDate: run.season.startDate,
        endDate: run.season.endDate,
        isActive: run.season.isActive,
      },
      playerCount: run.playerCount,
      wavesSurvived: run.wavesSurvived,
      duration: run.duration,
      totalPoints: run.totalPoints,
      createdAt: run.createdAt,
      players: run.runPlayers.map((player) => ({
        nickname: player.user?.nickname ?? null,
        points: player.points,
        zombieKills: player.zombieKills,
        goldCollected: player.goldCollected,
        deaths: player.deaths,
      })),
    };
  }
}

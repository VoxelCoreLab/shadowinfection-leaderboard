import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type VersionRow = {
  version: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
};

@Injectable()
export class GameVersionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGameVersions() {
    const seasons = await this.prisma.season.findMany({
      select: {
        version: true,
        isActive: true,
        startDate: true,
        endDate: true,
      },
      orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }, { id: 'desc' }],
    });

    const versions = new Map<string, VersionRow>();

    for (const season of seasons) {
      if (!versions.has(season.version)) {
        versions.set(season.version, season);
      }
    }

    const entries = [...versions.values()];

    return {
      defaultVersion: entries[0]?.version ?? null,
      versions: entries,
    };
  }
}
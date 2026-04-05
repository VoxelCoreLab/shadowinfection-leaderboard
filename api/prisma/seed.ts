import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) throw new Error('DATABASE_URL is not defined');

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // --- Game Modes ---
  const zombieMode = await prisma.gameMode.upsert({
    where: { name: 'Zombie' },
    update: {},
    create: { name: 'Zombie' },
  });

  const survivalMode = await prisma.gameMode.upsert({
    where: { name: 'Survival' },
    update: {},
    create: { name: 'Survival' },
  });

  // --- Season ---
  const now = new Date('2026-04-05T00:00:00Z');
  const seasonStart = new Date('2026-04-01T00:00:00Z');
  const seasonEnd = new Date('2026-04-30T23:59:59Z');

  const season = await prisma.season.upsert({
    where: { version_startDate_endDate: { version: '1.4.2', startDate: seasonStart, endDate: seasonEnd } },
    update: {},
    create: {
      version: '1.4.2',
      startDate: seasonStart,
      endDate: seasonEnd,
      description: 'April 2026 Season',
      isActive: true,
    },
  });

  // --- Users ---
  const userNames = ['ShadowHunter', 'ZombieSlayer99', 'NightCrawler', 'DarkReaper', 'VoidWalker', 'BloodMoon', 'CrypticGhost', 'IronFortress'];
  const users = await Promise.all(
    userNames.map((nickname) =>
      prisma.user.upsert({
        where: { nickname },
        update: {},
        create: { nickname },
      }),
    ),
  );

  const [u1, u2, u3, u4, u5, u6, u7, u8] = users;

  // --- Runs ---
  // Solo runs
  const soloRuns = [
    { wavesSurvived: 42, duration: 1820, totalPoints: 8400, player: u1, points: 8400, zombieKills: 310, goldCollected: 520, deaths: 1 },
    { wavesSurvived: 38, duration: 1650, totalPoints: 7200, player: u2, points: 7200, zombieKills: 278, goldCollected: 480, deaths: 2 },
    { wavesSurvived: 35, duration: 1540, totalPoints: 6800, player: u3, points: 6800, zombieKills: 251, goldCollected: 440, deaths: 3 },
    { wavesSurvived: 30, duration: 1320, totalPoints: 5900, player: u4, points: 5900, zombieKills: 220, goldCollected: 390, deaths: 2 },
    { wavesSurvived: 25, duration: 1100, totalPoints: 4800, player: u5, points: 4800, zombieKills: 185, goldCollected: 330, deaths: 4 },
  ];

  for (const r of soloRuns) {
    const run = await prisma.run.create({
      data: {
        gameModeId: zombieMode.id,
        seasonId: season.id,
        playerCount: 1,
        wavesSurvived: r.wavesSurvived,
        duration: r.duration,
        totalPoints: r.totalPoints,
        createdAt: new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.runPlayer.create({
      data: { runId: run.id, userId: r.player.id, points: r.points, zombieKills: r.zombieKills, goldCollected: r.goldCollected, deaths: r.deaths },
    });
  }

  // Duo runs
  const duoRuns = [
    {
      wavesSurvived: 55, duration: 2400, totalPoints: 18500,
      players: [
        { user: u1, points: 9800, zombieKills: 360, goldCollected: 600, deaths: 1 },
        { user: u2, points: 8700, zombieKills: 320, goldCollected: 560, deaths: 2 },
      ],
    },
    {
      wavesSurvived: 50, duration: 2200, totalPoints: 16200,
      players: [
        { user: u3, points: 8200, zombieKills: 300, goldCollected: 520, deaths: 2 },
        { user: u4, points: 8000, zombieKills: 290, goldCollected: 500, deaths: 3 },
      ],
    },
    {
      wavesSurvived: 44, duration: 1950, totalPoints: 14100,
      players: [
        { user: u5, points: 7300, zombieKills: 270, goldCollected: 460, deaths: 3 },
        { user: u6, points: 6800, zombieKills: 250, goldCollected: 430, deaths: 2 },
      ],
    },
  ];

  for (const r of duoRuns) {
    const run = await prisma.run.create({
      data: {
        gameModeId: zombieMode.id,
        seasonId: season.id,
        playerCount: 2,
        wavesSurvived: r.wavesSurvived,
        duration: r.duration,
        totalPoints: r.totalPoints,
        createdAt: new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000),
      },
    });
    for (const p of r.players) {
      await prisma.runPlayer.create({
        data: { runId: run.id, userId: p.user.id, points: p.points, zombieKills: p.zombieKills, goldCollected: p.goldCollected, deaths: p.deaths },
      });
    }
  }

  // Quad run
  const quadRun = await prisma.run.create({
    data: {
      gameModeId: zombieMode.id,
      seasonId: season.id,
      playerCount: 4,
      wavesSurvived: 72,
      duration: 3100,
      totalPoints: 42000,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
  });
  const quadPlayers = [
    { user: u1, points: 11500, zombieKills: 420, goldCollected: 700, deaths: 0 },
    { user: u2, points: 10800, zombieKills: 395, goldCollected: 660, deaths: 1 },
    { user: u3, points: 10200, zombieKills: 375, goldCollected: 640, deaths: 1 },
    { user: u4, points: 9500, zombieKills: 350, goldCollected: 610, deaths: 2 },
  ];
  for (const p of quadPlayers) {
    await prisma.runPlayer.create({
      data: { runId: quadRun.id, userId: p.user.id, points: p.points, zombieKills: p.zombieKills, goldCollected: p.goldCollected, deaths: p.deaths },
    });
  }

  // Survival mode solo run
  const survivalRun = await prisma.run.create({
    data: {
      gameModeId: survivalMode.id,
      seasonId: season.id,
      playerCount: 1,
      wavesSurvived: 60,
      duration: 2700,
      totalPoints: 15000,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.runPlayer.create({
    data: { runId: survivalRun.id, userId: u7.id, points: 15000, zombieKills: 540, goldCollected: 810, deaths: 0 },
  });

  // --- PlayerSeasonStats ---
  // Aggregated stats per user/season/mode for leaderboard
  const statsEntries = [
    { user: u1, gameMode: zombieMode, category: null, totalPoints: 29700, totalZombieKills: 1090, totalGoldCollected: 1820, totalDeaths: 2, runsPlayed: 3, bestWaves: 72 },
    { user: u2, gameMode: zombieMode, category: null, totalPoints: 26700, totalZombieKills: 993, totalGoldCollected: 1700, totalDeaths: 5, runsPlayed: 3, bestWaves: 55 },
    { user: u3, gameMode: zombieMode, category: null, totalPoints: 25200, totalZombieKills: 926, totalGoldCollected: 1600, totalDeaths: 6, runsPlayed: 3, bestWaves: 50 },
    { user: u4, gameMode: zombieMode, category: null, totalPoints: 23400, totalZombieKills: 860, totalGoldCollected: 1500, totalDeaths: 7, runsPlayed: 3, bestWaves: 44 },
    { user: u5, gameMode: zombieMode, category: null, totalPoints: 12100, totalZombieKills: 455, totalGoldCollected: 790, totalDeaths: 7, runsPlayed: 2, bestWaves: 44 },
    { user: u6, gameMode: zombieMode, category: null, totalPoints: 6800, totalZombieKills: 250, goldCollected: 430, totalDeaths: 2, runsPlayed: 1, bestWaves: 44 },
    { user: u7, gameMode: survivalMode, category: null, totalPoints: 15000, totalZombieKills: 540, totalGoldCollected: 810, totalDeaths: 0, runsPlayed: 1, bestWaves: 60 },
    { user: u8, gameMode: zombieMode, category: null, totalPoints: 0, totalZombieKills: 0, totalGoldCollected: 0, totalDeaths: 0, runsPlayed: 0, bestWaves: 0 },
  ];

  for (const s of statsEntries) {
    const existing = await prisma.playerSeasonStats.findFirst({
      where: {
        seasonId: season.id,
        userId: s.user.id,
        gameModeId: s.gameMode.id,
        playerCountCategory: s.category,
      },
    });
    if (!existing) {
      await prisma.playerSeasonStats.create({
        data: {
          seasonId: season.id,
          userId: s.user.id,
          gameModeId: s.gameMode.id,
          playerCountCategory: s.category,
          totalPoints: s.totalPoints,
          totalZombieKills: s.totalZombieKills,
          totalGoldCollected: (s as any).totalGoldCollected ?? (s as any).goldCollected ?? 0,
          totalDeaths: s.totalDeaths,
          runsPlayed: s.runsPlayed,
          bestWaves: s.bestWaves,
        },
      });
    }
  }

  console.log('Seed complete.');
  console.log(`  Game modes: ${zombieMode.name}, ${survivalMode.name}`);
  console.log(`  Season: ${season.description}`);
  console.log(`  Users: ${userNames.join(', ')}`);
  console.log(`  Runs: ${soloRuns.length} solo, ${duoRuns.length} duo, 1 quad, 1 survival`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

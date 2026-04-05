-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_modes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "game_modes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" SERIAL NOT NULL,
    "version" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runs" (
    "id" SERIAL NOT NULL,
    "gameModeId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "playerCount" INTEGER NOT NULL,
    "wavesSurvived" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run_players" (
    "id" SERIAL NOT NULL,
    "runId" INTEGER NOT NULL,
    "userId" INTEGER,
    "points" INTEGER NOT NULL,
    "zombieKills" INTEGER NOT NULL,
    "goldCollected" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,

    CONSTRAINT "run_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_season_stats" (
    "id" SERIAL NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "userId" INTEGER,
    "gameModeId" INTEGER NOT NULL,
    "playerCountCategory" INTEGER,
    "totalPoints" INTEGER NOT NULL,
    "totalZombieKills" INTEGER NOT NULL,
    "totalGoldCollected" INTEGER NOT NULL,
    "totalDeaths" INTEGER NOT NULL,
    "runsPlayed" INTEGER NOT NULL,
    "bestWaves" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_season_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "game_modes_name_key" ON "game_modes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_version_startDate_endDate_key" ON "seasons"("version", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "runs_gameModeId_seasonId_playerCount_idx" ON "runs"("gameModeId", "seasonId", "playerCount");

-- CreateIndex
CREATE INDEX "runs_seasonId_gameModeId_wavesSurvived_duration_createdAt_idx" ON "runs"("seasonId", "gameModeId", "wavesSurvived" DESC, "duration" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "player_season_stats_seasonId_gameModeId_totalPoints_idx" ON "player_season_stats"("seasonId", "gameModeId", "totalPoints" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "player_season_stats_seasonId_userId_gameModeId_playerCountC_key" ON "player_season_stats"("seasonId", "userId", "gameModeId", "playerCountCategory");

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_gameModeId_fkey" FOREIGN KEY ("gameModeId") REFERENCES "game_modes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_players" ADD CONSTRAINT "run_players_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_players" ADD CONSTRAINT "run_players_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_season_stats" ADD CONSTRAINT "player_season_stats_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_season_stats" ADD CONSTRAINT "player_season_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_season_stats" ADD CONSTRAINT "player_season_stats_gameModeId_fkey" FOREIGN KEY ("gameModeId") REFERENCES "game_modes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

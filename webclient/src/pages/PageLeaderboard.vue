<template>
    <main class="min-h-screen bg-[var(--color-base-100)] px-4 py-8 text-[var(--color-base-content)] md:px-8">
        <section class="mx-auto max-w-6xl space-y-6">
            <header class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 class="text-3xl font-bold tracking-tight">Shadow Infection Leaderboards</h1>
                </div>
            </header>

            <section class="grid gap-4 border-[var(--border)] border-[var(--color-base-300)] bg-[var(--color-base-200)]/90 p-4 md:grid-cols-2 lg:grid-cols-4">
                <label class="flex flex-col gap-1 text-sm">
                    View
                    <select v-model="view" class="border-[var(--border)] border-[var(--color-base-300)] bg-[var(--color-base-100)] px-3 py-2">
                        <option value="season">Season</option>
                        <option value="season-player-count">Season + Player Count</option>
                        <option value="all-time">All Time</option>
                        <option value="user-history">User History</option>
                    </select>
                </label>

                <label class="flex flex-col gap-1 text-sm">
                    Game Mode
                    <select v-model.number="selectedGameModeId" class="border-[var(--border)] border-[var(--color-base-300)] bg-[var(--color-base-100)] px-3 py-2">
                        <option v-for="mode in gameModes" :key="mode.id" :value="mode.id">{{ mode.name }}</option>
                    </select>
                </label>

                <label class="flex flex-col gap-1 text-sm" v-if="view !== 'all-time'">
                    Season
                    <select v-model.number="selectedSeasonId" class="border-[var(--border)] border-[var(--color-base-300)] bg-[var(--color-base-100)] px-3 py-2">
                        <option v-for="season in seasons" :key="season.id" :value="season.id">
                            v{{ season.version }} {{ season.isActive ? '(active)' : '' }}
                        </option>
                    </select>
                </label>

                <label class="flex flex-col gap-1 text-sm" v-if="view === 'season-player-count'">
                    Player Count
                    <select v-model.number="playerCount" class="border-[var(--border)] border-[var(--color-base-300)] bg-[var(--color-base-100)] px-3 py-2">
                        <option :value="1">1</option>
                        <option :value="2">2</option>
                        <option :value="3">3</option>
                        <option :value="4">4</option>
                    </select>
                </label>

                <label class="flex flex-col gap-1 text-sm" v-if="view === 'user-history'">
                    Nickname
                    <input
                        v-model="nickname"
                        type="text"
                        placeholder="PlayerOne"
                        class="border-[var(--border)] border-[var(--color-base-300)] bg-[var(--color-base-100)] px-3 py-2"
                    />
                </label>

                <button
                    type="button"
                    class="border-[var(--border)] border-[var(--color-accent)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-content)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-content)] cursor-pointer"
                    @click="loadLeaderboard"
                >
                    Refresh
                </button>
            </section>

            <section class="border-[var(--border)] border-[var(--color-base-300)] bg-[var(--color-base-200)]/90 p-4">
                <div class="mb-3 text-sm text-[var(--color-primary)]">
                    Showing {{ rows.length }} rows (total: {{ totalRows }})
                </div>

                <div v-if="isLoading" class="text-sm text-[var(--color-info)]">Loading leaderboard...</div>
                <div v-else-if="errorMessage" class="border-[var(--border)] border-[var(--color-error)] bg-[var(--color-error)] p-3 text-sm text-[var(--color-error-content)]">
                    {{ errorMessage }}
                </div>
                <div v-else class="overflow-x-auto">
                    <table class="min-w-full text-left text-sm">
                        <thead>
                            <tr class="border-b border-[var(--color-base-300)] text-[var(--color-primary)]">
                                <th class="px-2 py-2">#</th>
                                <th class="px-2 py-2">Run ID</th>
                                <th class="px-2 py-2">Mode</th>
                                <th class="px-2 py-2">Season</th>
                                <th class="px-2 py-2">Players</th>
                                <th class="px-2 py-2">Waves</th>
                                <th class="px-2 py-2">Duration</th>
                                <th class="px-2 py-2">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in rows" :key="row.runId" class="border-b border-[var(--color-base-300)]/60 hover:bg-[var(--color-base-300)]/45">
                                <td class="px-2 py-2">{{ row.rank }}</td>
                                <td class="px-2 py-2">{{ row.runId }}</td>
                                <td class="px-2 py-2">{{ row.gameMode?.name ?? '-' }}</td>
                                <td class="px-2 py-2">{{ row.season?.version ?? '-' }}</td>
                                <td class="px-2 py-2">{{ row.players?.join(', ') ?? '-' }}</td>
                                <td class="px-2 py-2">{{ row.wavesSurvived }}</td>
                                <td class="px-2 py-2">{{ formatDuration(row.duration) }}</td>
                                <td class="px-2 py-2">{{ row.totalPoints }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </section>
    </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { api } from '../lib/api'

type LeaderboardView = 'season' | 'season-player-count' | 'all-time' | 'user-history'

type LeaderboardRow = {
    rank: number
    runId: number
    gameMode?: { id: number; name: string }
    season?: { id: number; version: string }
    players?: string[]
    wavesSurvived: number
    duration: number
    totalPoints: number
}

const allowedViews: LeaderboardView[] = [
    'season',
    'season-player-count',
    'all-time',
    'user-history',
]

const viewQuery = useRouteQuery<string>('view', 'season')
const gameModeIdQuery = useRouteQuery<string>('gameModeId', '1')
const seasonIdQuery = useRouteQuery<string>('seasonId', '1')
const playerCountQuery = useRouteQuery<string>('playerCount', '1')
const nicknameQuery = useRouteQuery<string>('nickname', '')

function toQueryString(value: string | string[] | null | undefined): string {
    if (Array.isArray(value)) {
        return value[0] ?? ''
    }

    return value ?? ''
}

function parseIntInRange(
    value: string | string[] | null | undefined,
    fallback: number,
    min: number,
    max?: number,
): number {
    const parsed = Number(toQueryString(value))

    if (!Number.isInteger(parsed)) {
        return fallback
    }

    if (parsed < min) {
        return fallback
    }

    if (typeof max === 'number' && parsed > max) {
        return fallback
    }

    return parsed
}

const view = computed<LeaderboardView>({
    get() {
        const candidate = toQueryString(viewQuery.value)

        if (allowedViews.includes(candidate as LeaderboardView)) {
            return candidate as LeaderboardView
        }

        return 'season'
    },
    set(value) {
        viewQuery.value = value
    },
})

const selectedGameModeId = computed<number>({
    get() {
        return parseIntInRange(gameModeIdQuery.value, 1, 1)
    },
    set(value) {
        gameModeIdQuery.value = String(value)
    },
})

const selectedSeasonId = computed<number>({
    get() {
        return parseIntInRange(seasonIdQuery.value, 1, 1)
    },
    set(value) {
        seasonIdQuery.value = String(value)
    },
})

const playerCount = computed<number>({
    get() {
        return parseIntInRange(playerCountQuery.value, 1, 1, 4)
    },
    set(value) {
        playerCountQuery.value = String(value)
    },
})

const nickname = computed<string>({
    get() {
        return toQueryString(nicknameQuery.value)
    },
    set(value) {
        nicknameQuery.value = value
    },
})

const gameModes = ref<Array<{ id: number; name: string }>>([])
const seasons = ref<Array<{ id: number; version: string; isActive: boolean }>>([])

const rows = ref<LeaderboardRow[]>([])
const totalRows = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')

function formatDuration(durationInSeconds: number): string {
    const minutes = Math.floor(durationInSeconds / 60)
    const seconds = durationInSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

async function loadFilters() {
    const [gameModesResponse, seasonsResponse] = await Promise.all([
        api.leaderboards.leaderboardsControllerGetGameModes(),
        api.leaderboards.leaderboardsControllerGetSeasons(),
    ])

    gameModes.value =
        (gameModesResponse.data as unknown as Array<{ id: number; name: string }>) ?? []
    seasons.value =
        (seasonsResponse.data as unknown as Array<{ id: number; version: string; isActive: boolean }>) ?? []

    if (gameModes.value.length > 0 && !gameModes.value.some((mode) => mode.id === selectedGameModeId.value)) {
        selectedGameModeId.value = gameModes.value[0].id
    }

    const activeSeason = seasons.value.find((season) => season.isActive)
    if (activeSeason) {
        selectedSeasonId.value = activeSeason.id
    } else if (seasons.value.length > 0) {
        selectedSeasonId.value = seasons.value[0].id
    }
}

async function loadLeaderboard() {
    isLoading.value = true
    errorMessage.value = ''

    try {
        let response

        if (view.value === 'season') {
            response = await api.leaderboards.leaderboardsControllerGetSeasonLeaderboard({
                gameModeId: selectedGameModeId.value,
                seasonId: selectedSeasonId.value,
                limit: 50,
                offset: 0,
            })
        } else if (view.value === 'season-player-count') {
            response = await api.leaderboards.leaderboardsControllerGetSeasonLeaderboardByPlayerCount({
                gameModeId: selectedGameModeId.value,
                seasonId: selectedSeasonId.value,
                playerCount: playerCount.value,
                limit: 50,
                offset: 0,
            })
        } else if (view.value === 'all-time') {
            response = await api.leaderboards.leaderboardsControllerGetAllTimeLeaderboard({
                gameModeId: selectedGameModeId.value,
                limit: 50,
                offset: 0,
            })
        } else {
            const trimmed = nickname.value.trim()
            if (!trimmed) {
                throw new Error('Please enter a nickname to load user history.')
            }

            response = await api.leaderboards.leaderboardsControllerGetUserHistory({
                nickname: trimmed,
                gameModeId: selectedGameModeId.value,
                seasonId: selectedSeasonId.value,
                limit: 50,
                offset: 0,
            })
        }

        const payload = (response?.data ?? {}) as { total?: number; rows?: LeaderboardRow[] }
        rows.value = payload.rows ?? []
        totalRows.value = payload.total ?? rows.value.length
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Failed to load leaderboard.'
        errorMessage.value = message
        rows.value = []
        totalRows.value = 0
    } finally {
        isLoading.value = false
    }
}

onMounted(async () => {
    try {
        await loadFilters()
        await loadLeaderboard()
    } catch {
        errorMessage.value = 'Failed to initialize leaderboard filters.'
    }
})
</script>

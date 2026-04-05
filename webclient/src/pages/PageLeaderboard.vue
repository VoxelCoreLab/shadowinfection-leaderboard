<template>
    <main class="min-h-screen bg-(--color-base-100) px-4 py-8 text-(--color-base-content) md:px-8">
        <section class="mx-auto max-w-6xl space-y-6">
            <header class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <p class="text-sm uppercase tracking-[0.2em] text-(--color-primary)">Zombie Leaderboards</p>
                    <h1 class="text-3xl font-bold tracking-tight">Version-based runs only</h1>
                </div>
            </header>

            <section class="grid gap-4 border border-(--color-base-300) bg-(--color-base-200)/90 p-4 md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_auto]">
                <label class="flex flex-col gap-1 text-sm">
                    View
                    <select v-model="view" class="border border-(--color-base-300) bg-(--color-base-100) px-3 py-2">
                        <option value="top-runs">Top runs</option>
                        <option value="user-runs">User runs</option>
                    </select>
                </label>

                <label class="flex flex-col gap-1 text-sm">
                    Game version
                    <select
                        v-model="version"
                        class="border border-(--color-base-300) bg-(--color-base-100) px-3 py-2"
                    >
                        <option value="" disabled>Select a version</option>
                        <option v-for="entry in versions" :key="entry.version" :value="entry.version">
                            {{ entry.version }}
                        </option>
                    </select>
                </label>

                <label v-if="view === 'user-runs'" class="flex flex-col gap-1 text-sm">
                    Username
                    <input
                        v-model="username"
                        type="text"
                        placeholder="PlayerOne"
                        class="border border-(--color-base-300) bg-(--color-base-100) px-3 py-2"
                    />
                </label>

                <button
                    type="button"
                    class="cursor-pointer self-end border border-(--color-accent) bg-(--color-primary) px-4 py-2 text-sm font-semibold text-(--color-primary-content) hover:bg-(--color-accent) hover:text-(--color-accent-content)"
                    @click="loadLeaderboard"
                >
                    Refresh
                </button>
            </section>

            <section class="border border-(--color-base-300) bg-(--color-base-200)/90 p-4">
                <div class="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span class="text-(--color-primary)">Showing {{ rows.length }} rows (total: {{ totalRows }})</span>
                    <span v-if="selectedVersionMeta" class="text-(--color-base-content)/70">
                        {{ selectedVersionMeta.isActive ? 'Active version' : 'Archived version' }}
                    </span>
                </div>

                <div v-if="isLoading" class="text-sm text-(--color-info)">Loading leaderboard...</div>
                <div v-else-if="errorMessage" class="border border-(--color-error) bg-(--color-error) p-3 text-sm text-(--color-error-content)">
                    {{ errorMessage }}
                </div>
                <div v-else class="overflow-x-auto">
                    <table class="min-w-full text-left text-sm">
                        <thead>
                            <tr class="border-b border-(--color-base-300) text-(--color-primary)">
                                <th class="px-2 py-2">#</th>
                                <th class="px-2 py-2">Run ID</th>
                                <th class="px-2 py-2">Version</th>
                                <th class="px-2 py-2">Players</th>
                                <th v-if="view === 'user-runs'" class="px-2 py-2">Matched player</th>
                                <th class="px-2 py-2">Waves</th>
                                <th class="px-2 py-2">Duration</th>
                                <th class="px-2 py-2">Points</th>
                                <th class="px-2 py-2">Submitted</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in rows" :key="row.runId" class="border-b border-(--color-base-300)/60 align-top hover:bg-(--color-base-300)/45">
                                <td class="px-2 py-2">{{ row.rank }}</td>
                                <td class="px-2 py-2">{{ row.runId }}</td>
                                <td class="px-2 py-2">{{ row.version }}</td>
                                <td class="px-2 py-2">
                                    <div class="flex flex-col gap-1">
                                        <span v-for="player in row.players" :key="`${row.runId}-${player.nickname}-${player.points}`">
                                            {{ formatPlayer(player) }}
                                        </span>
                                    </div>
                                </td>
                                <td v-if="view === 'user-runs'" class="px-2 py-2">
                                    <span v-if="row.matchedPlayer">{{ formatMatchedPlayer(row.matchedPlayer) }}</span>
                                    <span v-else>-</span>
                                </td>
                                <td class="px-2 py-2">{{ row.wavesSurvived }}</td>
                                <td class="px-2 py-2">{{ formatDuration(row.duration) }}</td>
                                <td class="px-2 py-2">{{ row.totalPoints }}</td>
                                <td class="px-2 py-2">{{ formatDate(row.createdAt) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </section>
    </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { api } from '../lib/api'

type LeaderboardView = 'top-runs' | 'user-runs'

type VersionEntry = {
    version: string
    isActive: boolean
    startDate: string
    endDate: string
}

type GameVersionsResponse = {
    defaultVersion: string | null
    versions: VersionEntry[]
}

type LeaderboardsVersionsResponse = VersionEntry[]

type PlayerRow = {
    nickname: string | null
    points: number
    zombieKills: number
    goldCollected: number
    deaths: number
}

type LeaderboardRow = {
    rank: number
    runId: number
    version: string
    playerCount: number
    wavesSurvived: number
    duration: number
    totalPoints: number
    createdAt: string
    players: PlayerRow[]
    matchedPlayer?: PlayerRow | null
}

type LeaderboardResponse = {
    total?: number
    rows?: LeaderboardRow[]
}

const allowedViews: LeaderboardView[] = ['top-runs', 'user-runs']

const viewQuery = useRouteQuery<string>('view', 'top-runs')
const versionQuery = useRouteQuery<string>('version', '')
const usernameQuery = useRouteQuery<string>('username', '')

function toQueryString(value: string | string[] | null | undefined): string {
    if (Array.isArray(value)) {
        return value[0] ?? ''
    }

    return value ?? ''
}

const view = computed<LeaderboardView>({
    get() {
        const candidate = toQueryString(viewQuery.value)

        if (allowedViews.includes(candidate as LeaderboardView)) {
            return candidate as LeaderboardView
        }

        return 'top-runs'
    },
    set(value) {
        viewQuery.value = value
    },
})

const version = computed<string>({
    get() {
        return toQueryString(versionQuery.value)
    },
    set(value) {
        versionQuery.value = value
    },
})

const username = computed<string>({
    get() {
        return toQueryString(usernameQuery.value)
    },
    set(value) {
        usernameQuery.value = value
    },
})

const versions = ref<VersionEntry[]>([])
const rows = ref<LeaderboardRow[]>([])
const totalRows = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')
const isReadyForAutoRefresh = ref(false)
const autoRefreshTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)

const selectedVersionMeta = computed(() =>
    versions.value.find((entry) => entry.version === version.value.trim()) ?? null,
)

function formatDuration(durationInSeconds: number): string {
    const minutes = Math.floor(durationInSeconds / 60)
    const seconds = durationInSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatDate(value: string): string {
    return new Date(value).toLocaleString()
}

function formatPlayer(player: PlayerRow): string {
    const nickname = player.nickname ?? 'Unknown'
    return `${nickname} (${player.points} pts)`
}

function formatMatchedPlayer(player: PlayerRow): string {
    const nickname = player.nickname ?? 'Unknown'
    return `${nickname}: ${player.points} pts, ${player.zombieKills} kills, ${player.goldCollected} gold, ${player.deaths} deaths`
}

async function loadVersions() {
    const response = await api.leaderboards.leaderboardsControllerGetVersions()

    const data = response.data

    if (Array.isArray(data)) {
        const payload = (data ?? []) as LeaderboardsVersionsResponse
        versions.value = payload

        if (!version.value.trim() && versions.value.length > 0) {
            version.value = versions.value[0].version
        }

        return
    }

    const payload = (data ?? {
        defaultVersion: null,
        versions: [],
    }) as GameVersionsResponse

    versions.value = payload.versions ?? []

    if (payload.defaultVersion) {
        version.value = payload.defaultVersion
        return
    }

    if (!version.value.trim() && versions.value.length > 0) {
        version.value = versions.value[0].version
    }
}

async function loadLeaderboard() {
    const trimmedVersion = version.value.trim()
    const trimmedUsername = username.value.trim()

    if (!trimmedVersion) {
        errorMessage.value = 'Please select a game version.'
        rows.value = []
        totalRows.value = 0
        return
    }

    if (view.value === 'user-runs' && !trimmedUsername) {
        errorMessage.value = 'Please enter a username.'
        rows.value = []
        totalRows.value = 0
        return
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
        const response = view.value === 'top-runs'
            ? await api.leaderboards.leaderboardsControllerGetTopRuns({
                    version: trimmedVersion,
                    limit: 50,
                    offset: 0,
            })
            : await api.leaderboards.leaderboardsControllerGetUserRuns({
                    version: trimmedVersion,
                    username: trimmedUsername,
                    limit: 50,
                    offset: 0,
            })

        const payload = (response.data ?? {}) as LeaderboardResponse
        rows.value = payload.rows ?? []
        totalRows.value = payload.total ?? rows.value.length
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load leaderboard.'
        errorMessage.value = message
        rows.value = []
        totalRows.value = 0
    } finally {
        isLoading.value = false
    }
}

onMounted(async () => {
    try {
        await loadVersions()
        isReadyForAutoRefresh.value = true
        await loadLeaderboard()
    } catch {
        errorMessage.value = 'Failed to initialize leaderboard.'
    }
})

onBeforeUnmount(() => {
    if (autoRefreshTimeoutId.value) {
        clearTimeout(autoRefreshTimeoutId.value)
    }
})

watch([view, version, username], () => {
    if (!isReadyForAutoRefresh.value) {
        return
    }

    if (autoRefreshTimeoutId.value) {
        clearTimeout(autoRefreshTimeoutId.value)
    }

    autoRefreshTimeoutId.value = setTimeout(() => {
        void loadLeaderboard()
    }, 250)
})
</script>

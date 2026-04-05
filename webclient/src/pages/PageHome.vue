<template>
    <main class="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
        <section class="mx-auto max-w-3xl space-y-4">
            <h1 class="text-4xl font-bold tracking-tight">Shadow Infection</h1>
            <p class="text-slate-400">Leaderboard admin and spectator web client.</p>
            <RouterLink
                to="/leaderboard"
                class="inline-block rounded-md bg-cyan-500 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-400"
            >
                Open Leaderboards
            </RouterLink>
        </section>
    </main>
</template>
<script lang="ts" setup>
import { RouterLink } from 'vue-router'
</script>
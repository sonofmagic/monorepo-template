<script setup lang="ts">
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { helloKeys } from '@/query-keys'
import { client } from '@/trpc'

type HelloResponse = Awaited<ReturnType<typeof client.hello.query>>

const { t, locale } = useI18n()
function changeLocale(lang: 'en' | 'zh') {
  locale.value = lang
}

function toggleLocale() {
  changeLocale(locale.value === 'en' ? 'zh' : 'en')
}

function formatTime(timestamp?: number) {
  if (!timestamp) {
    return '-'
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(timestamp))
}

const queryClient = useQueryClient()
const helloName = 'icebreakers' as const

const helloQuery = useQuery<HelloResponse>({
  queryKey: helloKeys.detail(helloName),
  queryFn: () => client.hello.query(helloName),
  staleTime: 30_000,
  gcTime: 5 * 60_000,
})

const liveData = computed(() => ({
  message: helloQuery.data.value?.message ?? '-',
  time: helloQuery.data.value?.time ?? null,
  formattedTime: formatTime(helloQuery.data.value?.time),
}))

const cachedHello = computed<HelloResponse | undefined>(() => {
  const cached = queryClient.getQueryData<HelloResponse>(
    helloKeys.detail(helloName),
  )
  return helloQuery.data.value ?? cached
})

const queryMeta = computed(() => ({
  status: helloQuery.status.value,
  fetchStatus: helloQuery.fetchStatus.value,
  isFetching: helloQuery.isFetching.value,
  isStale: helloQuery.isStale.value,
  dataUpdatedAt: helloQuery.dataUpdatedAt.value,
}))

const helloErrorMessage = computed(() => {
  const error = helloQuery.error.value
  if (!error) {
    return ''
  }
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-50">
    <div class="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-8">
      <header
        class="
          rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 p-6 shadow-xl
          ring-1 ring-white/5
        "
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-2">
            <p class="text-xs tracking-[0.2em] text-slate-400 uppercase">
              TanStack Query + i18n
            </p>
            <h1 class="text-3xl leading-tight font-semibold">
              {{ t('hello') }}
            </h1>
            <p class="text-sm text-slate-400">
              Minimal data-fetch demo. Everything stays on screen for quick checks.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button
              class="
                rounded-full bg-white/15 px-4 py-2 text-sm font-medium
                text-slate-50 shadow-sm transition
                hover:scale-[1.02] hover:bg-white/25
              "
              @click="toggleLocale"
            >
              {{ t('toggleLocale') }}
            </button>
            <button
              class="
                rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-semibold
                text-emerald-950 shadow-sm transition
                hover:scale-[1.02] hover:bg-emerald-400
                disabled:opacity-60
              "
              :disabled="helloQuery.isFetching.value"
              @click="helloQuery.refetch()"
            >
              {{ helloQuery.isFetching ? 'Refreshing…' : 'Refetch now' }}
            </button>
          </div>
        </div>
        <div
          class="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300"
        >
          <span
            class="
              inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3
              py-1 font-semibold text-emerald-200 ring-1 ring-emerald-500/30
            "
          >
            <span class="size-2 rounded-full bg-emerald-400" />
            Live data connected
          </span>
          <span
            class="
              rounded-full bg-white/5 px-3 py-1 font-semibold text-white/80
              ring-1 ring-white/10
            "
          >
            Status: {{ helloQuery.status }}
          </span>
          <span
            v-if="helloQuery.isFetching"
            class="
              rounded-full bg-amber-500/15 px-3 py-1 font-semibold
              text-amber-200 ring-1 ring-amber-500/30
            "
          >
            Fetching…
          </span>
        </div>
      </header>

      <div
        class="
          grid gap-4
          md:grid-cols-2
        "
      >
        <section
          class="rounded-2xl bg-slate-900/70 p-5 shadow-lg ring-1 ring-white/5"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">
                Live data
              </h2>
              <p class="text-xs text-slate-400">
                Latest response from the server
              </p>
            </div>
            <span
              class="
                rounded-full bg-white/10 px-3 py-1 text-xs font-semibold
                text-white/90 ring-1 ring-white/10
              "
            >
              {{ helloQuery.fetchStatus }}
            </span>
          </div>
          <dl
            class="
              mt-4 grid gap-3
              sm:grid-cols-2
            "
          >
            <div
              class="
                rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-100 ring-1
                ring-white/10
              "
            >
              <dt class="text-xs tracking-wide text-slate-400 uppercase">
                Message
              </dt>
              <dd class="mt-1 font-semibold">
                {{ liveData.message }}
              </dd>
            </div>
            <div
              class="
                rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-100 ring-1
                ring-white/10
              "
            >
              <dt class="text-xs tracking-wide text-slate-400 uppercase">
                Server time
              </dt>
              <dd class="mt-1 font-semibold">
                {{ liveData.formattedTime }}
              </dd>
            </div>
          </dl>
          <pre
            class="
              mt-4 max-h-48 overflow-auto rounded-lg bg-black/40 p-3 text-left
              text-xs leading-relaxed text-slate-100 ring-1 ring-white/10
            "
          >{{ JSON.stringify(liveData, null, 2) }}</pre>
          <p v-if="helloErrorMessage" class="mt-3 text-sm text-rose-200">
            {{ helloErrorMessage }}
          </p>
        </section>

        <section
          class="rounded-2xl bg-slate-900/70 p-5 shadow-lg ring-1 ring-white/5"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">
                Cache snapshot
              </h2>
              <p class="text-xs text-slate-400">
                Result from getQueryData
              </p>
            </div>
            <span
              class="
                rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold
                text-emerald-100 ring-1 ring-emerald-500/30
              "
            >
              {{ cachedHello ? 'Cached' : 'Empty' }}
            </span>
          </div>
          <div
            class="
              mt-3 rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-100 ring-1
              ring-white/10
            "
          >
            <p class="text-xs tracking-wide text-slate-400 uppercase">
              Time
            </p>
            <p class="mt-1 font-semibold">
              {{ formatTime(cachedHello?.time) }}
            </p>
          </div>
          <pre
            class="
              mt-4 max-h-48 overflow-auto rounded-lg bg-black/40 p-3 text-left
              text-xs leading-relaxed text-slate-100 ring-1 ring-white/10
            "
          >{{ JSON.stringify(cachedHello ?? '-', null, 2) }}</pre>
        </section>

        <section
          class="
            rounded-2xl bg-slate-900/70 p-5 shadow-lg ring-1 ring-white/5
            md:col-span-2
          "
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">
                Query meta
              </h2>
              <p class="text-xs text-slate-400">
                What TanStack Query is tracking
              </p>
            </div>
            <span
              class="
                rounded-full bg-white/10 px-3 py-1 text-xs font-semibold
                text-white/80 ring-1 ring-white/10
              "
            >
              Updated: {{ formatTime(queryMeta.dataUpdatedAt) }}
            </span>
          </div>
          <div
            class="
              mt-4 grid gap-3
              sm:grid-cols-4
            "
          >
            <div
              class="
                rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-100 ring-1
                ring-white/10
              "
            >
              <p class="text-slate-400">
                Status
              </p>
              <p class="mt-1 font-semibold">
                {{ queryMeta.status }}
              </p>
            </div>
            <div
              class="
                rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-100 ring-1
                ring-white/10
              "
            >
              <p class="text-slate-400">
                Fetch
              </p>
              <p class="mt-1 font-semibold">
                {{ queryMeta.fetchStatus }}
              </p>
            </div>
            <div
              class="
                rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-100 ring-1
                ring-white/10
              "
            >
              <p class="text-slate-400">
                Fetching?
              </p>
              <p class="mt-1 font-semibold">
                {{ queryMeta.isFetching ? 'Yes' : 'No' }}
              </p>
            </div>
            <div
              class="
                rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-100 ring-1
                ring-white/10
              "
            >
              <p class="text-slate-400">
                Stale?
              </p>
              <p class="mt-1 font-semibold">
                {{ queryMeta.isStale ? 'Yes' : 'No' }}
              </p>
            </div>
          </div>
          <pre
            class="
              mt-4 max-h-48 overflow-auto rounded-lg bg-black/40 p-3 text-left
              text-xs leading-relaxed text-slate-100 ring-1 ring-white/10
            "
          >{{ JSON.stringify(queryMeta, null, 2) }}</pre>
        </section>
      </div>
    </div>
  </div>
</template>

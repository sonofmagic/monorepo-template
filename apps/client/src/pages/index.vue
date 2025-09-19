<script setup lang="tsx">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { client } from '../trpc'

const { t, locale } = useI18n()
function changeLocale(lang: 'en' | 'zh') {
  locale.value = lang
}

function toggleLocale() {
  changeLocale(locale.value === 'en' ? 'zh' : 'en')
}

const fetchData = ref<any>()

async function getFetchData() {
  const result = await client.hello.query('icebreakers')
  fetchData.value = result
}

onMounted(() => {
  getFetchData()
  client.sayHello.query({ name: '2' })
  // init()
})
</script>

<template>
  <div>
    <div
      class="
        flex min-h-screen items-center justify-center bg-black bg-gradient-to-br
        p-4
      "
    >
      <div
        class="
          space-y-6 rounded-2xl bg-white/20 p-8 text-center backdrop-blur-md
        "
      >
        <h1 class="animate-pulse text-4xl font-semibold text-white">
          {{ t('hello') }}
        </h1>
        <button
          class="
            transform rounded-full bg-white/30 px-5 py-2 text-white
            backdrop-blur-sm transition
            hover:scale-105
          "
          @click="toggleLocale"
        >
          <div>{{ t('toggleLocale') }}</div>
        </button>

        <div class="rounded border border-white p-2">
          <pre class="text-left text-white">
{{ fetchData }}
        </pre>
          <button class="rounded bg-white/30 px-5 py-2 text-white" @click="getFetchData">
            refetch
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

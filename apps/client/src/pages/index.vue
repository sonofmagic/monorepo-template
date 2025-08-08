<script setup lang="ts">
import { HelloWorld } from '@icebreakers/vue-lib-template'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

function changeLocale(lang: 'en' | 'zh') {
  locale.value = lang
}

function toggleLocale() {
  changeLocale(locale.value === 'en' ? 'zh' : 'en')
}
</script>

<template>
  <div>
    <div class="bg-black min-h-screen flex items-center justify-center bg-gradient-to-br from-iosGradientStart to-iosGradientEnd p-4">
      <div class="backdrop-blur-md bg-white/20 rounded-2xl p-8 max-w-sm text-center space-y-6">
        <h1 class="text-4xl font-semibold text-white font-ios animate-pulse">
          {{ t('hello') }}
        </h1>
        <button
          class="px-5 py-2 bg-white/30 backdrop-blur-sm text-white rounded-full transition transform hover:scale-105"
          @click="toggleLocale"
        >
          <HelloWorld :msg="t('hello')" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

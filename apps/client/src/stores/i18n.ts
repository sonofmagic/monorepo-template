import { defineStore } from 'pinia'

import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      hello: 'Hello World',
      toggleLocale: 'toggle locale',
    },
    zh: {
      hello: '你好世界',
      toggleLocale: '切换语言',
    },
  },
})

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    i18n,
  }),
})

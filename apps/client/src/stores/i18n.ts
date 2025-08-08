import { defineStore } from 'pinia'

import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      hello: 'Hello World',
    },
    zh: {
      hello: '你好世界',
    },
  },
})

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    i18n,
  }),
})

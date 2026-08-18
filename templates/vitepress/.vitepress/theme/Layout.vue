<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { computed } from 'vue'

const { Layout } = DefaultTheme
const { lang } = useData()
const notFoundTitle = computed(() => lang.value === 'zh-CN' ? '页面不存在' : 'Page not found')
const notFoundBody = computed(() => lang.value === 'zh-CN'
  ? '这个地址不属于新的文档结构。请从开始、任务或参考章节继续。'
  : 'This address is not part of the new documentation structure. Continue with Start, Tasks, or Reference.')
</script>

<template>
  <Layout>
    <template #not-found>
      <main class="repoctl-not-found">
        <p class="repoctl-not-found__code">
          404
        </p>
        <h1>{{ notFoundTitle }}</h1>
        <p>{{ notFoundBody }}</p>
        <a href="/start/">{{ lang === 'zh-CN' ? '返回开始' : 'Back to Start' }}</a>
      </main>
    </template>
  </Layout>
</template>

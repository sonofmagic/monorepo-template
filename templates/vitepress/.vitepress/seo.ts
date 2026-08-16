import type { HeadConfig, TransformContext } from 'vitepress'

export const siteOrigin = 'https://repoctl.icebreaker.top'

function routeFromPage(page: string) {
  const withoutExtension = page.replace(/\.md$/, '')
  if (withoutExtension === 'index') {
    return '/'
  }
  if (withoutExtension.endsWith('/index')) {
    return `/${withoutExtension.slice(0, -6)}`
  }
  return `/${withoutExtension}`
}

function localeRoutes(page: string) {
  const sourcePage = page.startsWith('zh/') ? page.slice(3) : page
  const english = routeFromPage(sourcePage)
  const chinese = routeFromPage(`zh/${sourcePage}`)
  return { english, chinese }
}

export function createPageHead({ page, title, description }: TransformContext): HeadConfig[] {
  const { english, chinese } = localeRoutes(page)
  const current = page.startsWith('zh/') ? chinese : english
  const canonical = `${siteOrigin}${current}`

  return [
    ['link', { rel: 'canonical', href: canonical }],
    ['link', { rel: 'alternate', hreflang: 'en', href: `${siteOrigin}${english}` }],
    ['link', { rel: 'alternate', hreflang: 'zh-CN', href: `${siteOrigin}${chinese}` }],
    ['link', { rel: 'alternate', hreflang: 'x-default', href: `${siteOrigin}${english}` }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'repoctl' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: canonical }],
    ['meta', { property: 'og:locale', content: page.startsWith('zh/') ? 'zh_CN' : 'en_US' }],
  ]
}

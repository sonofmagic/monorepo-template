import { isSeq, parseDocument } from 'yaml'

/**
 * 将 Issue 模版里的 discussions 链接同步为当前仓库的 discussions 地址。
 */
export function updateIssueTemplateConfig(source: string, repoName?: string) {
  if (!repoName) {
    return source
  }

  let doc
  try {
    doc = parseDocument(source)
  }
  catch {
    return source
  }

  const contactLinks = doc.get('contact_links')
  if (!isSeq(contactLinks)) {
    return source
  }

  const nextUrl = `https://github.com/${repoName}/discussions`
  let changed = false

  contactLinks.items.forEach((_, index) => {
    const url = doc.getIn(['contact_links', index, 'url'])
    if (typeof url !== 'string') {
      return
    }
    if (!url.includes('/discussions')) {
      return
    }
    if (url === nextUrl) {
      return
    }

    doc.setIn(['contact_links', index, 'url'], nextUrl)
    changed = true
  })

  if (!changed) {
    return source
  }

  return doc.toString()
}

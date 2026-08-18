export interface HomeLink {
  label: string
  href: string
}

export interface HomeContent {
  hero: {
    label: string
    title: string
    description: string
  }
  tasks: {
    title: string
    description: string
    items: Array<{
      title: string
      body: string
      command: string
      link: HomeLink
    }>
  }
  firstRun: {
    title: string
    description: string
    steps: Array<{
      title: string
      command: string
      body: string
    }>
  }
  evidence: {
    title: string
    description: string
    imageAlt: string
    code: string
    link: HomeLink
  }
  layers: {
    title: string
    description: string
    items: Array<{
      title: string
      body: string
      link: HomeLink
    }>
  }
}

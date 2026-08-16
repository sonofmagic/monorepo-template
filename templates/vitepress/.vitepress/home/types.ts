export interface HomeLink {
  label: string
  href: string
}

export interface HomeStep {
  title: string
  body: string
  command: string
}

export interface HomeContent {
  hero: {
    label: string
    title: string
    description: string
    primary: HomeLink
    secondary: HomeLink
    imageAlt: string
  }
  proof: string[]
  lifecycle: {
    title: string
    description: string
    steps: HomeStep[]
  }
  paths: {
    title: string
    description: string
    items: Array<{
      title: string
      body: string
      commands: string[]
      href: string
      linkLabel: string
    }>
  }
  capabilities: {
    title: string
    description: string
    items: Array<{ title: string, body: string }>
  }
  commands: {
    title: string
    description: string
    items: Array<{ command: string, purpose: string }>
  }
  automation: {
    title: string
    description: string
    formats: string[]
    code: string
  }
  quickstart: {
    title: string
    description: string
    code: string
    link: HomeLink
  }
  docs: {
    title: string
    description: string
    items: Array<HomeLink & { body: string }>
  }
}

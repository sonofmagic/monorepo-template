export type TemplateCategory = 'app' | 'docs' | 'library' | 'service' | 'tool'

export interface TemplateChoice {
  key: string
  label: string
  source: string
  target: string
  description?: string
  category?: TemplateCategory
}

export interface TemplateDefinition {
  source: string
  target: string
}

export interface GetTemplateChoicesOptions {
  category?: TemplateCategory
}

export interface SuggestTemplateKeyOptions extends GetTemplateChoicesOptions {
  keys?: readonly string[]
}

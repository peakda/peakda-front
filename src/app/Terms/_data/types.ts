export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; indented?: boolean }
  | { type: 'table'; caption: string; headers: string[]; rows: string[][] }
  | { type: 'subsection'; title: string; blocks: ContentBlock[] }

export interface LegalSection {
  id: string
  title: string
  blocks: ContentBlock[]
}

export interface LegalChapter {
  title: string
  sections: LegalSection[]
}

export interface LegalDocument {
  title: string
  effectiveDate?: string
  note?: string
  bottomNote?: string
  chapters?: LegalChapter[]
  sections?: LegalSection[]
  addendum?: string
}

export type LegalSlug =
  | 'terms-of-service'
  | 'privacy-policy'
  | 'marketing-push-consent'
  | 'location-policy'

export interface BrokenLink {
  url: string
  status: number
}

export interface URLInfo {
  id: string
  url: string
  title: string
  html_version: string
  internal_links: number
  external_links: number
  has_login_form: boolean
  status: string
  headings: Record<string, number>
  broken_links: BrokenLink[]
}

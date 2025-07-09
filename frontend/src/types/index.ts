export interface BrokenLink {
  url: string
  status: number
}

export interface URLInfo {
  id: string;
  url: string;
  status: string;
  title?: string;
  html_version?: string;
  headings?: Record<string, number>;
  internal_links: number;
  external_links: number;
  accessible_links: number; // 👈 New field
  broken_links: { url: string; status: number }[];
  has_login_form: boolean;
}

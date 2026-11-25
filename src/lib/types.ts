export type Agent = {
  id: string;
  name: string;
  description: string;
  cover: string | null;
  url: string;
  tags: string[];
  category: string;
  sort_order: number;
  published: boolean;
  click_count: number;
  created_at: string;
  updated_at: string;
};

export type AgentInput = {
  name: string;
  description?: string;
  cover?: string | null;
  url: string;
  tags?: string[];
  category?: string;
  sort_order?: number;
  published?: boolean;
};

export type Settings = {
  site_name: string;
  public_url_prefix: string;
  announcement: string;
};

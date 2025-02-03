export interface Attribute {
  name: string;
  description: string;
}

export interface DiffusionDatabase {
  id: number;
  name: string;
  documentation_url: string;
  publisher: string;
  licence: string;
  tags: string[];
  description: string;
  image_url: string;
  is_featured: boolean;
  featured_summary: string;
  attributes: Attribute[];
  display_order: number;
}

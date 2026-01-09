import { Point } from 'geojson';

export type ReportStatus = 'pending' | 'fixed' | 'rejected';

export interface ReportAuthor {
  display_name: string;
  id: number | null;
  username: string | null;
}

export interface ReportMessage {
  id: number;
  text: string;
  created_at: string;
  author: ReportAuthor;
}

export interface Report {
  id: number;
  point: Point;
  rnb_id: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  messages: ReportMessage[];
  author: ReportAuthor;
  tags: string[];
  feve?: Feve;
}

export interface Feve {
  dpt_code: string;
  dpt_name: string;
}

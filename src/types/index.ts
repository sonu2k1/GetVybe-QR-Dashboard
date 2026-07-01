export type HuntStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED';

export interface Hunt {
  id: string;
  name: string;
  status: HuntStatus;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  qr_codes_count?: number; // joined helper field
}

export interface CluePayload {
  title: string;
  text: string;
  imageUrl?: string;
}

export interface QrCode {
  id: string;
  hunt_id: string;
  code: string;
  label: string;
  sequence_order: number | null;
  points: number;
  clue_payload: CluePayload;
  location_lat: number | null;
  location_lng: number | null;
  max_scans: number | null;
  scan_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ScanResult = 'SUCCESS' | 'DUPLICATE' | 'EXPIRED' | 'INVALID';

export interface Scan {
  id: string;
  qr_id: string;
  user_id: string;
  scanned_at: string;
  result: ScanResult;
  device_meta: Record<string, any> | null;
}

export interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  scan_count: number;
}

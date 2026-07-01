export interface QrCode {
  id: string;
  hunt_id: string;
  code: string;
  label: string;
  sequence_order: number | null;
  points: number;
  clue_payload: {
    title: string;
    text: string;
    imageUrl?: string;
  };
  location_lat: number | null;
  location_lng: number | null;
  max_scans: number | null;
  scan_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GenerateQRResponse {
  success: boolean;
  qr: QrCode;
  qrImageBase64: string;
}

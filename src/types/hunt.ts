import { Hunt } from './index';
import { QrCode } from './qr';

export interface CreateHuntResponse {
  success: boolean;
  hunt: Hunt;
  defaultQr: QrCode;
  qrImageBase64: string;
  qrError?: boolean;
}

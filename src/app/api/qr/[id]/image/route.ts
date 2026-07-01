import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { createServerClient } from '@/lib/supabase';

// GET /api/qr/[id]/image - Fetches qr_code row by id -> rebuilds scan URL -> returns QR image base64
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const qrId = params.id;
    const supabase = createServerClient();

    // Fetch the QR code record from Supabase
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('code')
      .eq('id', qrId)
      .single();

    if (error || !qrCode) {
      return NextResponse.json(
        { error: 'Checkpoint QR code not found' },
        { status: 404 }
      );
    }

    // Build scan URL
    const scanBaseUrl = process.env.NEXT_PUBLIC_SCAN_BASE_URL || 'http://localhost:3000/scan';
    const scanUrl = `${scanBaseUrl}/${qrCode.code}`;

    // Regenerate QR base64 data URL
    const qrImageBase64 = await QRCode.toDataURL(scanUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    return NextResponse.json({ qrImageBase64 });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred regenerating QR image' },
      { status: 500 }
    );
  }
}

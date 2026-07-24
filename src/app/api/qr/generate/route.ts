import { NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';
import QRCode from 'qrcode';
import { createServerClient } from '@/lib/supabase';

const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const body = await req.json();

    const {
      huntId,
      label,
      points = 10,
      sequenceOrder,
      maxScans,
      cluePayload = {},
      locationLat,
      locationLng,
    } = body;

    // Validation
    if (!huntId || !label) {
      return NextResponse.json(
        { error: 'huntId and label are required fields' },
        { status: 400 }
      );
    }

    // Generate unique code with up to 3 retries (4 attempts total)
    let code = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 4) {
      code = generateCode();
      const { data, error } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('code', code);

      if (!error && (!data || data.length === 0)) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Could not generate a unique code after multiple retries' },
        { status: 409 }
      );
    }

    // Build scan URL
    const scanBaseUrl = process.env.NEXT_PUBLIC_SCAN_BASE_URL || 'http://localhost:3000/scan';
    const scanUrl = `${scanBaseUrl}/${code}`;

    // Generate QR code as Base64 Data URL PNG
    const qrImageBase64 = await QRCode.toDataURL(scanUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    // Insert checkpoint row into Supabase
    const { data: newQrCode, error: insertError } = await supabase
      .from('qr_codes')
      .insert([
        {
          hunt_id: huntId,
          code,
          label,
          title: label || cluePayload.title || '',
          type: 'treasure',
          points: parseInt(points, 10) || 10,
          sequence_order: sequenceOrder !== undefined && sequenceOrder !== null ? parseInt(sequenceOrder, 10) : null,
          max_scans: maxScans !== undefined && maxScans !== null && maxScans !== '' ? parseInt(maxScans, 10) : null,
          clue_payload: {
            title: cluePayload.title || '',
            text: cluePayload.text || '',
            imageUrl: cluePayload.imageUrl || '',
          },
          location_lat: locationLat !== undefined && locationLat !== null && locationLat !== '' ? parseFloat(locationLat) : null,
          location_lng: locationLng !== undefined && locationLng !== null && locationLng !== '' ? parseFloat(locationLng) : null,
          scan_count: 0,
          is_active: true,
          active: true,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      qr: newQrCode,
      qrImageBase64,
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'An unexpected server error occurred' },
      { status: 500 }
    );
  }
}

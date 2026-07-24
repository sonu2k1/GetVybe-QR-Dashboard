import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { generateAlphanumericCode } from '@/lib/utils';
import QRCode from 'qrcode';

// GET /api/qr?huntId=xxx - select all qr_codes for hunt
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const huntId = searchParams.get('huntId');

    if (!huntId) {
      return NextResponse.json({ error: 'huntId is required' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('hunt_id', huntId)
      .order('sequence_order', { ascending: true, nullsFirst: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/qr - create single QR
export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const body = await req.json();

    const {
      huntId,
      hunt_id,
      label,
      points = 10,
      cluePayload = {},
      clue_payload = {},
      sequenceOrder,
      sequence_order,
      maxScans,
      max_scans,
      locationLat,
      location_lat,
      locationLng,
      location_lng,
    } = body;

    const actualHuntId = huntId || hunt_id;
    const actualLabel = label;
    const actualPoints = points;
    const actualCluePayload = Object.keys(cluePayload).length ? cluePayload : clue_payload;
    const actualSequenceOrder = sequenceOrder !== undefined ? sequenceOrder : sequence_order;
    const actualMaxScans = maxScans !== undefined ? maxScans : max_scans;
    const actualLat = locationLat !== undefined ? locationLat : location_lat;
    const actualLng = locationLng !== undefined ? locationLng : location_lng;

    if (!actualHuntId || !actualLabel) {
      return NextResponse.json({ error: 'huntId and label are required' }, { status: 400 });
    }

    // Generate unique 8-character alphanumeric code
    let uniqueCode = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 15) {
      uniqueCode = generateAlphanumericCode(8);
      const { data, error } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('code', uniqueCode);

      if (!error && (!data || data.length === 0)) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Could not generate unique code' }, { status: 500 });
    }

    // Construct URL for QR
    const scanBaseUrl = process.env.NEXT_PUBLIC_SCAN_BASE_URL || 'http://localhost:3000/scan';
    const scanUrl = `${scanBaseUrl}/${uniqueCode}`;

    // Generate QR image as base64 PNG using qrcode package
    const dataUrl = await QRCode.toDataURL(scanUrl);
    // Split to get only base64 data
    const qrImageBase64 = dataUrl.split(',')[1];

    // Insert into qr_codes
    const { data: qrCodeData, error: insertError } = await supabase
      .from('qr_codes')
      .insert([
        {
          hunt_id: actualHuntId,
          code: uniqueCode,
          label: actualLabel,
          title: actualLabel,
          type: 'treasure',
          points: actualPoints,
          clue_payload: actualCluePayload,
          sequence_order: actualSequenceOrder || null,
          max_scans: actualMaxScans || null,
          location_lat: actualLat || null,
          location_lng: actualLng || null,
          active: true,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      ...qrCodeData,
      qrImageBase64,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

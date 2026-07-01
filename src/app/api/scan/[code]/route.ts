import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// Helper to validate a QR code scan
function validateScan(qrCode: any, hunt: any) {
  if (!qrCode.is_active) {
    return { valid: false, reason: 'INACTIVE', dbResult: 'INVALID' };
  }

  const now = new Date();
  
  if (hunt) {
    if (hunt.status === 'DRAFT') {
      return { valid: false, reason: 'INACTIVE', dbResult: 'INVALID' };
    }
    if (hunt.status === 'COMPLETED') {
      return { valid: false, reason: 'EXPIRED', dbResult: 'EXPIRED' };
    }
    if (hunt.start_at && now < new Date(hunt.start_at)) {
      return { valid: false, reason: 'EXPIRED', dbResult: 'EXPIRED' };
    }
    if (hunt.end_at && now > new Date(hunt.end_at)) {
      return { valid: false, reason: 'EXPIRED', dbResult: 'EXPIRED' };
    }
  }

  if (qrCode.max_scans !== null && qrCode.scan_count >= qrCode.max_scans) {
    return { valid: false, reason: 'MAX_REACHED', dbResult: 'EXPIRED' };
  }

  return { valid: true };
}

// GET /api/scan/[code] - resolve QR
export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;
    const supabase = createServerClient();

    // Fetch qr_code and join with hunt
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*, hunts(*)')
      .eq('code', code)
      .single();

    if (error || !qrCode) {
      return NextResponse.json({ error: 'QR Code not found', reason: 'INVALID' }, { status: 404 });
    }

    const validation = validateScan(qrCode, qrCode.hunts);
    if (!validation.valid) {
      return NextResponse.json({ reason: validation.reason }, { status: 400 });
    }

    return NextResponse.json({ clue_payload: qrCode.clue_payload });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/scan/[code] - log scan
export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;
    const body = await req.json();
    const { userId, user_id, deviceMeta, device_meta } = body;
    const actualUserId = userId || user_id;
    const actualDeviceMeta = deviceMeta || device_meta || {};

    if (!actualUserId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Fetch qr_code and associated hunt
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*, hunts(*)')
      .eq('code', code)
      .single();

    if (error || !qrCode) {
      return NextResponse.json({ error: 'QR Code not found', result: 'INVALID' }, { status: 404 });
    }

    // 2. Check for duplicate scan (same user + qr_id and result = SUCCESS in scans table)
    const { data: existingScan, error: scanFetchError } = await supabase
      .from('scans')
      .select('id')
      .eq('qr_id', qrCode.id)
      .eq('user_id', actualUserId)
      .eq('result', 'SUCCESS')
      .limit(1);

    if (existingScan && existingScan.length > 0) {
      // Log duplicate scan
      await supabase.from('scans').insert([
        {
          qr_id: qrCode.id,
          user_id: actualUserId,
          result: 'DUPLICATE',
          device_meta: actualDeviceMeta,
        },
      ]);
      return NextResponse.json({
        result: 'DUPLICATE',
        clue_payload: qrCode.clue_payload, // Return clue payload even on duplicate, so user can re-read clue
      });
    }

    // 3. Run validation rules
    const validation = validateScan(qrCode, qrCode.hunts);
    if (!validation.valid) {
      // Log invalid scan to DB
      await supabase.from('scans').insert([
        {
          qr_id: qrCode.id,
          user_id: actualUserId,
          result: validation.dbResult || 'INVALID',
          device_meta: actualDeviceMeta,
        },
      ]);
      return NextResponse.json({ result: validation.dbResult || 'INVALID', reason: validation.reason }, { status: 400 });
    }

    // 4. Successful Scan - insert scan row
    const { error: insertScanError } = await supabase.from('scans').insert([
      {
        qr_id: qrCode.id,
        user_id: actualUserId,
        result: 'SUCCESS',
        device_meta: actualDeviceMeta,
      },
    ]);

    if (insertScanError) {
      return NextResponse.json({ error: insertScanError.message }, { status: 500 });
    }

    // 5. Increment scan_count in qr_codes
    // Try via RPC first, fallback to manual increment if RPC is not deployed yet
    const { error: rpcError } = await supabase.rpc('increment_scan_count', { qr_id: qrCode.id });
    
    if (rpcError) {
      console.warn('RPC failed, falling back to update:', rpcError.message);
      await supabase
        .from('qr_codes')
        .update({ scan_count: qrCode.scan_count + 1 })
        .eq('id', qrCode.id);
    }

    return NextResponse.json({
      result: 'SUCCESS',
      clue_payload: qrCode.clue_payload,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

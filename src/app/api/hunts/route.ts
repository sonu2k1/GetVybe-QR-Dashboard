import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { customAlphabet } from 'nanoid';
import QRCode from 'qrcode';

const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

// GET /api/hunts - select all hunts with count of qr_codes
export async function GET() {
  try {
    const supabase = createServerClient();
    
    // We select hunts and count qr_codes
    const { data, error } = await supabase
      .from('hunts')
      .select('*, qr_codes(count)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const hunts = (data || []).map((hunt: any) => {
      const qr_codes_count = hunt.qr_codes?.[0]?.count ?? 0;
      const { qr_codes, ...rest } = hunt;
      return {
        ...rest,
        qr_codes_count,
      };
    });

    return NextResponse.json(hunts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/hunts - insert into hunts and generate one default QR code
export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const body = await req.json();
    const { name, start_at, end_at, status } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // 1. Insert Hunt
    const { data: newHunt, error: huntError } = await supabase
      .from('hunts')
      .insert([
        {
          name,
          start_at: start_at || null,
          end_at: end_at || null,
          status: status || 'DRAFT',
        },
      ])
      .select()
      .single();

    if (huntError) {
      return NextResponse.json({ error: huntError.message }, { status: 500 });
    }

    // 2. Generate unique 8-char code
    let code = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 4) {
      code = generateCode();
      const { data: checkData, error: checkError } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('code', code);

      if (!checkError && (!checkData || checkData.length === 0)) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      // Return hunt but note QR generation error
      return NextResponse.json({
        success: true,
        hunt: newHunt,
        defaultQr: null,
        qrImageBase64: '',
        qrError: true,
        error: 'Failed to generate unique QR code code'
      }, { status: 201 });
    }

    // 3. Build scan URL and QR base64 image
    const scanBaseUrl = process.env.NEXT_PUBLIC_SCAN_BASE_URL || 'http://localhost:3000/scan';
    const scanUrl = `${scanBaseUrl}/${code}`;
    
    let qrImageBase64 = '';
    try {
      qrImageBase64 = await QRCode.toDataURL(scanUrl, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
    } catch (qrGenErr: any) {
      return NextResponse.json({
        success: true,
        hunt: newHunt,
        defaultQr: null,
        qrImageBase64: '',
        qrError: true,
        error: qrGenErr.message || 'Failed to generate QR base64 image'
      }, { status: 201 });
    }

    // 4. Insert default QR code row
    const { data: defaultQr, error: qrInsertError } = await supabase
      .from('qr_codes')
      .insert([
        {
          hunt_id: newHunt.id,
          code,
          label: `${name} - Clue 1`,
          sequence_order: 1,
          points: 10,
          clue_payload: { title: 'Clue 1', text: 'Add your clue here', imageUrl: '' },
          is_active: true,
          scan_count: 0
        }
      ])
      .select()
      .single();

    if (qrInsertError) {
      return NextResponse.json({
        success: true,
        hunt: newHunt,
        defaultQr: null,
        qrImageBase64: '',
        qrError: true,
        error: qrInsertError.message
      }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      hunt: newHunt,
      defaultQr,
      qrImageBase64
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

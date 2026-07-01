import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/hunts/[id] - selects a single hunt campaign
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const huntId = params.id;
    const supabase = createServerClient();

    const { data: hunt, error } = await supabase
      .from('hunts')
      .select('*')
      .eq('id', huntId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(hunt);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/hunts/[id] - deletes a hunt campaign
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const huntId = params.id;
    const supabase = createServerClient();

    // 1. Get all QR codes associated with this hunt
    const { data: qrCodes, error: qrFetchError } = await supabase
      .from('qr_codes')
      .select('id')
      .eq('hunt_id', huntId);

    if (qrFetchError) {
      return NextResponse.json({ error: qrFetchError.message }, { status: 500 });
    }

    const qrIds = (qrCodes || []).map((q) => q.id);

    // 2. Delete scans linked to these QR codes
    if (qrIds.length > 0) {
      const { error: scansDeleteError } = await supabase
        .from('scans')
        .delete()
        .in('qr_id', qrIds);

      if (scansDeleteError) {
        return NextResponse.json({ error: scansDeleteError.message }, { status: 500 });
      }
    }

    // 3. Delete QR codes linked to this hunt
    const { error: qrDeleteError } = await supabase
      .from('qr_codes')
      .delete()
      .eq('hunt_id', huntId);

    if (qrDeleteError) {
      return NextResponse.json({ error: qrDeleteError.message }, { status: 500 });
    }

    // 4. Delete the hunt campaign
    const { error: huntDeleteError } = await supabase
      .from('hunts')
      .delete()
      .eq('id', huntId);

    if (huntDeleteError) {
      return NextResponse.json({ error: huntDeleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred while deleting the hunt' },
      { status: 500 }
    );
  }
}

// PATCH /api/hunts/[id] - updates a hunt campaign status/fields
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const huntId = params.id;
    const supabase = createServerClient();
    const body = await req.json();
    const { name, start_at, end_at, status } = body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (start_at !== undefined) updateData.start_at = start_at;
    if (end_at !== undefined) updateData.end_at = end_at;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from('hunts')
      .update(updateData)
      .eq('id', huntId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

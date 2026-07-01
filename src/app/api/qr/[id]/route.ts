import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// PATCH /api/qr/[id] - update label, clue_payload, points, is_active, max_scans
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const qrId = params.id;
    const supabase = createServerClient();
    const body = await req.json();

    const updateData: Record<string, any> = {};

    // Map body attributes to column names
    const fields = [
      'label',
      'points',
      'is_active',
      'max_scans',
      'sequence_order',
      'location_lat',
      'location_lng',
    ];

    fields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Handle camelCase options as well
    if (body.isActive !== undefined) updateData.is_active = body.isActive;
    if (body.maxScans !== undefined) updateData.max_scans = body.maxScans;
    if (body.sequenceOrder !== undefined) updateData.sequence_order = body.sequenceOrder;
    if (body.locationLat !== undefined) updateData.location_lat = body.locationLat;
    if (body.locationLng !== undefined) updateData.location_lng = body.locationLng;

    // Handle clue payload (either object or merged update)
    if (body.clue_payload !== undefined) {
      updateData.clue_payload = body.clue_payload;
    } else if (body.cluePayload !== undefined) {
      updateData.clue_payload = body.cluePayload;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update provided' }, { status: 400 });
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('qr_codes')
      .update(updateData)
      .eq('id', qrId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/qr/[id] - deletes a checkpoint QR code
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const qrId = params.id;
    const supabase = createServerClient();

    // 1. Delete associated scan records first to prevent foreign key errors
    const { error: scansDeleteError } = await supabase
      .from('scans')
      .delete()
      .eq('qr_id', qrId);

    if (scansDeleteError) {
      return NextResponse.json({ error: scansDeleteError.message }, { status: 500 });
    }

    // 2. Delete the QR checkpoint
    const { error: qrDeleteError } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', qrId);

    if (qrDeleteError) {
      return NextResponse.json({ error: qrDeleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

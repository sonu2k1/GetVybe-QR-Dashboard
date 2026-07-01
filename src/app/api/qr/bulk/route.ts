import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { generateAlphanumericCode } from '@/lib/utils';

// POST /api/qr/bulk - insert multiple QRs at once
export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const body = await req.json();

    const {
      huntId,
      hunt_id,
      count,
      labelPrefix,
      label_prefix,
    } = body;

    const actualHuntId = huntId || hunt_id;
    const actualCount = parseInt(count, 10);
    const actualLabelPrefix = labelPrefix || label_prefix || 'QR';

    if (!actualHuntId || isNaN(actualCount) || actualCount <= 0) {
      return NextResponse.json(
        { error: 'huntId and positive count are required' },
        { status: 400 }
      );
    }

    if (actualCount > 100) {
      return NextResponse.json(
        { error: 'Cannot generate more than 100 QR codes in a single request' },
        { status: 400 }
      );
    }

    // Determine the next sequence order start value
    const { data: existingQrs, error: seqError } = await supabase
      .from('qr_codes')
      .select('sequence_order')
      .eq('hunt_id', actualHuntId)
      .order('sequence_order', { ascending: false });

    if (seqError) {
      return NextResponse.json({ error: seqError.message }, { status: 500 });
    }

    let nextSeq = 1;
    if (existingQrs && existingQrs.length > 0) {
      const maxSeq = existingQrs[0].sequence_order;
      if (maxSeq !== null) {
        nextSeq = maxSeq + 1;
      }
    }

    // Generate unique 8-character codes
    const codes: string[] = [];
    const generatedSet = new Set<string>();

    for (let i = 0; i < actualCount; i++) {
      let uniqueCode = '';
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 15) {
        uniqueCode = generateAlphanumericCode(8);
        if (!generatedSet.has(uniqueCode)) {
          const { data, error } = await supabase
            .from('qr_codes')
            .select('id')
            .eq('code', uniqueCode);

          if (!error && (!data || data.length === 0)) {
            isUnique = true;
          }
        }
        attempts++;
      }

      if (!isUnique) {
        return NextResponse.json(
          { error: 'Failed to generate a batch of unique alphanumeric codes' },
          { status: 500 }
        );
      }

      codes.push(uniqueCode);
      generatedSet.add(uniqueCode);
    }

    // Prepare rows for insertion
    const rowsToInsert = codes.map((code, index) => ({
      hunt_id: actualHuntId,
      code,
      label: `${actualLabelPrefix} ${nextSeq + index}`,
      points: 10,
      sequence_order: nextSeq + index,
      clue_payload: {
        title: `${actualLabelPrefix} ${nextSeq + index} Clue`,
        text: `Find the location of QR code #${nextSeq + index}`,
      },
      is_active: true,
      scan_count: 0,
    }));

    const { data: insertedData, error: bulkInsertError } = await supabase
      .from('qr_codes')
      .insert(rowsToInsert)
      .select();

    if (bulkInsertError) {
      return NextResponse.json({ error: bulkInsertError.message }, { status: 500 });
    }

    return NextResponse.json(insertedData, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

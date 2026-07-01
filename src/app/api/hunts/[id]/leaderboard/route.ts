import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET /api/hunts/[id]/leaderboard - query scans grouped by user_id, sum points from qr_codes
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const huntId = params.id;
    const supabase = createServerClient();

    // Select scans, filter by result SUCCESS, join with qr_codes where hunt_id matches
    const { data, error } = await supabase
      .from('scans')
      .select('user_id, result, qr_codes!inner(hunt_id, points)')
      .eq('qr_codes.hunt_id', huntId)
      .eq('result', 'SUCCESS');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const leaderboardMap: Record<string, { user_id: string; total_points: number; scan_count: number }> = {};

    (data || []).forEach((scan: any) => {
      const userId = scan.user_id;
      const points = scan.qr_codes?.points ?? 0;
      
      if (!leaderboardMap[userId]) {
        leaderboardMap[userId] = {
          user_id: userId,
          total_points: 0,
          scan_count: 0,
        };
      }
      leaderboardMap[userId].total_points += points;
      leaderboardMap[userId].scan_count += 1;
    });

    const leaderboard = Object.values(leaderboardMap).sort(
      (a, b) => b.total_points - a.total_points
    );

    return NextResponse.json(leaderboard);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

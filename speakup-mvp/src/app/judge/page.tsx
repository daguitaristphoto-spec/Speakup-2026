import Link from 'next/link';
import { requireRole } from '@/lib/auth-guard';

export default async function JudgeDashboardPage() {
  const { supabase, user, profile } = await requireRole('judge');

  const [{ data: assignments }, { data: sheets }] = await Promise.all([
    supabase
      .from('assignments')
      .select('contestant_id, can_edit, contestant:contestants(id, sbd, full_name, video_path)')
      .eq('judge_id', user.id)
      .order('created_at'),
    supabase
      .from('score_sheets')
      .select('contestant_id, status, total_score')
      .eq('judge_id', user.id),
  ]);

  const sheetMap = new Map((sheets ?? []).map((sheet) => [sheet.contestant_id, sheet]));

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-6 py-8">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Giám khảo</p>
        <h1 className="text-3xl font-bold text-slate-900">Xin chào, {profile.full_name}</h1>
        <p className="mt-2 text-slate-600">Danh sách thí sinh được phân công cho bạn ở vòng sơ loại.</p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">SBD</th>
              <th className="px-4 py-3">Thí sinh</th>
              <th className="px-4 py-3">Video</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Tổng điểm</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(assignments ?? []).map((row: any) => {
              const contestant = Array.isArray(row.contestant) ? row.contestant[0] : row.contestant;
              const sheet = sheetMap.get(row.contestant_id);
              return (
                <tr key={contestant?.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium">{contestant?.sbd}</td>
                  <td className="px-4 py-3">{contestant?.full_name}</td>
                  <td className="px-4 py-3">{contestant?.video_path ? 'Có video' : 'Chưa có video'}</td>
                  <td className="px-4 py-3">
                    {sheet?.status === 'submitted'
                      ? row.can_edit
                        ? 'Đã nộp - đang mở lại'
                        : 'Đã nộp'
                      : 'Chưa nộp'}
                  </td>
                  <td className="px-4 py-3">{sheet?.total_score ?? '-'}</td>
                  <td className="px-4 py-3">
                    <Link href={`/judge/contestants/${contestant?.id}`} className="rounded-xl bg-slate-900 px-4 py-2 text-white">
                      Vào chấm
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

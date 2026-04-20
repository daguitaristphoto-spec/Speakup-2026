import Link from 'next/link';
import { requireRole } from '@/lib/auth-guard';

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireRole('admin');

  const [{ count: contestantCount }, { count: judgeCount }, { count: submittedCount }] = await Promise.all([
    supabase.from('contestants').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'judge'),
    supabase.from('score_sheets').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-8 px-6 py-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">Xin chào, {profile.full_name}</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/assignments" className="rounded-xl bg-slate-900 px-4 py-3 text-white">Phân công giám khảo</Link>
          <Link href="/admin/upload" className="rounded-xl border border-slate-300 px-4 py-3">Upload video</Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Tổng thí sinh</p>
          <p className="mt-2 text-3xl font-bold">{contestantCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Số giám khảo</p>
          <p className="mt-2 text-3xl font-bold">{judgeCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Phiếu đã nộp</p>
          <p className="mt-2 text-3xl font-bold">{submittedCount ?? 0}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Luồng làm việc khuyến nghị</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-700">
          <li>Tạo tài khoản judge trong Supabase Auth và thêm role vào bảng profiles.</li>
          <li>Import 100 thí sinh vào bảng contestants.</li>
          <li>Phân công 20 thí sinh cho mỗi giám khảo ở màn hình phân công.</li>
          <li>Upload video cho từng thí sinh.</li>
          <li>Theo dõi số phiếu đã nộp.</li>
          <li>Nếu cần chấm lại, set assignments.can_edit = true cho thí sinh tương ứng.</li>
        </ol>
      </section>
    </main>
  );
}

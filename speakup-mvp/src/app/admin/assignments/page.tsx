import { requireRole } from '@/lib/auth-guard';
import { AssignmentManager } from '@/components/admin/assignment-manager';

export default async function AssignmentsPage() {
  await requireRole('admin');

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-6 py-8">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Phân công giám khảo</h1>
        <p className="mt-2 text-slate-600">Mỗi thí sinh chỉ được gán cho đúng 1 giám khảo.</p>
      </header>
      <AssignmentManager />
    </main>
  );
}

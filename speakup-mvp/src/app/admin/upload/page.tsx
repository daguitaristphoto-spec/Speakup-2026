import { requireRole } from '@/lib/auth-guard';
import { UploadManager } from '@/components/admin/upload-manager';

export default async function UploadVideosPage() {
  await requireRole('admin');

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-6 px-6 py-8">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">Upload video thí sinh</h1>
      </header>
      <UploadManager />
    </main>
  );
}

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Speak Up Đại Nam 2026
        </p>
        <h1 className="text-4xl font-bold text-slate-900">
          Hệ thống chấm điểm vòng sơ loại
        </h1>
        <p className="text-lg text-slate-600">
          Admin quản lý thí sinh, upload video, phân công giám khảo. Giám khảo xem video và chấm trực tiếp trên cùng giao diện.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/login" className="rounded-xl bg-slate-900 px-5 py-3 text-white">
          Đăng nhập
        </Link>
        <Link href="/judge" className="rounded-xl border border-slate-300 px-5 py-3 text-slate-800">
          Vào trang giám khảo
        </Link>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';

export function VideoPanel({ contestantId }: { contestantId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/videos/${contestantId}`);
      if (!res.ok) {
        setError('Không tải được video.');
        return;
      }
      const data = await res.json();
      setUrl(data.url);
    }
    load();
  }, [contestantId]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Video dự thi</h2>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {url ? (
        <video controls preload="metadata" className="aspect-video w-full rounded-xl bg-black">
          <source src={url} />
          Trình duyệt không hỗ trợ phát video.
        </video>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          Đang tải video...
        </div>
      )}
    </div>
  );
}

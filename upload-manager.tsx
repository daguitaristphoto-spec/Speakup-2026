'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

type Contestant = {
  id: string;
  sbd: string;
  full_name: string;
  video_path: string | null;
};

export function UploadManager() {
  const supabase = createClient();
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [selectedContestantId, setSelectedContestantId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('contestants').select('id, sbd, full_name, video_path').order('sbd');
      setContestants((data ?? []) as Contestant[]);
    }
    load();
  }, []);

  async function handleUpload() {
    if (!selectedContestantId || !file) {
      setMessage('Hãy chọn thí sinh và file video.');
      return;
    }

    setUploading(true);
    setMessage(null);

    const signRes = await fetch('/api/admin/videos/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contestantId: selectedContestantId, filename: file.name }),
    });

    if (!signRes.ok) {
      setMessage('Không tạo được URL upload.');
      setUploading(false);
      return;
    }

    const { path, token } = await signRes.json();
    const bucket = process.env.NEXT_PUBLIC_VIDEO_BUCKET || 'contestant-videos';

    const uploadRes = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file);
    if (uploadRes.error) {
      setMessage(uploadRes.error.message);
      setUploading(false);
      return;
    }

    const attachRes = await fetch('/api/admin/videos/attach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contestantId: selectedContestantId, path }),
    });

    if (!attachRes.ok) {
      setMessage('Upload xong nhưng chưa lưu được đường dẫn video.');
      setUploading(false);
      return;
    }

    setMessage('Upload video thành công.');
    setFile(null);
    setUploading(false);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Thí sinh</label>
        <select
          value={selectedContestantId}
          onChange={(e) => setSelectedContestantId(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3 py-3"
        >
          <option value="">-- Chọn thí sinh --</option>
          {contestants.map((contestant) => (
            <option key={contestant.id} value={contestant.id}>
              {contestant.sbd} - {contestant.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">File video</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null)}
          className="w-full rounded-xl border border-slate-300 px-3 py-3"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="rounded-xl bg-slate-900 px-4 py-3 text-white disabled:opacity-60"
      >
        {uploading ? 'Đang upload...' : 'Upload video'}
      </button>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </section>
  );
}

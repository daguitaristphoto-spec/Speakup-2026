'use client';

import { useMemo, useState } from 'react';
import { ROUND1_CRITERIA } from '@/lib/round1-criteria';
import { calculateRound1Score } from '@/lib/scoring';
import type { ScoreItemInput } from '@/lib/types';

type ExistingItem = {
  criterion_key: string;
  criterion_group: string;
  score: number;
};

type Props = {
  contestantId: string;
  canEdit: boolean;
  strengths?: string | null;
  weaknesses?: string | null;
  items?: ExistingItem[];
};

export function ScoreForm({ contestantId, canEdit, strengths: initialStrengths, weaknesses: initialWeaknesses, items = [] }: Props) {
  const [strengths, setStrengths] = useState(initialStrengths ?? '');
  const [weaknesses, setWeaknesses] = useState(initialWeaknesses ?? '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, number>>(() => {
    const seed: Record<string, number> = {};
    for (const item of items) {
      seed[item.criterion_key] = Number(item.score);
    }
    return seed;
  });

  const scoreItems: ScoreItemInput[] = useMemo(
    () =>
      ROUND1_CRITERIA.flatMap((group) =>
        group.items.map((item) => ({
          criterionKey: item.key,
          criterionGroup: group.key,
          score: Number(values[item.key] ?? 0),
        }))
      ),
    [values]
  );

  const scoreResult = calculateRound1Score(scoreItems);

  async function persist(action: 'save' | 'submit') {
    setLoading(true);
    setMessage(null);

    const res = await fetch('/api/judge/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contestantId,
        action,
        strengths,
        weaknesses,
        items: scoreItems,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error ?? 'Không lưu được phiếu chấm.');
      setLoading(false);
      return;
    }

    setMessage(action === 'submit' ? 'Đã nộp phiếu chấm.' : 'Đã lưu nháp.');
    setLoading(false);
    if (action === 'submit') {
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Phiếu chấm vòng 1</h2>
          <p className="text-sm text-slate-500">Tổng điểm tự động tính theo trọng số 100 điểm.</p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-4 py-3 text-white">
          <div className="text-xs uppercase tracking-wide opacity-70">Tổng điểm</div>
          <div className="text-2xl font-bold">{scoreResult.final100}</div>
          <div className="text-sm opacity-80">{scoreResult.classification}</div>
        </div>
      </div>

      {ROUND1_CRITERIA.map((group) => (
        <section key={group.key} className="rounded-2xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">{group.title}</h3>
            <span className="text-sm text-slate-500">Trọng số: {group.weight * 100}%</span>
          </div>
          <div className="space-y-3">
            {group.items.map((item) => (
              <div key={item.key} className="grid gap-2 md:grid-cols-[1fr_140px] md:items-center">
                <label className="text-sm text-slate-700">{item.label}</label>
                <input
                  type="number"
                  min={0}
                  max={item.max}
                  step={0.5}
                  disabled={!canEdit || loading}
                  value={values[item.key] ?? ''}
                  onChange={(e) => setValues((prev) => ({ ...prev, [item.key]: Number(e.target.value) }))}
                  className="rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Ưu điểm</label>
          <textarea
            rows={5}
            disabled={!canEdit || loading}
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-3"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Hạn chế</label>
          <textarea
            rows={5}
            disabled={!canEdit || loading}
            value={weaknesses}
            onChange={(e) => setWeaknesses(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-3"
          />
        </div>
      </section>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => persist('save')}
          disabled={!canEdit || loading}
          className="rounded-xl border border-slate-300 px-4 py-3 disabled:opacity-60"
        >
          Lưu nháp
        </button>
        <button
          onClick={() => persist('submit')}
          disabled={!canEdit || loading}
          className="rounded-xl bg-slate-900 px-4 py-3 text-white disabled:opacity-60"
        >
          Nộp chính thức
        </button>
        {!canEdit ? <span className="self-center text-sm text-red-600">Phiếu đã khóa. Chỉ admin mới có thể mở lại.</span> : null}
      </div>
    </div>
  );
}

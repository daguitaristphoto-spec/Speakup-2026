'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';

type Judge = { id: string; full_name: string };
type Contestant = {
  id: string;
  sbd: string;
  full_name: string;
  video_path: string | null;
  assignments: { judge_id: string; can_edit: boolean }[];
  score_sheets: { status: 'draft' | 'submitted'; total_score: number }[];
};

export function AssignmentManager() {
  const supabase = createClient();
  const [judges, setJudges] = useState<Judge[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function reloadContestants() {
    const { data: contestantsData } = await supabase
      .from('contestants')
      .select('id, sbd, full_name, video_path, assignments(judge_id, can_edit), score_sheets(status, total_score)')
      .order('sbd');

    setContestants((contestantsData ?? []) as Contestant[]);
  }

  useEffect(() => {
    async function load() {
      const { data: judgesData } = await supabase.from('profiles').select('id, full_name').eq('role', 'judge').order('full_name');
      setJudges((judgesData ?? []) as Judge[]);
      await reloadContestants();
    }

    load();
  }, []);

  async function updateAssignment(contestantId: string, judgeId: string) {
    setSavingId(contestantId);

    const res = await fetch('/api/admin/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contestantId, judgeId }),
    });

    if (!res.ok) {
      alert('Không cập nhật được phân công.');
      setSavingId(null);
      return;
    }

    await reloadContestants();
    setSavingId(null);
  }

  async function reopenScore(contestantId: string) {
    setSavingId(contestantId);
    const res = await fetch('/api/admin/assignments/reopen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contestantId }),
    });

    if (!res.ok) {
      alert('Không mở lại được phiếu chấm.');
      setSavingId(null);
      return;
    }

    await reloadContestants();
    setSavingId(null);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">SBD</th>
            <th className="px-4 py-3">Thí sinh</th>
            <th className="px-4 py-3">Video</th>
            <th className="px-4 py-3">Giám khảo phụ trách</th>
            <th className="px-4 py-3">Phiếu chấm</th>
          </tr>
        </thead>
        <tbody>
          {contestants.map((contestant) => {
            const currentJudge = contestant.assignments?.[0]?.judge_id ?? '';
            const assignment = contestant.assignments?.[0];
            const sheet = contestant.score_sheets?.[0];
            return (
              <tr key={contestant.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium">{contestant.sbd}</td>
                <td className="px-4 py-3">{contestant.full_name}</td>
                <td className="px-4 py-3">{contestant.video_path ? 'Đã upload' : 'Chưa có video'}</td>
                <td className="px-4 py-3">
                  <select
                    defaultValue={currentJudge}
                    onChange={(e) => updateAssignment(contestant.id, e.target.value)}
                    disabled={savingId === contestant.id}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  >
                    <option value="">-- Chọn giám khảo --</option>
                    {judges.map((judge) => (
                      <option key={judge.id} value={judge.id}>
                        {judge.full_name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>
                      {sheet?.status === 'submitted'
                        ? assignment?.can_edit
                          ? 'Đã nộp - đang mở'
                          : 'Đã nộp - đang khóa'
                        : 'Chưa nộp'}
                    </span>
                    {sheet?.status === 'submitted' && !assignment?.can_edit ? (
                      <button
                        onClick={() => reopenScore(contestant.id)}
                        disabled={savingId === contestant.id}
                        className="rounded-lg border border-slate-300 px-3 py-2"
                      >
                        Mở lại
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth-guard';
import { VideoPanel } from '@/components/judge/video-panel';
import { ScoreForm } from '@/components/judge/score-form';

export default async function JudgeContestantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await requireUser();

  const isAdmin = profile.role === 'admin';

  const { data: assignment } = await supabase
    .from('assignments')
    .select('judge_id, can_edit, contestant:contestants(id, sbd, full_name, video_path)')
    .eq('contestant_id', id)
    .single();

  if (!assignment) {
    notFound();
  }

  if (!isAdmin && assignment.judge_id !== user.id) {
    redirect('/judge');
  }

  const { data: sheet } = await supabase
    .from('score_sheets')
    .select('id, strengths, weaknesses, status, total_score')
    .eq('contestant_id', id)
    .eq('judge_id', assignment.judge_id)
    .maybeSingle();

  const { data: scoreItems } = sheet
    ? await supabase
        .from('score_items')
        .select('criterion_key, criterion_group, score')
        .eq('score_sheet_id', sheet.id)
    : { data: [] as any[] };

  const contestant = Array.isArray(assignment.contestant) ? assignment.contestant[0] : assignment.contestant;
  const canEdit = isAdmin ? true : assignment.can_edit;

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 px-6 py-8">
      <header>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Phiếu chấm vòng 1</p>
        <h1 className="text-3xl font-bold text-slate-900">
          {contestant?.sbd} - {contestant?.full_name}
        </h1>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <VideoPanel contestantId={id} />
        <ScoreForm
          contestantId={id}
          canEdit={canEdit}
          strengths={sheet?.strengths}
          weaknesses={sheet?.weaknesses}
          items={scoreItems ?? []}
        />
      </div>
    </main>
  );
}

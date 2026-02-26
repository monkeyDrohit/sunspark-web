'use client';

import type { ApplicationStage as ApiStage } from '@/lib/api';
import { STAGE_ORDER, STAGE_LABELS, STAGE_RESPONSIBLE } from '@/lib/stages';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

const statusConfig: Record<
  Status,
  { label: string; className: string; icon: string }
> = {
  COMPLETED: { label: 'Completed', className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400', icon: '✓' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400', icon: '●' },
  PENDING: { label: 'Pending', className: 'bg-muted text-muted-foreground', icon: '○' },
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function StageTracker({ stages }: { stages: ApiStage[] }) {
  const bySlug = Object.fromEntries(stages.map((s) => [s.stageSlug, s]));

  return (
    <div className="overflow-x-auto py-4">
      <div className="flex min-w-max gap-0">
        {STAGE_ORDER.map((slug, i) => {
          const stage = bySlug[slug];
          const status = (stage?.status ?? 'PENDING') as Status;
          const cfg = statusConfig[status];
          const isLast = i === STAGE_ORDER.length - 1;
          return (
            <div key={slug} className="flex items-start">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium',
                    status === 'COMPLETED' && 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
                    status === 'IN_PROGRESS' && 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400',
                    status === 'PENDING' && 'border-muted bg-muted/50 text-muted-foreground'
                  )}
                >
                  {cfg.icon}
                </div>
                <p className="mt-2 max-w-[90px] truncate text-center text-xs font-medium">
                  {STAGE_LABELS[slug]}
                </p>
                <p className="mt-0.5 text-center text-[10px] text-muted-foreground">
                  {STAGE_RESPONSIBLE[slug]}
                </p>
                <Badge variant="secondary" className={cn('mt-1.5 text-[10px]', cfg.className)}>
                  {cfg.label}
                </Badge>
                {stage?.completedAt && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDate(stage.completedAt)}
                  </p>
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'mx-1 mt-5 h-0.5 w-6 shrink-0 self-center rounded',
                    status === 'COMPLETED' ? 'bg-emerald-500/50' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

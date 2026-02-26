'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STAGE_ORDER, STAGE_LABELS } from '@/lib/stages';
import { updateServiceLeadStage } from '@/lib/api';
import type { ServiceLead, StageSlug } from '@/lib/api';

export function ApplicationActions({ app }: { app: ServiceLead }) {
  const router = useRouter();
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [stageSlug, setStageSlug] = useState<StageSlug>(STAGE_ORDER[0]);
  const [status, setStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('PENDING');
  const [notes, setNotes] = useState('');

  const openUpdateStage = () => {
    // default to first stage
    handleStageChange(STAGE_ORDER[0]);
    setIsUpdateOpen(true);
    setError('');
  };

  const handleStageChange = (slug: string) => {
    const s = slug as StageSlug;
    setStageSlug(s);
    const existing = app.stages?.find((st) => st.stageSlug === s);
    if (existing) {
      setStatus(existing.status as any);
      setNotes(existing.notes || '');
    } else {
      setStatus('PENDING');
      setNotes('');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateServiceLeadStage(app.id, stageSlug, status, notes);
      setIsUpdateOpen(false);
      router.refresh(); // Refresh page to see updated stage
    } catch (err: any) {
      setError(err.message || 'Failed to update stage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default">Action</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={openUpdateStage}>Update stage</DropdownMenuItem>
          <DropdownMenuItem>Edit details</DropdownMenuItem>
          <DropdownMenuItem>View documents</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Update Stage Status</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error && <div className="text-sm font-medium text-destructive">{error}</div>}
              <div className="flex flex-col gap-2">
                <Label>Stage</Label>
                <Select value={stageSlug} onValueChange={handleStageChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGE_ORDER.map((slug) => (
                      <SelectItem key={slug} value={slug}>
                        {STAGE_LABELS[slug]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any internal notes here..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUpdateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Stage'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
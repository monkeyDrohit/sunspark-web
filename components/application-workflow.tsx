'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ClipboardCheck, 
  CreditCard, 
  Zap, 
  Search, 
  HelpCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Application, StageSlug } from '@/lib/api';
import { STAGE_ORDER, STAGE_LABELS } from '@/lib/stages';
import { updateApplicationStage } from '@/lib/api';

interface WorkflowStep {
  slug: StageSlug;
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  icon: any;
  color: string;
}

const WORKFLOW_STEPS: Record<StageSlug, WorkflowStep> = {
  SERVICE_LEAD: {
    slug: 'SERVICE_LEAD',
    title: 'Initial Lead captured',
    description: 'Verify the consumer details and requirement before proceeding to quotation.',
    actionLabel: 'Proceed to Quotation',
    icon: FileText,
    color: 'text-blue-500',
  },
  QUOTATION: {
    slug: 'QUOTATION',
    title: 'Quotation Drafting',
    description: 'Create a formal technical and commercial proposal for the consumer.',
    actionLabel: 'Open Quotation Builder',
    actionHref: '/quotation', // appended to /applications/[id]
    icon: Search,
    color: 'text-amber-500',
  },
  DOCUMENTS_SUBMISSION: {
    slug: 'DOCUMENTS_SUBMISSION',
    title: 'Document Collection',
    description: 'Collect and verify mandatory documents: Aadhar, Electricity Bill, and Photos.',
    actionLabel: 'Manage Documents',
    actionHref: '#documents',
    icon: Upload,
    color: 'text-purple-500',
  },
  APPLICATION_SUBMISSION: {
    slug: 'APPLICATION_SUBMISSION',
    title: 'Final Portal Submission',
    description: 'Submit the completed application to the DisCom portal for approval.',
    actionLabel: 'Mark as Submitted',
    icon: CheckCircle2,
    color: 'text-indigo-500',
  },
  FEASIBILITY: {
    slug: 'FEASIBILITY',
    title: 'Technical Feasibility',
    description: 'DisCom technical team verifies site suitability for the solar plant.',
    actionLabel: 'Update Feasibility Status',
    icon: ClipboardCheck,
    color: 'text-emerald-500',
  },
  PAYMENT_BALANCE: {
    slug: 'PAYMENT_BALANCE',
    title: 'Payment & Balance',
    description: 'Track consumer payment or Jansamarth loan balance clearance.',
    actionLabel: 'Log Payment Status',
    icon: CreditCard,
    color: 'text-green-600',
  },
  INSTALLATION: {
    slug: 'INSTALLATION',
    title: 'Solar Installation',
    description: 'Physical installation of panels, inverter, and wiring at the site.',
    actionLabel: 'Manage Installation & Tracking',
    actionHref: '/track-agents',
    icon: Zap,
    color: 'text-yellow-500',
  },
  DISCOM_INSPECTION: {
    slug: 'DISCOM_INSPECTION',
    title: 'DisCom Inspection',
    description: 'Final inspection by utility company for net-metering synchronization.',
    actionLabel: 'Update Inspection Info',
    icon: Search,
    color: 'text-orange-500',
  },
  SUBSIDY_REQUEST: {
    slug: 'SUBSIDY_REQUEST',
    title: 'Subsidy Application',
    description: 'Submit the application for government financial aid after commissioning.',
    actionLabel: 'Apply for Subsidy',
    icon: HelpCircle,
    color: 'text-cyan-500',
  },
  SUBSIDY_DISBURSAL: {
    slug: 'SUBSIDY_DISBURSAL',
    title: 'Subsidy Final Payment',
    description: 'Verify receipt of subsidy amount in the consumer account.',
    actionLabel: 'Confirm Disbursal',
    icon: CheckCircle2,
    color: 'text-emerald-600',
  },
};

export function ApplicationWorkflow({ application }: { application: Application }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Determine current active stage
  // Active stage is the first one in STAGE_ORDER that is NOT completed
  const stagesBySlug = Object.fromEntries(application.stages?.map(s => [s.stageSlug, s]) || []);
  const currentStageSlug = STAGE_ORDER.find(slug => stagesBySlug[slug]?.status !== 'COMPLETED') || STAGE_ORDER[STAGE_ORDER.length - 1];
  const currentStep = WORKFLOW_STEPS[currentStageSlug];
  
  const isCompleted = application.status === 'COMPLETED';

  const handleNextStage = async () => {
    if (currentStep.actionHref) {
      if (currentStep.actionHref.startsWith('#')) {
        window.location.hash = currentStep.actionHref;
        return;
      }
      router.push(`/applications/${application.id}${currentStep.actionHref}`);
      return;
    }

    setLoading(true);
    try {
      // For now, just mark current as completed to move flow forward
      await updateApplicationStage(application.id, currentStageSlug, 'COMPLETED', 'Automatically advanced via workflow guide.');
      router.refresh();
    } catch (error) {
      console.error('Failed to advance stage', error);
      alert('Failed to advance stage. Please try manual update.');
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <Card className="border-emerald-500/20 bg-emerald-500/5 mb-6">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Application Fully Completed</h3>
          <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 max-w-md">
            This project has successfully passed through all stages including installation and subsidy disbursal.
          </p>
        </CardContent>
      </Card>
    );
  }

  const Icon = currentStep.icon;

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-background font-mono text-[10px] uppercase tracking-wider">
              Current Phase
            </Badge>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm font-semibold text-primary">{STAGE_LABELS[currentStageSlug]}</span>
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            Step {STAGE_ORDER.indexOf(currentStageSlug) + 1} of 10
          </div>
        </div>
        <div className="mt-4 flex items-start gap-4">
          <div className={cn("p-3 rounded-xl bg-background border shadow-sm", currentStep.color)}>
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">{currentStep.title}</CardTitle>
            <CardDescription className="text-sm mt-1 max-w-xl">
              {currentStep.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex items-center gap-3">
        <Button onClick={handleNextStage} disabled={loading} size="lg" className="px-8 shadow-md">
          {loading ? 'Processing...' : currentStep.actionLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="text-[11px] text-muted-foreground italic">
          Clicking this will record progress and move the application to the next phase.
        </p>
      </CardContent>
    </Card>
  );
}

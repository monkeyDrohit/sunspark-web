import type { StageSlug } from '@/lib/api';

export const STAGE_ORDER: StageSlug[] = [
  'SERVICE_LEAD',
  'QUOTATION',
  'DOCUMENTS_SUBMISSION',
  'APPLICATION_SUBMISSION',
  'FEASIBILITY',
  'PAYMENT_BALANCE',
  'INSTALLATION',
  'DISCOM_INSPECTION',
  'SUBSIDY_REQUEST',
  'SUBSIDY_DISBURSAL',
];

export const STAGE_LABELS: Record<StageSlug, string> = {
  SERVICE_LEAD: 'Service Lead',
  QUOTATION: 'Quotation',
  DOCUMENTS_SUBMISSION: 'Documents Submission',
  APPLICATION_SUBMISSION: 'Application Submission',
  FEASIBILITY: 'Feasibility',
  PAYMENT_BALANCE: 'Payment / Balance',
  INSTALLATION: 'Installation',
  DISCOM_INSPECTION: 'DisCom Inspection',
  SUBSIDY_REQUEST: 'Subsidy Request',
  SUBSIDY_DISBURSAL: 'Subsidy Disbursal',
};

export const STAGE_RESPONSIBLE: Record<StageSlug, string> = {
  SERVICE_LEAD: 'Vendor',
  QUOTATION: 'Vendor',
  DOCUMENTS_SUBMISSION: 'Consumer',
  APPLICATION_SUBMISSION: 'Vendor',
  FEASIBILITY: 'Discom',
  PAYMENT_BALANCE: 'Consumer',
  INSTALLATION: 'Vendor',
  DISCOM_INSPECTION: 'Discom',
  SUBSIDY_REQUEST: 'Consumer',
  SUBSIDY_DISBURSAL: 'Discom',
};

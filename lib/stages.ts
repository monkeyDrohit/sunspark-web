import type { StageSlug } from '@/lib/api';

export const STAGE_ORDER: StageSlug[] = [
  'REGISTRATION',
  'APPLICATION',
  'FEASIBILITY',
  'VENDOR_SELECTION',
  'UPLOAD_AGREEMENT',
  'INSTALLATION',
  'INSPECTION',
  'PROJECT_COMMISSIONING',
  'SUBSIDY_REQUEST',
  'SUBSIDY_DISBURSAL',
];

export const STAGE_LABELS: Record<StageSlug, string> = {
  REGISTRATION: 'Registration',
  APPLICATION: 'Application',
  FEASIBILITY: 'Feasibility',
  VENDOR_SELECTION: 'Vendor Selection',
  UPLOAD_AGREEMENT: 'Upload Agreement',
  INSTALLATION: 'Installation',
  INSPECTION: 'Inspection',
  PROJECT_COMMISSIONING: 'Project Commissioning',
  SUBSIDY_REQUEST: 'Subsidy Request',
  SUBSIDY_DISBURSAL: 'Subsidy Disbursal',
};

export const STAGE_RESPONSIBLE: Record<StageSlug, string> = {
  REGISTRATION: 'Consumer',
  APPLICATION: 'Consumer',
  FEASIBILITY: 'Discom',
  VENDOR_SELECTION: 'Consumer',
  UPLOAD_AGREEMENT: 'Vendor',
  INSTALLATION: 'Vendor',
  INSPECTION: 'Discom',
  PROJECT_COMMISSIONING: 'Discom',
  SUBSIDY_REQUEST: 'Consumer',
  SUBSIDY_DISBURSAL: 'REC',
};

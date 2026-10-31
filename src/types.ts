// Review adapter: replaces Prisma-generated types. Forward list is extracted from source.
export type LeadPipelineStatus =
  | 'DISCOVERED' | 'ENRICHED' | 'VERIFIED' | 'QUALIFIED' | 'SCORED'
  | 'PERSONALIZED' | 'DEMO_READY' | 'PENDING_APPROVAL' | 'APPROVED'
  | 'SENT' | 'MEETING_SCHEDULED' | 'REJECTED' | 'FAILED' | 'SKIPPED';

export const PIPELINE_FORWARD: LeadPipelineStatus[] = [
  'DISCOVERED',
  'ENRICHED',
  'VERIFIED',
  'QUALIFIED',
  'SCORED',
  'PERSONALIZED',
  'DEMO_READY',
  'PENDING_APPROVAL',
  'APPROVED',
  'SENT',
];

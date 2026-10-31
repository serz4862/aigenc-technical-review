import type { LeadPipelineStatus } from './types.ts';
import { AppError } from './error.ts';
import { PIPELINE_FORWARD } from './types.ts';

const ALLOWED: Record<LeadPipelineStatus, LeadPipelineStatus[]> = {
  DISCOVERED: ['ENRICHED', 'FAILED', 'SKIPPED'],
  ENRICHED: ['VERIFIED', 'FAILED', 'SKIPPED'],
  VERIFIED: ['QUALIFIED', 'FAILED', 'SKIPPED'],
  QUALIFIED: ['SCORED', 'FAILED', 'SKIPPED'],
  SCORED: ['PERSONALIZED', 'FAILED', 'SKIPPED'],
  PERSONALIZED: ['DEMO_READY', 'FAILED', 'SKIPPED'],
  DEMO_READY: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PERSONALIZED', 'FAILED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'PERSONALIZED', 'FAILED'],
  APPROVED: ['SENT', 'MEETING_SCHEDULED', 'FAILED'],
  SENT: ['MEETING_SCHEDULED'],
  MEETING_SCHEDULED: [],
  REJECTED: ['PERSONALIZED', 'PENDING_APPROVAL', 'SKIPPED'],
  FAILED: [
    'DISCOVERED',
    'ENRICHED',
    'VERIFIED',
    'QUALIFIED',
    'SCORED',
    'PERSONALIZED',
    'DEMO_READY',
    'PENDING_APPROVAL',
    'APPROVED',
  ],
  SKIPPED: ['DISCOVERED', 'ENRICHED', 'VERIFIED', 'QUALIFIED', 'SCORED', 'PERSONALIZED'],
};

export function canTransition(from: LeadPipelineStatus, to: LeadPipelineStatus): boolean {
  if (from === to) return true;
  return ALLOWED[from].includes(to);
}

export function assertTransition(from: LeadPipelineStatus, to: LeadPipelineStatus): void {
  if (!canTransition(from, to)) {
    throw new AppError(
      400,
      'INVALID_PIPELINE_TRANSITION',
      `Cannot move lead from ${from} to ${to}`
    );
  }
}

export function allowedTargets(from: LeadPipelineStatus): LeadPipelineStatus[] {
  return ALLOWED[from];
}

/** After FAILED/SKIPPED, retry the stage that actually failed — not the whole pipeline. */
export function resumeStatusFromHistory(
  current: LeadPipelineStatus,
  lastPreviousStatus?: LeadPipelineStatus | null
): LeadPipelineStatus {
  if (current !== 'FAILED' && current !== 'SKIPPED') return current;
  if (
    lastPreviousStatus &&
    PIPELINE_FORWARD.includes(lastPreviousStatus) &&
    lastPreviousStatus !== 'SENT'
  ) {
    return lastPreviousStatus;
  }
  return 'DISCOVERED';
}

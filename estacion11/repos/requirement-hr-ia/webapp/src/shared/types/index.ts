export type CampaignStatus = 'draft' | 'active' | 'inactive' | 'archived';
export type ConversationState = 'active' | 'paused' | 'abandoned' | 'completed';
export type SessionPhase = 'onboarding' | 'consent' | 'verification' | 'screening' | 'closing';
export type CandidateState = 'initiated' | 'in_screening' | 'completed' | 'pending_review' | 'approved' | 'rejected';
export type Recommendation = 'highly_recommended' | 'recommended' | 'not_recommended';
export type AuditEventType =
  | 'consent_granted'
  | 'consent_denied'
  | 'screening_started'
  | 'screening_completed'
  | 'screening_abandoned'
  | 'evaluation_generated'
  | 'candidate_approved'
  | 'candidate_rejected'
  | 'escalation_triggered';

export interface TenantContext {
  tenantId: string;
  userId: string;
  email: string;
}

export interface PaginatedResult<T> {
  items: T[];
  nextToken?: string;
  total?: number;
}

export interface ReviewFilters {
  campaignId?: string;
  recommendation?: Recommendation;
  scoreMin?: number;
  scoreMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

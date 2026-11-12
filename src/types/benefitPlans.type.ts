import type { PaginationGeneric } from './pagination.type'

export interface BenefitPlanResponse {
  departmentId: string
  departmentName?: string
  positionId: string
  positionTitle?: string
  benefitId: string
  benefitName?: string
  limitAmount: number
}

export interface UpsertBenefitPlanRequest {
  departmentId: string
  positionId: string
  benefitId: string
  limitAmount: number
}

export type BenefitPlanPagination = PaginationGeneric<BenefitPlanResponse>

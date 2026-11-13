import { FinanceStage } from './FinanceStage'
import { ManagerStage } from './ManagerStage'
import { SubmissionStage } from './SubmissionStage'
import {
  getApprovalState,
  getClaimTypeLabel,
} from '#/features/approvals/helper/claim-helpers'
import type { Claim, ReceiptInfo } from '#/types/approval-action.type'

interface ClaimProcessTimelineProps {
  claim: Claim
  receipt: ReceiptInfo
  onPreview: () => void
}

/** Timeline vertikal; tahap terbaru (Finance) berada di paling atas. */
export function ClaimProcessTimeline({
  claim,
  receipt,
  onPreview,
}: ClaimProcessTimelineProps) {
  const {
    level1Approval,
    level2Approval,
    managerDisplayName,
    isLevel1Rejected,
    isLevel2Rejected,
  } = getApprovalState(claim)

  const showFinanceStage =
    claim.status === 'UnderReview' ||
    claim.status === 'Approved' ||
    claim.status === 'Paid' ||
    Boolean(level2Approval) ||
    isLevel2Rejected

  // Pengaju dari departemen Finance langsung ke Finance Manager (tanpa Level 1)
  const isFinanceDirectFlow =
    !level1Approval &&
    !isLevel1Rejected &&
    claim.status !== 'Submitted' &&
    Boolean(claim.departmentName?.toLowerCase().includes('finance'))

  return (
    <div className="relative pl-10 space-y-6">
      {showFinanceStage && (
        <FinanceStage
          claim={claim}
          approval={level2Approval}
          isRejected={isLevel2Rejected}
          hasReceipt={receipt.hasFile}
          onPreview={onPreview}
        />
      )}

      {!isFinanceDirectFlow && (
        <ManagerStage
          claim={claim}
          approval={level1Approval}
          managerName={managerDisplayName}
          isRejected={isLevel1Rejected}
          receipt={receipt}
          onPreview={onPreview}
        />
      )}

      <SubmissionStage
        claim={claim}
        claimTypeLabel={getClaimTypeLabel(claim.claimType)}
        hasReceipt={receipt.hasFile}
        onPreview={onPreview}
      />
    </div>
  )
}

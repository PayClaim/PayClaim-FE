import { FileText } from 'lucide-react'
import {
  NotesBox,
  StageBody,
  StageIconBadge,
  TimelineStage,
} from './timeline-primitives'
import type { Claim } from '#/types/approval-action.type'
import { getDescriptionText } from '#/features/approvals/helper/claim-helpers'

interface SubmissionStageProps {
  claim: Claim
  claimTypeLabel: string
  hasReceipt: boolean
  onPreview: () => void
}

/** Tahap 1: pengajuan klaim oleh karyawan. */
export function SubmissionStage({
  claim,
  claimTypeLabel,
  hasReceipt,
  onPreview,
}: SubmissionStageProps) {
  const statusBadge = (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-950/60 dark:text-emerald-300">
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      Submitted
    </span>
  )

  return (
    <TimelineStage
      title="Claim Initialization & Submission"
      statusBadge={statusBadge}
      tone="success"
      connector={false}
      approverName={claim.employeeName}
      showViewButton={hasReceipt}
      onView={onPreview}
    >
      <StageBody date={claim.submittedAt}>
        <div className="flex items-center gap-2.5 min-h-8">
          <StageIconBadge icon={FileText} />
          <p className="text-sm font-bold text-heading">
            {claim.benefitName ||
              claim.tripProposalDescription ||
              claimTypeLabel}
          </p>
        </div>

        <NotesBox label="Claim Description">
          {getDescriptionText(claim)}
        </NotesBox>
      </StageBody>
    </TimelineStage>
  )
}

import { idNumberFormatter } from '#/lib/formatter'
import { CheckCircle2, FileCheck, XCircle } from 'lucide-react'
import {
  ChecklistRow,
  NotesBox,
  StageBody,
  StageIconBadge,
  TimelineStage,
} from './timeline-primitives'
import type { StageTone } from './timeline-primitives'
import type { ApprovalRecord, Claim } from '#/types/approval-action.type'

interface FinanceStageProps {
  claim: Claim
  approval?: ApprovalRecord
  isRejected: boolean
  hasReceipt: boolean
  onPreview: () => void
}

/** Tahap 3: verifikasi & pencairan oleh Finance (Level 2). */
export function FinanceStage({
  claim,
  approval,
  isRejected,
  hasReceipt,
  onPreview,
}: FinanceStageProps) {
  const isApproved = claim.status === 'Approved' || claim.status === 'Paid'
  const isPaid = claim.status === 'Paid'

  const tone: StageTone = isApproved
    ? 'success'
    : isRejected
      ? 'danger'
      : 'warning'

  const statusBadge = (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
        isPaid
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-950/60 dark:text-emerald-300'
          : isApproved
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-950/60 dark:text-emerald-300'
            : isRejected
              ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700/60 dark:bg-rose-950/60 dark:text-rose-300'
              : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-950/60 dark:text-amber-300'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isPaid || isApproved
            ? 'bg-emerald-500'
            : isRejected
              ? 'bg-rose-500'
              : 'bg-amber-500'
        }`}
      />
      {isPaid
        ? 'Paid'
        : isApproved
          ? 'Approved'
          : isRejected
            ? 'Rejected'
            : 'Pending'}
    </span>
  )

  return (
    <TimelineStage
      title="Finance Verification & Disbursement"
      statusBadge={statusBadge}
      tone={tone}
      approverName={approval?.approverName || 'Finance Officer'}
      showViewButton={hasReceipt}
      onView={onPreview}
    >
      <StageBody date={approval?.decidedAt}>
        <div className="flex items-center gap-2.5 pb-1">
          <StageIconBadge icon={FileCheck} />
          <div>
            <p className="text-sm font-bold text-heading leading-tight">
              Finance & Accounting Department
            </p>
            <p className="text-xs text-muted-foreground">
              Verification • {idNumberFormatter.format(claim.amount)}
            </p>
          </div>
        </div>

        <ChecklistRow
          dotClass={isRejected ? 'bg-rose-600' : 'bg-emerald-600'}
          label={<span>Benefit Quota & Budget Verification</span>}
        >
          {isApproved ? (
            <CheckCircle2
              className="h-4 w-4 text-emerald-600 shrink-0"
              aria-hidden="true"
            />
          ) : isRejected ? (
            <RejectedLabel />
          ) : (
            <span className="text-amber-700 dark:text-amber-400 font-semibold">
              In Review
            </span>
          )}
        </ChecklistRow>

        <ChecklistRow
          dotClass={
            isRejected
              ? 'bg-rose-600'
              : isPaid
                ? 'bg-emerald-600'
                : 'bg-sky-600'
          }
          label={<span>Payroll Disbursement Settlement</span>}
        >
          {isPaid ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Paid
            </span>
          ) : isRejected ? (
            <RejectedLabel />
          ) : (
            <span className="text-muted-foreground font-medium">
              {claim.status === 'Approved'
                ? 'Awaiting Disbursement'
                : 'Pending Approval'}
            </span>
          )}
        </ChecklistRow>

        {approval?.notes && (
          <NotesBox label="Finance Reviewer Notes">{approval.notes}</NotesBox>
        )}
      </StageBody>
    </TimelineStage>
  )
}

function RejectedLabel() {
  return (
    <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold">
      <XCircle className="h-4 w-4" aria-hidden="true" /> Rejected
    </span>
  )
}

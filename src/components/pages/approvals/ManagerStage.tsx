import { CheckCircle2, Download, FileText, XCircle } from 'lucide-react'
import {
  ChecklistRow,
  NotesBox,
  StageBody,
  StageIconBadge,
  TimelineStage,
} from './timeline-primitives'
import type { StageTone } from './timeline-primitives'
import type {
  ApprovalRecord,
  Claim,
  ReceiptInfo,
} from '#/types/approval-action.type'

interface ManagerStageProps {
  claim: Claim
  approval?: ApprovalRecord
  managerName: string
  isRejected: boolean
  receipt: ReceiptInfo
  onPreview: () => void
}

/** Tahap 2: pengumpulan dokumen & persetujuan manajer langsung (Level 1). */
export function ManagerStage({
  claim,
  approval,
  managerName,
  isRejected,
  receipt,
  onPreview,
}: ManagerStageProps) {
  const isApproved =
    approval?.decision === 'Approved' ||
    claim.status === 'UnderReview' ||
    claim.status === 'Approved' ||
    claim.status === 'Paid'

  const tone: StageTone = isApproved
    ? 'success'
    : isRejected
      ? 'danger'
      : 'warning'

  const statusBadge = (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
        isApproved
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-950/60 dark:text-emerald-300'
          : isRejected
            ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700/60 dark:bg-rose-950/60 dark:text-rose-300'
            : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-950/60 dark:text-amber-300'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isApproved
            ? 'bg-emerald-500'
            : isRejected
              ? 'bg-rose-500'
              : 'bg-amber-500'
        }`}
      />
      {isApproved
        ? 'Approved'
        : isRejected
          ? 'Rejected'
          : 'Pending'}
    </span>
  )

  return (
    <TimelineStage
      title="Document Collection & Manager Approval"
      statusBadge={statusBadge}
      tone={tone}
      approverName={managerName}
      showViewButton={receipt.hasFile}
      onView={onPreview}
    >
      <StageBody date={approval?.decidedAt}>
        <div className="flex items-center gap-2.5 min-h-8">
          <StageIconBadge icon={FileText} />
          <p className="text-sm font-bold text-heading">
            {claim.departmentName
              ? `${claim.departmentName} Manager`
              : 'Engineering Manager'}
          </p>
        </div>

        <ChecklistRow
          dotClass="bg-rose-500"
          truncate
          label={
            <span className="truncate">
              {receipt.fileName || 'Supporting Receipt Document'}
            </span>
          }
        >
          {receipt.hasFile ? (
            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href={receipt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Download
              </a>
              <CheckCircle2
                className="h-4 w-4 text-emerald-600"
                aria-hidden="true"
              />
            </div>
          ) : (
            <span className="text-muted-foreground">No file</span>
          )}
        </ChecklistRow>

        {approval?.notes && (
          <NotesBox label="Manager Notes">{approval.notes}</NotesBox>
        )}
      </StageBody>
    </TimelineStage>
  )
}

function DecisionLabel({ approval }: { approval?: ApprovalRecord }) {
  if (!approval) {
    return (
      <span className="text-amber-700 dark:text-amber-400 font-semibold">
        Awaiting Manager Review
      </span>
    )
  }

  if (approval.decision === 'Approved') {
    return (
      <span className="font-bold flex items-center gap-1">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        <span className="text-emerald-700 dark:text-emerald-400">Approved</span>
      </span>
    )
  }

  if (approval.decision === 'Rejected') {
    return (
      <span className="font-bold flex items-center gap-1">
        <XCircle className="h-4 w-4 text-rose-600" aria-hidden="true" />
        <span className="text-rose-700 dark:text-rose-400">Rejected</span>
      </span>
    )
  }

  return (
    <span className="font-bold flex items-center gap-1">
      <span className="text-amber-600">{approval.decision}</span>
    </span>
  )
}

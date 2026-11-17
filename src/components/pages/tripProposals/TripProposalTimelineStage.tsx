
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  Send,
  ShieldCheck,
  Wallet,
  XCircle,
} from 'lucide-react'

import {
  ChecklistRow,
  NotesBox,
  StageBody,
  StageIconBadge,
} from '#/components/pages/approvals/timeline-primitives'

import type { StageTone } from '#/components/pages/approvals/timeline-primitives'

import {
  formatCurrency,
  formatDecision,
  getInitials,
  getProcessTasks,
  getStageDepartment,
  getTaskDotClass,
  normalizeTimelineDecision,
} from '#/features/trip-proposals/utils/tripProposalTimelineUtils'

import type { ProposalTimelineItem } from '#/features/trip-proposals/utils/tripProposalTimelineUtils'

type Props = {
  stage: ProposalTimelineItem
  index: number
  totalStages: number
  attachmentUrl: string
  attachmentFileName: string
  canPreview: boolean
  onPreview: () => void
  onDownload: () => void | Promise<void>
}

export function TripProposalTimelineStage({
  stage,
  index,
  totalStages,
  attachmentUrl,
  attachmentFileName,
  canPreview,
  onPreview,
  onDownload,
}: Props) {
  const decision = normalizeTimelineDecision(stage.decision)

  const isPending = stage.isPending === true
  const isSubmitted = stage.isSubmission === true
  const isApproved = decision === 'approved'
  const isRejected = decision === 'rejected'
  const isNeedsRevision = decision === 'needsrevision'
  const isForwarded = decision === 'forwardedtofinancemanager'

  const stageStatus = isPending
    ? 'Pending'
    : isSubmitted
      ? 'Submitted'
      : formatDecision(stage.decision)

  const tone: StageTone =
    isApproved || isSubmitted
      ? 'success'
      : isRejected || isNeedsRevision
        ? 'danger'
        : 'warning'

  const approverName =
    stage.approverName?.trim() ||
    (
      isPending
        ? stage.approverRole || 'Pending approver'
        : 'Approver name unavailable'
    )

  const processTasks = getProcessTasks(stage)

  const hasAccommodationAdjustment =
    stage.accommodationAmountBefore !== undefined &&
    stage.accommodationAmountAfter !== undefined

  const accommodationDifference =
    hasAccommodationAdjustment
      ? stage.accommodationAmountAfter! -
        stage.accommodationAmountBefore!
      : 0

  return (
    <div className="relative">
      {/* Timeline Connector */}
      {index < totalStages - 1 && (
        <div className="pointer-events-none absolute -left-[25px] top-7 h-[calc(100%+1.5rem)] w-0.5 bg-border" />
      )}

      {/* Timeline Node */}
      <div
        className={`absolute -left-10 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
          tone === 'success'
            ? 'border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
            : tone === 'danger'
              ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-400'
              : 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400'
        }`}
      >
        {isPending ? (
          <Clock className="h-4 w-4" />
        ) : isSubmitted ? (
          <FileCheck className="h-4 w-4" />
        ) : isApproved ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : isRejected ? (
          <XCircle className="h-4 w-4" />
        ) : isNeedsRevision ? (
          <AlertTriangle className="h-4 w-4" />
        ) : isForwarded ? (
          <Send className="h-4 w-4" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
      </div>

      {/* Activity Card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-heading">
              {stage.title}
            </h3>

            <StatusBadge
              status={stageStatus}
              isPending={isPending}
              isApproved={isApproved || isSubmitted}
              isRejected={isRejected}
              isNeedsRevision={isNeedsRevision}
              isForwarded={isForwarded}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
                aria-hidden="true"
              >
                {getInitials(approverName)}
              </span>

              <span className="max-w-[180px] truncate">
                {approverName}
              </span>
            </div>

            {isSubmitted && attachmentUrl && (
              <button
                type="button"
                onClick={onPreview}
                disabled={!canPreview}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-heading transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eye className="h-3.5 w-3.5" />
                View
              </button>
            )}
          </div>
        </div>

        {/* Card Body */}
        <StageBody date={stage.decidedAt}>
          {/* Main Activity Information */}
          <div className="flex min-h-8 items-center gap-2.5">
            <StageIconBadge
              icon={
                isSubmitted
                  ? FileText
                  : stage.approvalLevel === 2
                    ? Wallet
                    : stage.approvalLevel === 3
                      ? ShieldCheck
                      : FileCheck
              }
            />

            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight text-heading">
                {getStageDepartment(stage)}
              </p>

              {stage.approverRole && (
                <p className="text-xs text-muted-foreground">
                  {stage.approverRole}
                </p>
              )}
            </div>
          </div>

          {/* Process Checklist */}
          {processTasks.map((task) => (
            <ChecklistRow
              key={task.title}
              dotClass={getTaskDotClass(task.status)}
              label={task.title}
            >
              <TaskStatusLabel status={task.status} />
            </ChecklistRow>
          ))}

          {/* Submission Attachment */}
          {isSubmitted && (
            <ChecklistRow
              dotClass={
                attachmentUrl ? 'bg-emerald-600' : 'bg-rose-600'
              }
              label={
                <span className="truncate">
                  {attachmentFileName || 'Proposal Letter'}
                </span>
              }
              truncate
            >
              {attachmentUrl ? (
                <div className="flex shrink-0 items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => void onDownload()}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>

                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                </div>
              ) : (
                <span className="text-muted-foreground">
                  No file
                </span>
              )}
            </ChecklistRow>
          )}

          {/* Accommodation Budget Adjustment */}
          {hasAccommodationAdjustment && (
            <div className="space-y-2 rounded-lg border border-sky-200 bg-sky-50/70 p-3 dark:border-sky-900 dark:bg-sky-950/30">
              <p className="text-xs font-bold text-sky-900 dark:text-sky-200">
                Accommodation Budget Adjustment
              </p>

              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">
                  Previous Budget
                </span>

                <span className="font-semibold text-heading">
                  {formatCurrency(stage.accommodationAmountBefore!)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">
                  Approved Budget
                </span>

                <span className="font-semibold text-heading">
                  {formatCurrency(stage.accommodationAmountAfter!)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-sky-200 pt-2 text-xs dark:border-sky-900">
                <span className="text-muted-foreground">
                  Budget Difference
                </span>

                <span className="font-bold text-heading">
                  {accommodationDifference >= 0 ? '+' : '-'}
                  {formatCurrency(Math.abs(accommodationDifference))}
                </span>
              </div>
            </div>
          )}

          {/* Reviewer Notes */}
          {stage.notes && (
            <NotesBox label="Reviewer Notes">
              {stage.notes}
            </NotesBox>
          )}
        </StageBody>
      </div>
    </div>
  )
}

/* Status Badge */
function StatusBadge({
  status,
  isPending,
  isApproved,
  isRejected,
  isNeedsRevision,
  isForwarded,
}: {
  status: string
  isPending: boolean
  isApproved: boolean
  isRejected: boolean
  isNeedsRevision: boolean
  isForwarded: boolean
}) {
  const className = isPending
    ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/60 dark:bg-amber-950/60 dark:text-amber-300'
    : isApproved
      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-950/60 dark:text-emerald-300'
      : isRejected
        ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700/60 dark:bg-rose-950/60 dark:text-rose-300'
        : isNeedsRevision
          ? 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700/60 dark:bg-purple-950/60 dark:text-purple-300'
          : isForwarded
            ? 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700/60 dark:bg-sky-950/60 dark:text-sky-300'
            : 'border-border bg-muted text-muted-foreground'

  const dotClass = isPending
    ? 'bg-amber-500'
    : isApproved
      ? 'bg-emerald-500'
      : isRejected
        ? 'bg-rose-500'
        : isNeedsRevision
          ? 'bg-purple-500'
          : isForwarded
            ? 'bg-sky-500'
            : 'bg-muted-foreground'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      {status}
    </span>
  )
}

/* Checklist Status Label */
function TaskStatusLabel({ status }: { status: string }) {
  if (status === 'Completed') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4" />
        Completed
      </span>
    )
  }

  if (status === 'Rejected') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-rose-700 dark:text-rose-400">
        <XCircle className="h-4 w-4" />
        Rejected
      </span>
    )
  }

  if (status === 'Needs Revision') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-purple-700 dark:text-purple-400">
        <AlertTriangle className="h-4 w-4" />
        Needs Revision
      </span>
    )
  }

  if (status === 'Forwarded') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-sky-700 dark:text-sky-400">
        <Send className="h-4 w-4" />
        Forwarded
      </span>
    )
  }

  if (status === 'Skipped') {
    return (
      <span className="shrink-0 font-semibold text-muted-foreground">
        Skipped
      </span>
    )
  }

  return (
    <span className="shrink-0 font-semibold text-amber-700 dark:text-amber-400">
      {status}
    </span>
  )
}

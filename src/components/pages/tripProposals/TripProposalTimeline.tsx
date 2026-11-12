
import { useState } from 'react'

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

import { getProposalStatusConfig } from '#/types/tripProposals.type'
import { Button } from '#/components/ui/button'
import { downloadFile } from '#/lib/download'
import {
  ChecklistRow,
  NotesBox,
  StageBody,
  StageIconBadge,
} from '#/components/pages/approvals/timeline-primitives'

import type { StageTone } from '#/components/pages/approvals/timeline-primitives'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

export type ProposalTimelineItem = {
  id: string
  title: string
  approverName: string
  approverRole?: string
  decision: string
  approvalLevel: number | null
  decidedAt: string
  notes: string | null
  accommodationAmountBefore?: number
  accommodationAmountAfter?: number
  isPending?: boolean
  isSubmission?: boolean
}

type ProcessTask = {
  title: string
  status: string
}

type Props = {
  stages: ProposalTimelineItem[]
  attachmentUrl: string
  attachmentFileName: string
  isPdf: boolean
  status?: string
  actions?: React.ReactNode
  claimCard?: React.ReactNode
}

export function TripProposalTimeline({
  stages,
  attachmentUrl,
  attachmentFileName,
  isPdf,
  status,
  actions,
  claimCard,
}: Props) {
  const statusConfig = getProposalStatusConfig(status)
  const [previewOpen, setPreviewOpen] = useState(false)

  const isImage = /\.(jpg|jpeg|png|webp|gif)(?:[?#].*)?$/i.test(
    attachmentFileName,
  )

  const canPreview = isPdf || isImage

  const previewUrl = attachmentUrl
    ? `${attachmentUrl}${attachmentUrl.includes('#') ? '&' : '#'}toolbar=0&navpanes=0&scrollbar=0&view=FitH`
    : ''

  const handleDownload = async () => {
    if (!attachmentUrl) return

    await downloadFile(
      attachmentUrl,
      attachmentFileName || 'proposal-attachment',
    )
  }

  return (
    <>
      <section className="space-y-6 bg-muted/10 p-5 lg:col-span-8 lg:p-8">
        {/* Trip Process Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-heading">
              Trip Process
            </h2>

            {status && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-semibold ${statusConfig.className}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${statusConfig.dotColor}`}
                />

                {statusConfig.label}
              </span>
            )}
          </div>

          {actions && (
            <div className="flex flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>

        {/* Approval Timeline */}
        <div className="relative space-y-6 pl-10">
          {/* Claim Card */}
          {claimCard && (
            <div className="relative">
              {stages.length > 0 && (
                <div className="pointer-events-none absolute -left-[25px] top-7 h-[calc(100%+24px)] w-0.5 bg-border" />
              )}

              <div className="absolute -left-10 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>

              {claimCard}
            </div>
          )}

          {stages.map((stage, index) => {
            const decision = stage.decision
              .toLowerCase()
              .replace(/[\s_-]/g, '')

            const isPending = stage.isPending === true
            const isSubmitted = stage.isSubmission === true
            const isApproved = decision === 'approved'
            const isRejected = decision === 'rejected'
            const isNeedsRevision = decision === 'needsrevision'
            const isForwarded =
              decision === 'forwardedtofinancemanager'

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
              (isPending
                ? stage.approverRole || 'Pending approver'
                : 'Approver name unavailable')

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
              <div key={stage.id} className="relative">
                {/* Timeline Connector */}
                {index < stages.length - 1 && (
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
                  {/* Card Header - Sama dengan Claims */}
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
                          onClick={() => setPreviewOpen(true)}
                          disabled={!canPreview}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-semibold text-heading transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Body - Menggunakan StageBody milik Claims */}
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

                    {/* Compact Process Checklist */}
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
                              onClick={() => void handleDownload()}
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
                            {formatCurrency(
                              stage.accommodationAmountBefore!,
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-muted-foreground">
                            Approved Budget
                          </span>

                          <span className="font-semibold text-heading">
                            {formatCurrency(
                              stage.accommodationAmountAfter!,
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t border-sky-200 pt-2 text-xs dark:border-sky-900">
                          <span className="text-muted-foreground">
                            Budget Difference
                          </span>

                          <span className="font-bold text-heading">
                            {accommodationDifference >= 0 ? '+' : '-'}
                            {formatCurrency(
                              Math.abs(accommodationDifference),
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Reviewer Notes - Sama dengan Claims */}
                    {stage.notes && (
                      <NotesBox label="Reviewer Notes">
                        {stage.notes}
                      </NotesBox>
                    )}
                  </StageBody>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex h-[92vh] w-[96vw] !max-w-[1400px] flex-col gap-3">
          <DialogHeader>
            <DialogTitle className="truncate">
              {attachmentFileName}
            </DialogTitle>

            <DialogDescription>
              Trip proposal document preview.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-muted/20">
            {previewOpen &&
              attachmentUrl &&
              (isPdf ? (
                <iframe
                  src={previewUrl}
                  title="Trip Proposal PDF Preview"
                  className="h-full w-full"
                />
              ) : isImage ? (
                <img
                  src={attachmentUrl}
                  alt="Trip proposal attachment"
                  className="h-full w-full object-contain"
                />
              ) : null)}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              className="gap-2"
              onClick={() => void handleDownload()}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
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

/* Process Checklist */
function getProcessTasks(stage: ProposalTimelineItem): ProcessTask[] {
  if (stage.isSubmission) {
    return []
  }

  const decision = stage.decision
    .toLowerCase()
    .replace(/[\s_-]/g, '')

  let currentStatus = 'Pending Approval'

  if (stage.isPending) {
    currentStatus =
      stage.approvalLevel === 2 ? 'In Review' : 'Pending Approval'
  } else if (decision === 'approved') {
    currentStatus = 'Completed'
  } else if (decision === 'rejected') {
    currentStatus = 'Rejected'
  } else if (decision === 'needsrevision') {
    currentStatus = 'Needs Revision'
  } else if (decision === 'forwardedtofinancemanager') {
    currentStatus = 'Forwarded'
  }

  if (stage.approvalLevel === 1) {
    return [
      {
        title: 'Proposal Document Collection',
        status: 'Completed',
      },
      {
        title: 'Manager Approval',
        status: currentStatus,
      },
    ]
  }

  if (stage.approvalLevel === 2) {
    return [
      {
        title: 'Accommodation & Travel Budget Verification',
        status: currentStatus,
      },
      {
        title: 'Participant Reimbursement Limit Allocation',
        status: currentStatus,
      },
    ]
  }

  if (stage.approvalLevel === 3) {
    return [
      {
        title: 'Final Budget Review',
        status: currentStatus,
      },
    ]
  }

  return []
}

function getStageDepartment(stage: ProposalTimelineItem): string {
  if (stage.isSubmission) {
    return 'Proposal Submission'
  }

  if (stage.approvalLevel === 2 || stage.approvalLevel === 3) {
    return 'Finance & Accounting Department'
  }

  return 'Manager Review'
}

function getTaskDotClass(status: string): string {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-600'
    case 'Rejected':
      return 'bg-rose-600'
    case 'Needs Revision':
      return 'bg-purple-600'
    case 'Forwarded':
      return 'bg-sky-600'
    default:
      return 'bg-amber-500'
  }
}

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

  return (
    <span className="shrink-0 font-semibold text-amber-700 dark:text-amber-400">
      {status}
    </span>
  )
}

function getInitials(name?: string | null) {
  if (!name) return 'U'

  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDecision(decision: string) {
  const norm = decision.toLowerCase().replace(/[\s_-]/g, '')

  if (norm === 'needsrevision') {
    return 'Needs Revision'
  }

  if (norm === 'forwardedtofinancemanager') {
    return 'Forwarded to Finance Manager'
  }

  return decision
}

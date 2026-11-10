import { useState } from 'react'

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  XCircle,
} from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
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
  decision: string
  approvalLevel: number | null
  decidedAt: string
  notes: string | null
  isPending?: boolean
  isSubmission?: boolean
}

type Props = {
  stages: ProposalTimelineItem[]
  attachmentUrl: string
  attachmentFileName: string
  isPdf: boolean
}

export function TripProposalTimeline({
  stages,
  attachmentUrl,
  attachmentFileName,
  isPdf,
}: Props) {
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

    try {
      await downloadAttachment(attachmentUrl, attachmentFileName)
    } catch (error) {
      console.error('Failed to download proposal attachment:', error)
    }
  }

  return (
    <>
      <section className="space-y-6 bg-muted/10 p-5 lg:col-span-8 lg:p-8 xl:col-span-9">
        <div className="border-b border-border pb-5">
          <h2 className="text-lg font-bold">
            Trip Process
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Track the submission and approval progress of this proposal.
          </p>
        </div>

        <div className="relative space-y-6 pl-10">
          {stages.map((stage, index) => {
            const decision = stage.decision
              .toLowerCase()
              .replace(/\s/g, '')

            const isPending = stage.isPending === true
            const isSubmitted = stage.isSubmission === true
            const isApproved = decision === 'approved'
            const isRejected = decision === 'rejected'
            const isNeedsRevision = decision === 'needsrevision'

            const dateInfo = getDateParts(stage.decidedAt)

            return (
              <div key={stage.id} className="relative">

                {/* Garis hanya menghubungkan node ke aktivitas berikutnya. */}
                {index < stages.length - 1 && (
                  <div
                    className="pointer-events-none absolute -left-[25px] top-7 h-[calc(100%+24px)] w-0.5 bg-border"
                  />
                )}

                {/* Node timeline. */}
                <div
                  className={`absolute -left-10 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    isPending
                      ? 'border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-700 dark:bg-amber-950'
                      : isApproved || isSubmitted
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-700 dark:bg-emerald-950'
                        : isRejected
                          ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-700 dark:bg-rose-950'
                          : isNeedsRevision
                            ? 'border-purple-300 bg-purple-50 text-purple-600 dark:border-purple-700 dark:bg-purple-950'
                            : 'border-border bg-muted text-muted-foreground'
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
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </div>

                {/* Card aktivitas. */}
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                    <h3 className="text-sm font-bold">
                      {stage.title}
                    </h3>

                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                        {getInitials(stage.approverName)}
                      </span>

                      <span className="text-xs font-medium text-muted-foreground">
                        {stage.approverName}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-4 p-5 sm:flex-row">

                    {/* Tanggal atau status pending. */}
                    <div
                      className={`w-full shrink-0 rounded-lg border p-3 text-center sm:w-28 ${
                        isPending
                          ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40'
                          : 'border-sky-200 bg-sky-50/90 dark:border-sky-900 dark:bg-sky-950/40'
                      }`}
                    >
                      {isPending ? (
                        <>
                          <Clock className="mx-auto h-6 w-6 text-amber-600 dark:text-amber-400" />

                          <p className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                            Pending
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-2xl font-extrabold leading-none text-sky-950 dark:text-sky-200">
                            {dateInfo.day}
                          </p>

                          <p className="mt-1 border-b border-sky-200 pb-2 text-sm font-semibold text-sky-800 dark:border-sky-800 dark:text-sky-300">
                            {dateInfo.monthYear}
                          </p>

                          <p className="pt-2 text-xs font-semibold text-sky-950 dark:text-sky-200">
                            {dateInfo.time}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="w-full flex-1 space-y-3">

                      {/* Detail aktivitas. */}
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-primary">
                          {isSubmitted ? (
                            <FileCheck className="h-4 w-4" />
                          ) : isPending ? (
                            <Clock className="h-4 w-4" />
                          ) : isApproved ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : isRejected ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold">
                            {isSubmitted
                              ? 'Proposal successfully submitted'
                              : isPending
                                ? `Waiting for ${stage.approverName}`
                                : formatDecision(stage.decision)}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {isSubmitted
                              ? 'Initial proposal submission'
                              : stage.approvalLevel
                                ? `Approval Level ${stage.approvalLevel}`
                                : 'Proposal process'}
                          </p>
                        </div>
                      </div>

                      {/* Keputusan approval. */}
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/40 px-3.5 py-2.5 text-xs">
                        <span className="font-semibold">
                          {isSubmitted
                            ? 'Submission Status'
                            : 'Approval Decision'}
                        </span>

                        <Badge
                          variant="outline"
                          className={
                            isPending
                              ? 'border-amber-300 text-amber-700 dark:text-amber-300'
                              : isApproved || isSubmitted
                                ? 'border-emerald-300 text-emerald-700 dark:text-emerald-300'
                                : isRejected
                                  ? 'border-rose-300 text-rose-700 dark:text-rose-300'
                                  : isNeedsRevision
                                    ? 'border-purple-300 text-purple-700 dark:text-purple-300'
                                    : ''
                          }
                        >
                          {isPending
                            ? 'Pending'
                            : formatDecision(stage.decision)}
                        </Badge>
                      </div>

                      {/* Attachment pada aktivitas submission. */}
                      {isSubmitted && (
                        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-muted/20 p-2">
                          <div className="shrink-0 rounded-md bg-primary/10 p-2 text-primary">
                            <FileText className="h-5 w-5" />
                          </div>

                          <p className="min-w-0 flex-1 truncate text-xs font-medium">
                            {attachmentFileName || 'No attachment uploaded'}
                          </p>

                          {attachmentUrl && (
                            <div className="flex shrink-0 items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Preview document"
                                disabled={!canPreview}
                                onClick={() => setPreviewOpen(true)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Download document"
                                onClick={() => void handleDownload()}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Catatan reviewer. */}
                      {stage.notes && (
                        <div className="space-y-1 rounded-lg border border-border/60 bg-muted/40 p-3.5">
                          <p className="text-xs text-muted-foreground">
                            Reviewer Notes
                          </p>

                          <p className="whitespace-pre-wrap text-xs font-medium leading-relaxed">
                            {stage.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Modal preview dari timeline. */}
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
            {previewOpen && attachmentUrl && (
              isPdf ? (
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
              ) : null
            )}
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

async function downloadAttachment(url: string, fileName: string) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`)
  }

  const blob = await response.blob()
  const objectUrl = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName || 'proposal-attachment'

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl)
  }, 1000)
}

function getInitials(name?: string | null) {
  if (!name) return 'U'

  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function formatDecision(decision: string) {
  if (decision.toLowerCase().replace(/\s/g, '') === 'needsrevision') {
    return 'Needs Revision'
  }

  return decision
}

function getDateParts(value: string) {
  if (!value) {
    return {
      day: '-',
      monthYear: '-',
      time: '-',
    }
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return {
      day: '-',
      monthYear: '-',
      time: '-',
    }
  }

  return {
    day: date.getDate().toString(),
    monthYear: date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  }
}
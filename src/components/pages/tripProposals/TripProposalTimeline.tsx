import { useState } from 'react'

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
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
  approverName: string
  decision: string
  approvalLevel: number | null
  decidedAt: string
  isPending?: boolean
}

type Props = {
  activities: ProposalTimelineItem[]
  attachmentUrl: string
  attachmentFileName: string
  isPdf: boolean
}

export function TripProposalTimeline({
  activities,
  attachmentUrl,
  attachmentFileName,
}: Props) {
  const [previewOpen, setPreviewOpen] = useState(false)

  // Menyembunyikan toolbar bawaan PDF Viewer.
  const previewUrl = attachmentUrl
    ? `${attachmentUrl}${attachmentUrl.includes('#') ? '&' : '#'}toolbar=0&navpanes=0&scrollbar=0`
    : ''

  return (
    <>
      {/* Timeline proses proposal. */}
      <section className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold">Trip Process</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Submission and approval activities for this proposal.
          </p>
        </div>

        {activities.length > 0 ? (
          <div className="relative space-y-5 before:absolute before:bottom-4 before:left-[88px] before:top-4 before:w-px before:bg-border">
            {activities.map((activity) => {
              const decision = activity.decision
                .toLowerCase()
                .replace(/\s/g, '')

              const isSubmitted = decision === 'submitted'
              const isApproved = decision === 'approved'
              const isRejected = decision === 'rejected'
              const isNeedsRevision = decision === 'needsrevision'
              const isPending = activity.isPending === true

              const date = getDateParts(activity.decidedAt)

              return (
                <div
                  key={activity.id}
                  className="relative grid grid-cols-[68px_24px_minmax(0,1fr)] gap-2"
                >
                  {/* Tanggal aktivitas. */}
                {/* Pending menggunakan jam, aktivitas selesai menggunakan tanggal. */}
<div className="h-fit overflow-hidden rounded-lg border border-border bg-card text-center">
  {isPending ? (
    <div className="flex flex-col items-center justify-center gap-1 px-2 py-4">
      <Clock3 className="h-5 w-5 text-amber-600" />
      <p className="text-[10px] font-bold text-amber-600">
        Pending
      </p>
    </div>
  ) : (
    <>
      <div className="bg-primary/10 px-2 py-1.5">
        <p className="text-xs font-bold text-primary">
          {date.day}
        </p>
      </div>

      <div className="px-2 py-2">
        <p className="text-xs font-semibold text-muted-foreground">
          {date.monthYear}
        </p>

        <p className="mt-2 border-t border-border pt-2 text-[10px] font-semibold">
          {date.time}
        </p>
      </div>
    </>
  )}
</div>

{/* Icon aktivitas. */}
<div className="relative z-10 flex justify-center">
  <div
    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-background ${
      isPending
        ? 'bg-amber-500/15 text-amber-600'
        : isSubmitted
          ? 'bg-primary/15 text-primary'
          : isApproved
            ? 'bg-emerald-500/15 text-emerald-600'
            : isRejected
              ? 'bg-destructive/15 text-destructive'
              : isNeedsRevision
                ? 'bg-purple-500/15 text-purple-600'
                : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isPending ? (
                      <Clock3 className="h-4 w-4" />
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
                </div>

                  {/* Detail aktivitas. */}
                  <div className="min-w-0 rounded-xl border border-border p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold">
                          {isPending
                              ? `${activity.approverName} Approval`
                              : isSubmitted
                                ? 'Proposal Submitted'
                                : activity.approverName || 'Approver'}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {isPending
                                  ? 'Waiting for approval'
                                  : isSubmitted
                                    ? `Submitted by ${activity.approverName}`
                                    : activity.approvalLevel
                                      ? `Approval Level ${activity.approvalLevel}`
                                      : 'Proposal activity'}
                        </p>
                      </div>

                      <Badge
                                  variant="outline"
                                  color={isPending ? 'warning' : undefined}
                                >
                                  {isPending ? 'Pending' : formatDecision(activity.decision)}
                                </Badge>
                    </div>

                    {/* Attachment pada aktivitas Submitted. */}
                    {isSubmitted && (
                      <div className="mt-4 flex min-w-0 items-center gap-2 rounded-lg border border-border bg-muted/20 p-2">
                        <div className="shrink-0 rounded-md bg-primary/10 p-2 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>

                        <p className="min-w-0 flex-1 truncate text-xs font-medium">
                          {attachmentFileName || 'No attachment'}
                        </p>

                        {attachmentUrl && (
                          <div className="flex shrink-0 items-center gap-1">
                            {/* Membuka modal preview PDF. */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Preview PDF"
                              onClick={() => setPreviewOpen(true)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {/* Download attachment. */}
                            <a
                              href={attachmentUrl}
                              download={attachmentFileName}
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {!isSubmitted && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        {activity.decidedAt
                          ? formatDateTime(activity.decidedAt)
                          : '-'}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No proposal activities recorded yet.
          </div>
        )}
      </section>

      {/* Modal preview PDF. */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex h-[94vh] w-[96vw] max-w-[1400px] flex-col gap-3 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="truncate">
              {attachmentFileName}
            </DialogTitle>

            <DialogDescription>
              Trip proposal document preview.
            </DialogDescription>
          </DialogHeader>

          {/* Area preview dibuat lebih luas. */}
          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-muted/20">
            {previewOpen && attachmentUrl && (
              <iframe
                src={previewUrl}
                title="Trip Proposal PDF Preview"
                className="h-full w-full"
              />
            )}
          </div>

          {/* Tombol download milik aplikasi. */}
          <div className="flex justify-end">
            <a href={attachmentUrl} download={attachmentFileName}>
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Mengubah nama keputusan agar lebih mudah dibaca.
function formatDecision(decision: string) {
  const normalized = decision.toLowerCase().replace(/\s/g, '')

  if (normalized === 'needsrevision') {
    return 'Needs Revision'
  }

  return decision
}

// Mengambil tanggal tanpa ordinal suffix (10, bukan 10th).
function getDateParts(value: string) {
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
    }),
  }
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
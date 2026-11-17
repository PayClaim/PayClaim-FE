import { useState } from 'react'

import {
  Download,
  Eye,
  FileText,
  Users,
} from 'lucide-react'

import type { TripProposalDetailResponse } from '#/types/tripProposals.type'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { CollapsiblePanel } from '#/components/ui/collapsible-panel'
import { downloadFile } from '#/lib/download'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

type Props = {
  proposal: TripProposalDetailResponse
  attachmentUrl: string
  attachmentFileName: string
  isPdf: boolean
}

export function TripProposalSidebar({
  proposal,
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
    await downloadFile(attachmentUrl, attachmentFileName || 'proposal-attachment')
  }

  return (
    <>
      <aside className="flex flex-col border-b border-border bg-card lg:col-span-4 lg:border-b-0 lg:border-r xl:col-span-3">

        {/* Description dan dokumen proposal. */}
        <div className="space-y-5 p-5 sm:p-6">
          <section className="space-y-3">
            <h2 className="text-base font-bold">
              Proposal Description
            </h2>

            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {proposal.description || 'No description provided.'}
            </p>
          </section>

          <CollapsiblePanel
            className="border-t border-border pt-5"
            headerClassName="gap-2"
            contentClassName="space-y-2 pt-3"
            title="Proposal Letter"
            actions={
              attachmentUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => void handleDownload()}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              ) : undefined
            }
          >
            {attachmentUrl ? (
              <div className="space-y-2">
                {/* Thumbnail dokumen. */}
                <button
                  type="button"
                  disabled={!canPreview}
                  onClick={() => setPreviewOpen(true)}
                  className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted/30"
                >
                  {isPdf ? (
                    <iframe
                      src={previewUrl}
                      title="Proposal PDF Thumbnail"
                      className="pointer-events-none h-full w-full"
                    />
                  ) : isImage ? (
                    <img
                      src={attachmentUrl}
                      alt="Proposal attachment"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3">
                      <FileText className="h-12 w-12 text-primary" />

                      <p className="px-4 text-xs font-medium">
                        {attachmentFileName}
                      </p>
                    </div>
                  )}

                  {canPreview && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Eye className="h-5 w-5" />
                      Preview Document
                    </div>
                  )}
                </button>

                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />

                  <p className="truncate text-xs font-medium">
                    {attachmentFileName}
                  </p>

                  {isPdf && (
                    <Badge variant="outline" className="ml-auto shrink-0">
                      PDF
                    </Badge>
                  )}
                </div>

                {!canPreview && (
                  <p className="text-xs text-muted-foreground">
                    Preview is not available for this file type.
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />

                <p className="text-xs text-muted-foreground">
                  No proposal attachment uploaded.
                </p>
              </div>
            )}
          </CollapsiblePanel>
        </div>

        {/* Daftar peserta perjalanan. */}
        <CollapsiblePanel
          className="border-t border-border p-5 sm:p-6"
          contentClassName="pt-4"
          title={
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Participants
            </span>
          }
          actions={
            <Badge variant="outline">
              {proposal.participants.length}
            </Badge>
          }
        >
          <div className="max-h-[480px] divide-y divide-border overflow-y-auto">
            {proposal.participants.map((participant) => (
              <div
                key={participant.employeeId}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold">
                      {participant.employeeName || 'Unknown Employee'}
                    </p>

                    {participant.isPic && (
                      <Badge color="info">
                        PIC
                      </Badge>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {participant.employeeNumber || '-'}
                  </p>
                </div>

                <p className="shrink-0 text-right text-xs font-semibold">
                  {formatCurrency(participant.amount)}
                </p>
              </div>
            ))}

            {proposal.participants.length === 0 && (
              <p className="py-5 text-center text-xs text-muted-foreground">
                No participants found.
              </p>
            )}
          </div>
        </CollapsiblePanel>
      </aside>

      {/* Modal preview dokumen. */}
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
                  title="Full Proposal PDF Preview"
                  className="h-full w-full"
                />
              ) : isImage ? (
                <img
                  src={attachmentUrl}
                  alt="Full proposal attachment"
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}
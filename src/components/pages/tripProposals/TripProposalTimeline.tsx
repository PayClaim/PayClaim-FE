
import { useState } from 'react'

import { getProposalStatusConfig } from '#/types/tripProposals.type'

import { downloadFile } from '#/lib/download'

import { TripProposalTimelineStage } from '#/components/pages/tripProposals/TripProposalTimelineStage'
import { TripProposalDocumentPreview } from '#/components/pages/tripProposals/TripProposalDocumentPreview'

import { isImageAttachment } from '#/features/trip-proposals/utils/tripProposalTimelineUtils'

import type { ProposalTimelineItem } from '#/features/trip-proposals/utils/tripProposalTimelineUtils'

export type { ProposalTimelineItem } from '#/features/trip-proposals/utils/tripProposalTimelineUtils'

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

  const isImage = isImageAttachment(attachmentFileName)

  const canPreview = isPdf || isImage

  const handleDownload = async () => {
    if (!attachmentUrl) return

    await downloadFile(
      attachmentUrl,
      attachmentFileName || 'proposal-attachment',
    )
  }

  return (
    <>
      <section className="min-w-0 space-y-6 bg-muted/10 p-5 lg:col-span-8 lg:p-8 xl:col-span-9">
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
        <div className="relative space-y-6 pl-10 timeline-stagger">
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

          {stages.map((stage, index) => (
            <TripProposalTimelineStage
              key={stage.id}
              stage={stage}
              index={index}
              totalStages={stages.length}
              attachmentUrl={attachmentUrl}
              attachmentFileName={attachmentFileName}
              canPreview={canPreview}
              onPreview={() => setPreviewOpen(true)}
              onDownload={handleDownload}
            />
          ))}
        </div>
      </section>

      {/* Document Preview */}
      <TripProposalDocumentPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        attachmentUrl={attachmentUrl}
        attachmentFileName={attachmentFileName}
        isPdf={isPdf}
        isImage={isImage}
        onDownload={handleDownload}
      />
    </>
  )
}

import { Download, Eye, FileText } from 'lucide-react'
import type { Claim, ReceiptInfo } from '#/types/approval-action.type'

interface ReceiptAttachmentCardProps {
  claim: Claim
  receipt: ReceiptInfo
  onPreview: () => void
}

export function ReceiptAttachmentCard({
  claim,
  receipt,
  onPreview,
}: ReceiptAttachmentCardProps) {
  if (!receipt.hasFile) {
    return (
      <div className="rounded-xl border border-border bg-muted/10 p-4 text-xs text-muted-foreground text-center">
        No receipt attachment uploaded.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-heading">
          Receipt Attachment
        </span>
        <a
          href={receipt.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Download
        </a>
      </div>

      {receipt.isImage ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={onPreview}
            className="group relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted/40 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
            aria-label="Open full receipt image preview"
          >
            <img
              src={receipt.url}
              alt={`Receipt uploaded by ${claim.employeeName}`}
              width={320}
              height={180}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
              <Eye className="h-4 w-4" aria-hidden="true" /> Click to enlarge
            </span>
          </button>
          <p className="text-xs text-muted-foreground truncate">
            {receipt.fileName}
          </p>
        </div>
      ) : receipt.isPdf ? (
        <div className="space-y-2">
          <div className="group relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted/30">
            <iframe
              src={`${receipt.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              title="PDF Receipt Attachment Thumbnail"
              className="w-full h-full pointer-events-none"
            />
            <button
              type="button"
              onClick={onPreview}
              className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 cursor-pointer backdrop-blur-2xs"
              aria-label="Open full receipt PDF preview"
            >
              <Eye className="h-4 w-4" aria-hidden="true" /> View PDF Fullscreen
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">{receipt.fileName}</span>
            <span className="shrink-0 text-2xs uppercase px-1.5 py-0.5 rounded-sm bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold ml-2">
              PDF
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText
              className="h-6 w-6 text-primary shrink-0"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-heading truncate">
                {receipt.fileName}
              </p>
              <p className="text-xs text-muted-foreground">
                Supporting Document
              </p>
            </div>
          </div>
          <a
            href={receipt.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline shrink-0 ml-2"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Open
          </a>
        </div>
      )}
    </div>
  )
}

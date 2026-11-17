
import { Download } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  attachmentUrl: string
  attachmentFileName: string
  isPdf: boolean
  isImage: boolean
  onDownload: () => void | Promise<void>
}

export function TripProposalDocumentPreview({
  open,
  onOpenChange,
  attachmentUrl,
  attachmentFileName,
  isPdf,
  isImage,
  onDownload,
}: Props) {
  const previewUrl = attachmentUrl
    ? `${attachmentUrl}${attachmentUrl.includes('#') ? '&' : '#'}toolbar=0&navpanes=0&scrollbar=0&view=FitH`
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          {open &&
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
            onClick={() => void onDownload()}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

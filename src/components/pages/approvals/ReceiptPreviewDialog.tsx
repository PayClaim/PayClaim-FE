import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Download, FileText } from 'lucide-react'
import { downloadFile } from '#/lib/download'
import type { ReceiptInfo } from '#/types/approval-action.type'

interface ReceiptPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receipt: ReceiptInfo
  employeeName: string
}

export function ReceiptPreviewDialog({
  open,
  onOpenChange,
  receipt,
  employeeName,
}: ReceiptPreviewDialogProps) {
  const previewUrl = receipt.url
    ? `${receipt.url}${receipt.url.includes('#') ? '&' : '#'}toolbar=0&navpanes=0&scrollbar=0&view=FitH`
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] w-[96vw] !max-w-[1400px] flex-col gap-3">
        <DialogHeader>
          <DialogTitle className="truncate">
            {receipt.fileName || 'Receipt Attachment'}
          </DialogTitle>
          <DialogDescription>
            Receipt attachment preview • Uploaded by {employeeName}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-muted/20">
          {open && receipt.url && (
            receipt.isImage ? (
              <img
                src={receipt.url}
                alt={`Full receipt uploaded by ${employeeName}`}
                className="h-full w-full object-contain"
              />
            ) : receipt.isPdf ? (
              <iframe
                src={previewUrl}
                title="Full PDF Receipt"
                className="h-full w-full"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center space-y-3">
                <FileText
                  className="h-12 w-12 text-primary mx-auto"
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold text-heading">
                  {receipt.fileName}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    void downloadFile(
                      receipt.url,
                      receipt.fileName || 'receipt-attachment',
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline cursor-pointer"
                >
                  <Download className="h-4 w-4" aria-hidden="true" /> Download
                  Document
                </button>
              </div>
            )
          )}
        </div>
        <DialogFooter>
          {receipt.hasFile && (
            <Button
              type="button"
              onClick={() =>
                void downloadFile(
                  receipt.url,
                  receipt.fileName || 'receipt-attachment',
                )
              }
              className="gap-1.5 cursor-pointer"
            >
              <Download className="h-4 w-4" aria-hidden="true" /> Download
              Original
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

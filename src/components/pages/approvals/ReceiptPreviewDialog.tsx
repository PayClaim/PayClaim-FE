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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Receipt Attachment Preview</DialogTitle>
          <DialogDescription>
            {receipt.fileName} • Uploaded by {employeeName}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 flex items-center justify-center bg-muted/20 rounded-lg border border-border overflow-hidden min-h-64 max-h-[75vh]">
          {receipt.isImage ? (
            <img
              src={receipt.url}
              alt={`Full receipt uploaded by ${employeeName}`}
              width={800}
              height={600}
              className="max-h-[70vh] w-auto object-contain"
            />
          ) : receipt.isPdf ? (
            <iframe
              src={receipt.url}
              title="Full PDF Receipt"
              className="w-full h-[70vh] rounded border border-border"
            />
          ) : (
            <div className="p-8 text-center space-y-3">
              <FileText
                className="h-12 w-12 text-primary mx-auto"
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-heading">
                {receipt.fileName}
              </p>
              <a
                href={receipt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Open /
                Download Document
              </a>
            </div>
          )}
        </div>
        <DialogFooter>
          {receipt.hasFile && (
            <a
              href={receipt.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 gap-1.5"
            >
              <Download className="h-4 w-4" aria-hidden="true" /> Download
              Original
            </a>
          )}
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

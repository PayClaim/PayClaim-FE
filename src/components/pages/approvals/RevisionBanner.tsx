import { AlertTriangle } from 'lucide-react'

export function RevisionBanner() {
  return (
    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex items-start gap-3">
      <AlertTriangle
        className="h-5 w-5 shrink-0 mt-0.5 text-amber-700 dark:text-amber-400"
        aria-hidden="true"
      />
      <div className="text-sm">
        <p className="font-semibold">Revision Required</p>
        <p className="text-xs mt-0.5">
          This claim was returned by the reviewer for revision. Please check the notes on the process card, then click <strong>Edit & Resubmit Claim</strong> to resubmit.
        </p>
      </div>
    </div>
  )
}

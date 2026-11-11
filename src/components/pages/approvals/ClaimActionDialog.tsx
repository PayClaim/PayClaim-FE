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
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { idNumberFormatter } from '#/lib/formatter'
import type { ActionType, Claim } from '#/types/approval-action.type'

interface ClaimActionDialogProps {
  claim: Claim
  open: boolean
  onOpenChange: (open: boolean) => void
  actionType: ActionType | null
  notes: string
  onNotesChange: (value: string) => void
  onConfirm: () => void
  isPending: boolean
}

function getTitle(actionType: ActionType | null, status: string) {
  if (actionType === 'Pay') return 'Disburse Claim & Mark Paid'
  if (actionType === 'Approved') {
    return status === 'Submitted'
      ? 'Approve Claim (Manager Review)'
      : 'Approve Claim (Finance Review)'
  }
  if (actionType === 'NeedsRevision') return 'Request Claim Revision'
  return 'Reject Claim'
}

function getDescription(actionType: ActionType | null, amount: string) {
  if (actionType === 'Pay')
    return `Confirm payment disbursement of ${amount} for this claim.`
  if (actionType === 'Approved')
    return `Proceed with approving reimbursement amount of ${amount}.`
  if (actionType === 'NeedsRevision')
    return 'Return claim to employee with instructions for revision.'
  return 'Reject this reimbursement claim.'
}

function getPlaceholder(actionType: ActionType | null) {
  if (actionType === 'Rejected')
    return 'State the reason for rejecting this claim...'
  if (actionType === 'NeedsRevision')
    return 'Describe what documents or details need to be corrected by the employee...'
  return 'Add any optional verification notes...'
}

function getConfirmSuffix(actionType: ActionType | null) {
  if (actionType === 'Pay') return 'Payment'
  if (actionType === 'Approved') return 'Approval'
  if (actionType === 'NeedsRevision') return 'Revision Request'
  return 'Rejection'
}

function getConfirmClass(actionType: ActionType | null) {
  if (actionType === 'Rejected')
    return 'bg-rose-600 hover:bg-rose-700 text-white'
  if (actionType === 'NeedsRevision')
    return 'bg-amber-600 hover:bg-amber-700 text-white'
  return 'bg-emerald-600 hover:bg-emerald-700 text-white'
}

export function ClaimActionDialog({
  claim,
  open,
  onOpenChange,
  actionType,
  notes,
  onNotesChange,
  onConfirm,
  isPending,
}: ClaimActionDialogProps) {
  const notesRequired =
    actionType === 'Rejected' || actionType === 'NeedsRevision'
  const amount = idNumberFormatter.format(claim.amount)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle(actionType, claim.status)}</DialogTitle>
          <DialogDescription>
            {getDescription(actionType, amount)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="review-notes" className="text-xs font-semibold">
              {notesRequired
                ? 'Reason / Instructions (Required)'
                : 'Review Notes (Optional)'}
            </Label>
            <Textarea
              id="review-notes"
              placeholder={getPlaceholder(actionType)}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={(notesRequired && !notes.trim()) || isPending}
            className={getConfirmClass(actionType)}
            onClick={onConfirm}
          >
            Confirm {getConfirmSuffix(actionType)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

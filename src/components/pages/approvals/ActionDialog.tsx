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
import { approvalForm } from '#/features/claims/forms/forms'
import type { ClaimStatusEnum } from '#/types/claims.type'

interface ActionDialogProps {
  open: boolean
  setOpen: (o: boolean) => void
  actionType: ActionType
  claimStatus: ClaimStatusEnum
  claimId: string
}

type ActionType = 'Approved' | 'Rejected' | 'NeedsRevision' | 'Pay' | null

export function ActionDialog({
  open,
  setOpen,
  actionType,
  claimStatus,
  claimId,
}: ActionDialogProps) {
  if (!actionType) return null
  const form = approvalForm(claimId, actionType)
  const dialog = getDialogMeta(actionType, claimStatus)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>{dialog.title}</DialogTitle>
            <DialogDescription>{dialog.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="notes" className="text-xs font-semibold">
              Notes / Feedback{' '}
              {actionType === 'NeedsRevision' ? '(Required)' : '(Optional)'}
            </Label>
            <form.AppField name="notes">
              {(field) => (
                <field.TextArea
                  label="Notes"
                  placeholder={
                    actionType === 'NeedsRevision'
                      ? 'Jelaskan apa yang perlu diperbaiki oleh karyawan...'
                      : 'Tambahkan catatan jika diperlukan...'
                  }
                  rows={3}
                />
              )}
            </form.AppField>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>

            <form.AppForm>
              <form.FormButton label="Submit" />
              <Button type="submit" className={dialog.buttonClass}>
                Confirm {dialog.submitLabel}
              </Button>
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getDialogMeta(actionType: ActionType, status: string) {
  let result = {
    title: '',
    description: '',
    buttonClass: 'bg-primary hover:bg-primary/90 text-white',
    submitLabel: '',
  }
  switch (actionType) {
    case 'Approved':
      result = {
        title: `Approve Claim (${status === 'Submitted' ? 'Level 1: Manager' : 'Level 2: Finance'})`,
        description:
          status === 'Submitted'
            ? 'Sebagai Manager, Anda akan menyetujui klaim ini untuk diteruskan ke tim Finance (Under Review).'
            : 'Sebagai Finance, menyetujui klaim ini akan langsung memotong saldo kuota benefit karyawan dan mengubah status menjadi Approved (siap dicairkan).',
        buttonClass: result.buttonClass,
        submitLabel: 'Approval',
      }
      break
    case 'NeedsRevision':
      result = {
        title: 'Request Revision',
        description:
          'Kembalikan klaim ke karyawan agar dapat diperbaiki (misal: nota tidak jelas/salah nominal).',
        buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
        submitLabel: 'Revision',
      }
      break
    case 'Pay':
      result = {
        title: 'Disburse & Mark as Paid',
        description:
          'Konfirmasi bahwa dana reimbursement telah ditransfer/dicairkan ke karyawan dan dicatat ke payroll.',
        buttonClass: result.buttonClass,
        submitLabel: 'Payment',
      }
      break
    case 'Rejected':
      result = {
        title: 'Reject Claim',
        description:
          'Klaim ini akan ditolak secara permanen. Berikan alasan penolakan.',
        buttonClass: 'bg-destructive hover:bg-destructive/90 text-white',
        submitLabel: 'Rejection',
      }
      break
  }

  return result
}

import {
  useApproveClaimMutation,
  usePayClaimMutation,
  useRejectClaimMutation,
} from '#/features/claims/queries/queries'
import { getFriendlyErrorMessage } from '#/lib/error'
import type { ActionType } from '#/types/approval-action.type'
import { useState } from 'react'
import { toast } from 'sonner'

export function useClaimActions(claimId: string) {
  const approveMutation = useApproveClaimMutation(claimId)
  const rejectMutation = useRejectClaimMutation(claimId)
  const payMutation = usePayClaimMutation(claimId)

  const [notes, setNotes] = useState('')
  const [actionType, setActionType] = useState<ActionType | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const openAction = (type: ActionType) => {
    setActionType(type)
    setNotes('')
    setDialogOpen(true)
  }

  const confirmAction = async () => {
    if (!actionType) return
    const payloadNotes = notes || undefined

    try {
      if (actionType === 'Pay') {
        await payMutation.mutateAsync({ notes: payloadNotes })
        toast.success('Claim has been marked as Paid successfully.')
      } else if (actionType === 'Approved') {
        await approveMutation.mutateAsync({
          decision: 'Approved',
          notes: payloadNotes,
        })
        toast.success('Claim has been approved successfully.')
      } else if (actionType === 'NeedsRevision') {
        await rejectMutation.mutateAsync({
          decision: 'NeedsRevision',
          notes: payloadNotes,
        })
        toast.info('Claim returned to employee for revision.')
      } else {
        await rejectMutation.mutateAsync({
          decision: 'Rejected',
          notes: payloadNotes,
        })
        toast.success('Claim has been rejected.')
      }
      setDialogOpen(false)
      setNotes('')
    } catch (err: unknown) {
      toast.error(
        getFriendlyErrorMessage(err, 'Failed to process action on this claim.'),
      )
    }
  }

  const isPending =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    payMutation.isPending

  return {
    actionType,
    notes,
    setNotes,
    dialogOpen,
    setDialogOpen,
    openAction,
    confirmAction,
    isPending,
  }
}

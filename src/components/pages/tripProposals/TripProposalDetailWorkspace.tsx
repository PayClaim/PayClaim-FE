import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle2, XCircle } from 'lucide-react'

import { getCurrentUser } from '#/features/auth/queries/queries'
import {
  useApproveTripProposalMutation,
  useGetProposalByIdQuery,
  useRejectTripProposalMutation,
} from '#/features/trip-proposals/queries/queries'

import { TripProposalHeader } from '#/components/pages/tripProposals/TripProposalHeader'
import { TripProposalSidebar } from '#/components/pages/tripProposals/TripProposalSidebar'
import {
  TripProposalTimeline,
  type ProposalTimelineItem,
} from '#/components/pages/tripProposals/TripProposalTimeline'

import { TripProposalStatus, isTripStatus } from '#/types/tripProposals.type'
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

type ApprovalAction = 'Approved' | 'Rejected' | 'NeedsRevision'

type Props = {
  id: string
  backTo?: string
  backLabel?: string
}

export function TripProposalDetailWorkspace({
  id,
  backTo = '/trip-proposals',
  backLabel = 'Back to Trip Proposals',
}: Props) {
  const {
    data: proposal,
    isLoading,
    isError,
    error,
  } = useGetProposalByIdQuery(id)

  const { data: user } = useQuery(getCurrentUser())

  const approveMutation = useApproveTripProposalMutation(id)
  const rejectMutation = useRejectTripProposalMutation(id)

  const [actionType, setActionType] = useState<ApprovalAction | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [notes, setNotes] = useState('')

  const roles = user?.roles || []
  const roleLower = roles.map((r: string) => r.toLowerCase())

  const isAdmin = roleLower.includes('admin')
  const isManager =
    roleLower.includes('manager') || roleLower.includes('project manager')
  const isFinance =
    roleLower.includes('finance') || roleLower.includes('finance manager')
  const isFinanceManager = roleLower.includes('finance manager')

  const isPic = Boolean(
    proposal?.participants?.some(
      (p) => p.isPic && p.employeeId === user?.employeeId,
    ),
  )

  const isSubmitted = isTripStatus(
    proposal?.status,
    TripProposalStatus.Submitted,
  )
  const isUnderReview = isTripStatus(
    proposal?.status,
    TripProposalStatus.UnderReview,
  )
  const isFinanceManagerReview = isTripStatus(
    proposal?.status,
    TripProposalStatus.FinanceManagerReview,
  )

  const canTakeAction =
    Boolean(proposal) &&
    (!isPic || isAdmin) &&
    ((isAdmin &&
      (isSubmitted || isUnderReview || isFinanceManagerReview)) ||
      (isManager && isSubmitted) ||
      (isFinance && isUnderReview) ||
      (isFinanceManager && isFinanceManagerReview))

  const isMutationPending =
    approveMutation.isPending || rejectMutation.isPending

  const handleAction = async () => {
    if (!actionType) return

    try {
      if (actionType === 'Approved') {
        await approveMutation.mutateAsync({
          decision: 'Approved',
          notes: notes.trim() || undefined,
        })

        toast.success('Trip proposal has been approved successfully.')
      } else if (actionType === 'NeedsRevision') {
        await rejectMutation.mutateAsync({
          decision: 'NeedsRevision',
          notes: notes.trim() || undefined,
        })

        toast.info('Trip proposal returned for revision.')
      } else {
        await rejectMutation.mutateAsync({
          decision: 'Rejected',
          notes: notes.trim() || undefined,
        })

        toast.success('Trip proposal has been rejected.')
      }

      setDialogOpen(false)
      setActionType(null)
      setNotes('')
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Action failed to process.'

      toast.error(message)
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-[1600px]">
        <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
          Loading trip proposal details...
        </div>
      </main>
    )
  }

  if (isError || !proposal) {
    return (
      <main className="mx-auto w-full max-w-[1600px]">
        <div className="rounded-xl border border-destructive bg-card p-8 text-destructive">
          {error instanceof Error
            ? error.message
            : 'Trip proposal not found.'}
        </div>
      </main>
    )
  }

  const filePath = proposal.filePath || ''

  const backendBaseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : ''

  const attachmentUrl = filePath
    ? filePath.startsWith('http')
      ? filePath
      : `${backendBaseUrl}${filePath.startsWith('/') ? '' : '/'}${filePath}`
    : ''

  const attachmentFileName = getFileName(filePath)
  const isPdf = /\.pdf(?:$|[?#])/i.test(filePath)

  const approvalHistory = proposal.approvalHistory || []

  const getLatestApproval = (level: number) => {
    return [...approvalHistory]
      .filter(
        (history) =>
          history.approvalLevel === level &&
          history.decision.toLowerCase() !== 'submitted',
      )
      .sort(
        (a, b) =>
          new Date(b.decidedAt).getTime() -
          new Date(a.decidedAt).getTime(),
      )[0]
  }

  const managerApproval = getLatestApproval(1)
  const financeApproval = getLatestApproval(2)
  const financeManagerApproval = getLatestApproval(3)

  const showFinanceStage =
    Boolean(financeApproval || financeManagerApproval) ||
    isTripStatus(proposal.status, [
      TripProposalStatus.UnderReview,
      TripProposalStatus.FinanceManagerReview,
      TripProposalStatus.Approved,
      TripProposalStatus.Completed,
    ])

  const showFinanceManagerStage =
    Boolean(financeManagerApproval) ||
    isTripStatus(proposal.status, TripProposalStatus.FinanceManagerReview)

  const submittedActivity = approvalHistory.find(
    (history) => history.decision.toLowerCase() === 'submitted',
  )

  const pic = proposal.participants.find(
    (participant) => participant.isPic,
  )

  const submittedBy =
    submittedActivity?.approverName ||
    pic?.employeeName ||
    'Proposal PIC'

  const submittedAt =
    submittedActivity?.decidedAt ||
    proposal.submittedAt

  const createApprovalStage = (
    level: number,
    title: string,
    roleName: string,
    approval: (typeof approvalHistory)[number] | undefined,
    isPending: boolean,
  ): ProposalTimelineItem => ({
    id: `level-${level}`,
    title,
    approverName: approval?.approverName || roleName,
    decision: approval?.decision || (isPending ? 'Pending' : 'Not recorded'),
    approvalLevel: level,
    decidedAt: approval?.decidedAt || '',
    notes: approval?.notes || null,
    isPending: !approval && isPending,
  })

  const timelineStages: ProposalTimelineItem[] = []

  if (showFinanceManagerStage) {
    timelineStages.push(
      createApprovalStage(
        3,
        'Finance Manager Approval (Level 3)',
        'Finance Manager',
        financeManagerApproval,
        isFinanceManagerReview,
      ),
    )
  }

  if (showFinanceStage) {
    timelineStages.push(
      createApprovalStage(
        2,
        'Finance Review (Level 2)',
        'Finance Officer',
        financeApproval,
        isUnderReview,
      ),
    )
  }

  timelineStages.push(
    createApprovalStage(
      1,
      'Manager Approval (Level 1)',
      'Project Manager',
      managerApproval,
      isSubmitted,
    ),
  )

  timelineStages.push({
    id: 'submission',
    title: 'Proposal Submission',
    approverName: submittedBy,
    decision: 'Submitted',
    approvalLevel: null,
    decidedAt: submittedAt,
    notes: null,
    isSubmission: true,
  })

  const approvalButtonLabel = isSubmitted
    ? 'Approve (Manager)'
    : isUnderReview
      ? 'Approve (Finance)'
      : 'Approve (Finance Manager)'

  const approvalActions = canTakeAction ? (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-border text-heading hover:bg-muted font-semibold"
        onClick={() => {
          setActionType('NeedsRevision')
          setNotes('')
          setDialogOpen(true)
        }}
      >
        Request Revision
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40 font-semibold gap-1.5"
        onClick={() => {
          setActionType('Rejected')
          setNotes('')
          setDialogOpen(true)
        }}
      >
        <XCircle className="h-4 w-4" aria-hidden="true" />
        Reject
      </Button>

      <Button
        type="button"
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
        onClick={() => {
          setActionType('Approved')
          setNotes('')
          setDialogOpen(true)
        }}
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        {approvalButtonLabel}
      </Button>
    </>
  ) : null

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-4">
      <TripProposalHeader
        proposal={proposal}
        backTo={backTo}
        backLabel={backLabel}
      />

      <div className="grid min-h-[720px] grid-cols-1 overflow-hidden rounded-xl border border-border bg-card shadow-xs lg:grid-cols-12">
        <TripProposalSidebar
          proposal={proposal}
          attachmentUrl={attachmentUrl}
          attachmentFileName={attachmentFileName}
          isPdf={isPdf}
        />

        <TripProposalTimeline
          stages={timelineStages}
          attachmentUrl={attachmentUrl}
          attachmentFileName={attachmentFileName}
          isPdf={isPdf}
          status={proposal.status}
          actions={approvalActions}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'Approved'
                ? 'Approve Trip Proposal'
                : actionType === 'NeedsRevision'
                  ? 'Request Trip Proposal Revision'
                  : 'Reject Trip Proposal'}
            </DialogTitle>

            <DialogDescription>
              {actionType === 'Approved'
                ? `Confirm approval for proposal "${proposal.destination}" (Total Amount: Rp ${Number(proposal.totalAmount || 0).toLocaleString('id-ID')}).`
                : actionType === 'NeedsRevision'
                  ? 'Return this proposal to the employee with revision instructions.'
                  : 'Confirm that you want to reject this trip proposal.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="trip-approval-notes">
              {actionType === 'Rejected' || actionType === 'NeedsRevision'
                ? 'Reason / Instructions (Required)'
                : 'Approval Notes (Optional)'}
            </Label>

            <Textarea
              id="trip-approval-notes"
              placeholder={
                actionType === 'Rejected'
                  ? 'Write the reason for rejecting this proposal...'
                  : actionType === 'NeedsRevision'
                    ? 'Describe what needs to be corrected...'
                    : 'Add optional approval notes...'
              }
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={500}
              rows={4}
            />

            <p className="text-right text-xs text-muted-foreground">
              {notes.length}/500 characters
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="button"
              disabled={
                isMutationPending ||
                ((actionType === 'Rejected' ||
                  actionType === 'NeedsRevision') &&
                  !notes.trim())
              }
              className={
                actionType === 'Rejected'
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : actionType === 'NeedsRevision'
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }
              onClick={handleAction}
            >
              {isMutationPending
                ? 'Processing...'
                : actionType === 'Approved'
                  ? 'Confirm Approval'
                  : actionType === 'NeedsRevision'
                    ? 'Request Revision'
                    : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function getFileName(path: string) {
  if (!path) return ''

  const fileName =
    path.split(/[\\/]/).pop()?.split(/[?#]/)[0] || path

  try {
    return decodeURIComponent(fileName)
  } catch {
    return fileName
  }
}

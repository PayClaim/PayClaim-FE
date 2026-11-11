import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CheckCircle2,
  XCircle,
  Users,
  AlertCircle,
} from 'lucide-react'

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

import {
  TripProposalStatus,
  isTripStatus,
} from '#/types/tripProposals.type'

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

  // Nominal yang diinput untuk masing-masing peserta.
  const [participantAmounts, setParticipantAmounts] = useState<
    Record<string, string>
  >({})

  // Opsi untuk menyamakan nominal seluruh peserta.
  const [useSameAmount, setUseSameAmount] = useState(false)
  const [sameAmount, setSameAmount] = useState('')

  // Mengisi input dengan nominal yang sudah tersimpan dari backend.
  useEffect(() => {
    if (!proposal) return

    const initialAmounts: Record<string, string> = {}

    proposal.participants.forEach((participant) => {
      initialAmounts[participant.employeeId] =
        participant.amount > 0
          ? String(participant.amount)
          : ''
    })

    setParticipantAmounts(initialAmounts)
  }, [proposal])

const roles = user?.roles || []
const roleLower = roles.map((role: string) => role.toLowerCase())

const isAdmin = roleLower.includes('admin')

const isFinanceManager = roleLower.includes('finance manager')

const isFinance =
  roleLower.includes('finance') && !isFinanceManager

const isManager =
  (roleLower.includes('manager') ||
    roleLower.includes('project manager')) &&
  !isFinanceManager

  const isPic = Boolean(
    proposal?.participants?.some(
      (participant) =>
        participant.isPic &&
        participant.employeeId === user?.employeeId,
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

  // Form limit hanya digunakan pada tahap Finance.
  const isFinanceApprovalStage =
    isUnderReview && (isFinance || isAdmin)

  const canTakeAction =
    Boolean(proposal) &&
    (!isPic || isAdmin) &&
    (
      (isAdmin &&
        (isSubmitted || isUnderReview || isFinanceManagerReview)) ||
      (isManager && isSubmitted) ||
      (isFinance && isUnderReview) ||
      (isFinanceManager && isFinanceManagerReview)
    )

  const isMutationPending =
    approveMutation.isPending || rejectMutation.isPending

  // Format Rupiah.
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount)

  // Mengubah nominal untuk satu peserta.
  const handleParticipantAmountChange = (
    employeeId: string,
    amount: string,
  ) => {
    setParticipantAmounts((current) => ({
      ...current,
      [employeeId]: amount,
    }))
  }

  // Menerapkan satu nominal ke seluruh peserta.
  const handleApplySameAmount = () => {
    if (!proposal) return

    const amount = Number(sameAmount)

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Amount must be greater than zero.')
      return
    }

    setParticipantAmounts((current) => {
      const updatedAmounts = { ...current }

      proposal.participants.forEach((participant) => {
        updatedAmounts[participant.employeeId] = sameAmount
      })

      return updatedAmounts
    })

    toast.success('Amount applied to all participants.')
  }

  // Memastikan semua peserta sudah mendapatkan limit.
  const hasValidParticipantAmounts = Boolean(
    proposal &&
      proposal.participants.length > 0 &&
      proposal.participants.every((participant) => {
        const amount = Number(
          participantAmounts[participant.employeeId] ?? '',
        )

        return Number.isFinite(amount) && amount > 0
      }),
  )

// Total reimbursement limit for all participants.
const totalParticipantLimit = proposal
  ? proposal.participants.reduce((total, participant) => {
      const amount = Number(
        participantAmounts[participant.employeeId] ?? '',
      )

      return total + (Number.isFinite(amount) ? amount : 0)
    }, 0)
  : 0

// Projected proposal total = accommodation + participant limits.
const projectedTotalAmount = proposal
  ? proposal.accommodationAmount + totalParticipantLimit
  : 0

// Check the Finance approval limit provided by the backend.
const exceedsFinanceLimit =
  Boolean(proposal) &&
  (proposal?.financeLimit ?? 0) > 0 &&
  projectedTotalAmount > (proposal?.financeLimit ?? 0)


  const handleAction = async () => {
    if (!actionType || !proposal) return

    try {
      if (actionType === 'Approved') {
        if (
          isFinanceApprovalStage &&
          !hasValidParticipantAmounts
        ) {
          toast.error(
            'Please enter a reimbursement limit greater than zero for every participant.',
          )
          return
        }

        // Kirim limit per peserta hanya pada approval Finance.
        const participants = isFinanceApprovalStage
          ? proposal.participants.map((participant) => ({
              employeeId: participant.employeeId,
              amount: Number(
                participantAmounts[participant.employeeId],
              ),
            }))
          : undefined

        await approveMutation.mutateAsync({
          decision: 'Approved',
          notes: notes.trim() || undefined,
          ...(participants ? { participants } : {}),
        })

        if (isFinanceApprovalStage && exceedsFinanceLimit) {
          toast.success(
            'Proposal forwarded to Finance Manager for final review.',
          )
        } else {
          toast.success('Trip proposal has been approved successfully.')
        }
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
      setSameAmount('')
      setUseSameAmount(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Action failed to process.'

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
    isFinanceManagerReview

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
        'Finance Verification & Disbursement',
        'Finance Officer',
        financeApproval,
        isUnderReview,
      ),
    )
  }

  timelineStages.push(
    createApprovalStage(
      1,
      'Document Collection & Manager Approval',
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

  const openApprovalDialog = () => {
    setActionType('Approved')
    setNotes('')
    setSameAmount('')
    setUseSameAmount(false)
    setDialogOpen(true)
  }

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
        onClick={openApprovalDialog}
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

      {/* Approval / Rejection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className={
            actionType === 'Approved' && isFinanceApprovalStage
              ? 'max-h-[90vh] overflow-y-auto sm:max-w-2xl'
              : 'sm:max-w-md'
          }
        >
          <DialogHeader>
            <DialogTitle>
              {actionType === 'Approved'
                ? isFinanceApprovalStage
                  ? 'Approve Trip Proposal & Set Limits'
                  : 'Approve Trip Proposal'
                : actionType === 'NeedsRevision'
                  ? 'Request Trip Proposal Revision'
                  : 'Reject Trip Proposal'}
            </DialogTitle>

            <DialogDescription>
              {actionType === 'Approved'
                ? isFinanceApprovalStage
                  ? 'Set the reimbursement limit for each participant before approving this proposal.'
                  : `Confirm approval for proposal "${proposal.destination}" (Total Amount: ${formatCurrency(Number(proposal.totalAmount || 0))}).`
                : actionType === 'NeedsRevision'
                  ? 'Return this proposal to the employee with revision instructions.'
                  : 'Confirm that you want to reject this trip proposal.'}
            </DialogDescription>
          </DialogHeader>

          {/* Form limit reimbursement Finance */}
          {actionType === 'Approved' &&
            isFinanceApprovalStage && (
              <div className="space-y-5 py-2">
                {/* Apply the same amount to all participants */}
                  <div className="rounded-lg border border-border p-4">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={useSameAmount}
                        onChange={(event) => setUseSameAmount(event.target.checked)}
                        className="h-4 w-4 accent-primary"
                      />

                      <span className="text-sm font-semibold">
                        Apply the same amount to all participants
                      </span>
                    </label>

                    {useSameAmount && (
                      <div className="mt-4 space-y-3">
                        <div>
                          <Label htmlFor="same-participant-amount">
                            Amount for all participants
                          </Label>

                          <input
                            id="same-participant-amount"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={sameAmount}
                            onChange={(event) => setSameAmount(event.target.value)}
                            placeholder="Enter amount"
                            className="mt-2 h-10 w-full rounded-md border border-border bg-input px-3 text-sm"
                          />
                        </div>

                        <Button
                          type="button"
                          className="w-full bg-blue-600 font-semibold text-white hover:bg-blue-700"
                          disabled={
                            !sameAmount ||
                            !Number.isFinite(Number(sameAmount)) ||
                            Number(sameAmount) <= 0
                          }
                          onClick={handleApplySameAmount}
                        >
                          Apply to All Participants
                        </Button>

                        <p className="text-xs text-muted-foreground">
                          The amount will be applied to all participants. You can still
                          edit each participant's amount individually afterward.
                        </p>
                      </div>
                    )}
                  </div>

                {/* Input nominal per peserta */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        Reimbursement Limit per Employee
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Set the total reimbursement limit for each participant for the
                        entire trip, not per day.
                      </p>
                    </div>

                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {proposal.participants.length} Participants
                    </span>
                  </div>

                  {proposal.participants.map((participant) => {
                    const amount =
                      participantAmounts[participant.employeeId] ?? ''

                    const isInvalid =
                      amount !== '' &&
                      (!Number.isFinite(Number(amount)) ||
                        Number(amount) <= 0)

                    return (
                      <div
                        key={participant.employeeId}
                        className="grid grid-cols-1 gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_220px] sm:items-center"
                      >
                        <div>
                          <p className="text-sm font-semibold">
                            {participant.employeeName ||
                              participant.employeeNumber ||
                              participant.employeeId}
                          </p>

                          {participant.employeeNumber && (
                            <p className="text-xs text-muted-foreground">
                              {participant.employeeNumber}
                            </p>
                          )}

                          {participant.isPic && (
                            <span className="mt-1 inline-block rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              PIC
                            </span>
                          )}
                        </div>

                        <div>
                          <Label
                            htmlFor={`amount-${participant.employeeId}`}
                            className="sr-only"
                          >
                            Reimbursement limit for{' '}
                            {participant.employeeName || 'participant'}
                          </Label>

                          <input
                            id={`amount-${participant.employeeId}`}
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={amount}
                            placeholder="Enter amount"
                            onChange={(event) =>
                              handleParticipantAmountChange(
                                participant.employeeId,
                                event.target.value,
                              )
                            }
                            className={`h-10 w-full rounded-md border bg-input px-3 text-sm ${
                              isInvalid
                                ? 'border-destructive'
                                : 'border-border'
                            }`}
                          />

                          {isInvalid && (
                            <p className="mt-1 text-xs text-destructive">
                              Amount must be greater than zero.
                            </p>
                          )}
                        </div>
                      </div>
                    )
                                    })}
                </div>

                {/* Finance approval limit warning */}
                {exceedsFinanceLimit && (
                  <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                    <div className="space-y-1">
                      <p className="text-sm font-semibold">
                        Finance Approval Limit Exceeded
                      </p>

                      <p className="text-xs leading-relaxed">
                        The projected proposal total is{' '}
                        <strong>
                          {formatCurrency(projectedTotalAmount)}
                        </strong>
                        , exceeding the Finance approval limit of{' '}
                        <strong>
                          {formatCurrency(proposal.financeLimit)}
                        </strong>
                        . This proposal will be automatically forwarded to
                        the Finance Manager when you confirm.
                      </p>
                    </div>
                  </div>
                )}

                {/* Participant validation warning */}
                {!hasValidParticipantAmounts && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Please enter a reimbursement limit greater than zero
                    for every participant before approving.
                  </p>
                )}
              </div>
            )}

          {/* Catatan approval */}
          <div className="space-y-2 py-2">
            <Label htmlFor="trip-approval-notes">
              {actionType === 'Rejected' ||
              actionType === 'NeedsRevision'
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
                  !notes.trim()) ||
                (actionType === 'Approved' &&
                  isFinanceApprovalStage &&
                  !hasValidParticipantAmounts)
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
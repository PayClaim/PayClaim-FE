
import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CheckCircle2,
  XCircle,
  Users,
  AlertCircle,
  AlertTriangle,
  SquarePen,
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
import { DetailPageSkeleton } from '#/components/ui/page-skeleton'

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

const MAX_TRIP_AMOUNT = 100000000

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

  // Accommodation Budget yang sedang diedit.
  const [accommodationAmountInput, setAccommodationAmountInput] =
    useState('')

  // Accommodation Budget yang sudah disimpan sementara untuk approval.
  const [approvedAccommodationAmount, setApprovedAccommodationAmount] =
    useState(0)

  // Menentukan apakah Finance sedang mengubah Accommodation Budget.
  const [isChangingAccommodationBudget, setIsChangingAccommodationBudget] =
    useState(false)

  // Nominal yang diinput untuk masing-masing peserta.
  const [participantAmounts, setParticipantAmounts] = useState<
    Record<string, string>
  >({})

  const [isSameAmountApplied, setIsSameAmountApplied] = useState(false)

  // Melacak apakah Accommodation Budget sudah disentuh.
  const [isAccommodationAmountTouched, setIsAccommodationAmountTouched] =
    useState(false)

  // Melacak apakah input peserta sudah disentuh.
  const [touchedParticipantAmounts, setTouchedParticipantAmounts] =
    useState<Record<string, boolean>>({})

  // Peringatan jika Accommodation Budget melebihi Rp100 juta.
  const [
    isAccommodationAmountLimitExceeded,
    setIsAccommodationAmountLimitExceeded,
  ] = useState(false)

  // Peringatan jika reimbursement limit peserta melebihi Rp100 juta.
  const [
    participantAmountLimitWarnings,
    setParticipantAmountLimitWarnings,
  ] = useState<Record<string, boolean>>({})

  // Melacak apakah Finance sudah mencoba melakukan approval.
  const [hasAttemptedFinanceApproval, setHasAttemptedFinanceApproval] =
    useState(false)

  // Accommodation Budget awal yang tersimpan di backend.
  const currentAccommodationAmount = proposal?.accommodationAmount ?? 0

  // Mengisi input menggunakan nominal yang sudah tersimpan dari backend.
  useEffect(() => {
    if (!proposal) return

    const initialAmounts: Record<string, string> = {}

    proposal.participants.forEach((participant) => {
      initialAmounts[participant.employeeId] =
        participant.amount > 0
          ? String(participant.amount)
          : '0'
    })

    setParticipantAmounts(initialAmounts)

    // Nominal awal dari backend menjadi nominal yang dipilih.
    setApprovedAccommodationAmount(
      proposal.accommodationAmount ?? 0,
    )

    setAccommodationAmountInput(
      proposal.accommodationAmount > 0
        ? String(proposal.accommodationAmount)
        : '0',
    )

    setIsChangingAccommodationBudget(false)
    setIsAccommodationAmountLimitExceeded(false)
    setParticipantAmountLimitWarnings({})
    setTouchedParticipantAmounts({})
    setIsAccommodationAmountTouched(false)
    setHasAttemptedFinanceApproval(false)
  }, [proposal])

  const roles = user?.roles || []

  const roleLower = roles.map((role: string) =>
    role.toLowerCase(),
  )

  const isAdmin = roleLower.includes('admin')

  const isFinanceManager =
    roleLower.includes('finance manager')

  const isFinance =
    roleLower.includes('finance') && !isFinanceManager

  const isManager =
    (
      roleLower.includes('manager') ||
      roleLower.includes('project manager')
    ) &&
    !isFinanceManager

  const myParticipant =
    (user?.employeeId
      ? proposal?.participants?.find(
          (participant) =>
            String(participant.employeeId).toLowerCase() ===
            String(user.employeeId).toLowerCase(),
        )
      : undefined) ??
    (user?.employeeNumber
      ? proposal?.participants?.find(
          (participant) =>
            participant.employeeNumber?.trim().toLowerCase() ===
            user.employeeNumber.trim().toLowerCase(),
        )
      : undefined) ??
    (user?.fullName
      ? proposal?.participants?.find(
          (participant) =>
            participant.employeeName?.trim().toLowerCase() ===
            user.fullName.trim().toLowerCase(),
        )
      : undefined)

  const isPic = Boolean(myParticipant?.isPic)

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
    isUnderReview && (isFinance || isFinanceManager || isAdmin)

  const canTakeAction =
    Boolean(proposal) &&
    (!isPic || isAdmin) &&
    (
      (isAdmin &&
        (
          isSubmitted ||
          isUnderReview ||
          isFinanceManagerReview
        )) ||
      (isManager && isSubmitted) ||
      (isFinance && isUnderReview) ||
      (isFinanceManager && (isUnderReview || isFinanceManagerReview))
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

  // Accommodation Budget draft dalam angka mentah.
  const draftAccommodationAmount = Number(
    accommodationAmountInput,
  )

  const hasValidAccommodationDraft =
    accommodationAmountInput.trim() !== '' &&
    Number.isFinite(draftAccommodationAmount) &&
    draftAccommodationAmount > 0 &&
    draftAccommodationAmount <= MAX_TRIP_AMOUNT

  // Accommodation Budget yang sudah disimpan sementara.
  const hasValidAccommodationAmount =
    !isChangingAccommodationBudget &&
    Number.isFinite(approvedAccommodationAmount) &&
    approvedAccommodationAmount > 0 &&
    approvedAccommodationAmount <= MAX_TRIP_AMOUNT

  // Error hanya muncul setelah input disentuh atau approval dicoba.
  const showAccommodationAmountError =
    isAccommodationAmountLimitExceeded ||
    (
      (
        isAccommodationAmountTouched ||
        hasAttemptedFinanceApproval
      ) &&
      (
        isChangingAccommodationBudget
          ? !hasValidAccommodationDraft
          : !hasValidAccommodationAmount
      )
    )

  // Mengubah nominal Accommodation Budget.
  // State tetap hanya berisi angka.
  const handleAccommodationAmountChange = (amount: string) => {
    const digits = amount.replace(/\D/g, '')
    const numericAmount = digits ? Number(digits) : 0

    if (numericAmount > MAX_TRIP_AMOUNT) {
      setIsAccommodationAmountLimitExceeded(true)
      return
    }

    setIsAccommodationAmountLimitExceeded(false)
    setAccommodationAmountInput(digits)
  }

  // Menyimpan Accommodation Budget sementara.
  const handleSaveAccommodationBudget = () => {
    if (
      isAccommodationAmountLimitExceeded ||
      !hasValidAccommodationDraft
    ) {
      setIsAccommodationAmountTouched(true)

      toast.error(
        'Accommodation Budget must be greater than zero and cannot exceed Rp 100.000.000.',
      )

      return
    }

    setApprovedAccommodationAmount(draftAccommodationAmount)

    setIsChangingAccommodationBudget(false)
    setIsAccommodationAmountTouched(false)

    toast.success(
      'Accommodation Budget saved for this approval.',
    )

    setIsAccommodationAmountLimitExceeded(false)
  }

  // Mengembalikan Accommodation Budget ke nominal awal dari backend.
  const handleResetAccommodationBudget = () => {
    setApprovedAccommodationAmount(currentAccommodationAmount)

    setAccommodationAmountInput(
      String(currentAccommodationAmount),
    )

    setIsChangingAccommodationBudget(false)
    setIsAccommodationAmountTouched(false)
    setIsAccommodationAmountLimitExceeded(false)

    toast.success(
      'Accommodation Budget has been reset to the original amount.',
    )
  }

  // Mengubah nominal untuk satu peserta.
  // State tetap hanya berisi angka.
  const handleParticipantAmountChange = (
    employeeId: string,
    amount: string,
  ) => {
    const numericAmount = amount.replace(/\D/g, '')
    const numericValue = numericAmount ? Number(numericAmount) : 0

    if (numericValue > MAX_TRIP_AMOUNT) {
      setParticipantAmountLimitWarnings((current) => ({
        ...current,
        [employeeId]: true,
      }))

      return
    }

    setParticipantAmountLimitWarnings((current) => ({
      ...current,
      [employeeId]: false,
    }))

    setParticipantAmounts((current) => ({
      ...current,
      [employeeId]: numericAmount,
    }))

    if (proposal?.participants[0]?.employeeId === employeeId) {
      setIsSameAmountApplied(false)
    }
  }

  // Menerapkan satu nominal ke seluruh peserta.
  const handleApplySameAmount = () => {
    if (!proposal || proposal.participants.length === 0) return

    const firstParticipant = proposal.participants[0]

    const amount =
      participantAmounts[firstParticipant.employeeId] ?? ''

    const numericAmount = Number(amount)

    const firstParticipantHasLimitWarning =
      participantAmountLimitWarnings[firstParticipant.employeeId]

    if (
      amount.trim() === '' ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      numericAmount > MAX_TRIP_AMOUNT ||
      firstParticipantHasLimitWarning
    ) {
      toast.error(
        'Enter a valid amount greater than zero and not exceeding Rp 100.000.000.',
      )

      return
    }

    setParticipantAmounts((current) => {
      const updatedAmounts = { ...current }

      proposal.participants.forEach((participant) => {
        updatedAmounts[participant.employeeId] = amount
      })

      return updatedAmounts
    })

    // Menghapus peringatan nominal peserta karena semua nilai
    // sekarang menggunakan nominal pertama yang sudah valid.
    setParticipantAmountLimitWarnings((current) => {
      const updatedWarnings = { ...current }

      proposal.participants.forEach((participant) => {
        updatedWarnings[participant.employeeId] = false
      })

      return updatedWarnings
    })

    setIsSameAmountApplied(true)

    toast.success('Amount applied to all participants.')
  }

  // Memastikan semua peserta sudah mendapatkan limit lebih dari nol
  // dan tidak melebihi Rp100 juta.
  const hasValidParticipantAmounts = Boolean(
    proposal &&
      proposal.participants.length > 0 &&
      proposal.participants.every((participant) => {
        const amount = Number(
          participantAmounts[participant.employeeId] ?? '',
        )

        return (
          Number.isFinite(amount) &&
          amount > 0 &&
          amount <= MAX_TRIP_AMOUNT &&
          !participantAmountLimitWarnings[participant.employeeId]
        )
      }),
  )

  // Total reimbursement limit untuk seluruh peserta.
  const totalParticipantLimit = proposal
    ? proposal.participants.reduce((total, participant) => {
        const amount = Number(
          participantAmounts[participant.employeeId] ?? '',
        )

        return (
          total +
          (
            Number.isFinite(amount) && amount > 0
              ? amount
              : 0
          )
        )
      }, 0)
    : 0

  // Nominal untuk menampilkan Total Proposal Budget.
  const accommodationAmountForTotal =
    isChangingAccommodationBudget
      ? (
          hasValidAccommodationDraft
            ? draftAccommodationAmount
            : 0
        )
      : approvedAccommodationAmount

  // Total Proposal Budget = Accommodation Budget + seluruh Participant Limit.
  const projectedTotalAmount =
    accommodationAmountForTotal + totalParticipantLimit

  // Finance Limit berlaku untuk total keseluruhan proposal.
  const exceedsFinanceLimit =
    Boolean(proposal) &&
    !isFinanceManager &&
    (
      isChangingAccommodationBudget
        ? hasValidAccommodationDraft
        : hasValidAccommodationAmount
    ) &&
    hasValidParticipantAmounts &&
    (proposal?.financeLimit ?? 0) > 0 &&
    projectedTotalAmount > (proposal?.financeLimit ?? 0)

  const handleAction = async () => {
    if (!actionType || !proposal) return

    try {
      if (actionType === 'Approved') {
        if (isFinanceApprovalStage) {
          setHasAttemptedFinanceApproval(true)
        }

        // Finance harus menyimpan perubahan budget terlebih dahulu.
        if (
          isFinanceApprovalStage &&
          isChangingAccommodationBudget
        ) {
          toast.error(
            'Please save the Accommodation Budget before confirming approval.',
          )
          return
        }

        // Validasi Accommodation Budget.
        if (
          isFinanceApprovalStage &&
          !hasValidAccommodationAmount
        ) {
          toast.error(
            'Accommodation Budget must be greater than zero and cannot exceed Rp 100.000.000.',
          )
          return
        }

        // Validasi seluruh reimbursement limit peserta.
        if (
          isFinanceApprovalStage &&
          !hasValidParticipantAmounts
        ) {
          toast.error(
            'Please enter a valid reimbursement limit greater than zero and not exceeding Rp 100.000.000 for every participant.',
          )
          return
        }

        // Kirim data peserta hanya pada approval Finance.
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

          // Kirim budget yang sudah disimpan dan limit peserta.
          ...(isFinanceApprovalStage
            ? {
                totalAmount: approvedAccommodationAmount,
                participants,
              }
            : {}),
        })

        if (isFinanceApprovalStage && exceedsFinanceLimit) {
          toast.success(
            'Proposal forwarded to Finance Manager for final review.',
          )
        } else {
          toast.success(
            'Trip proposal has been approved successfully.',
          )
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
      setIsChangingAccommodationBudget(false)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Action failed to process.'

      toast.error(message)
    }
  }

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (isError || !proposal) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-[1600px]">
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

  const isManagerSkipped =
  !managerApproval &&
  !isSubmitted &&
  isTripStatus(proposal.status, [
    TripProposalStatus.UnderReview,
    TripProposalStatus.FinanceManagerReview,
    TripProposalStatus.Approved,
    TripProposalStatus.Completed,
  ])

const isFinanceSkipped =
  !financeApproval &&
  !isUnderReview &&
  isTripStatus(proposal.status, [
    TripProposalStatus.FinanceManagerReview,
    TripProposalStatus.Approved,
    TripProposalStatus.Completed,
  ])

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

  // Membuat satu tahap approval untuk Timeline.
  const createApprovalStage = (
    level: number,
    title: string,
    roleName: string,
    approval: (typeof approvalHistory)[number] | undefined,
    isPending: boolean,
    isSkipped = false,
  ): ProposalTimelineItem => {
    const parsedNotes = parseAccommodationBudgetNotes(
      approval?.notes,
    )

    return {
      id: `level-${level}`,
      title,
      approverName:
        approval?.approverName?.trim() ||
        (isPending || isSkipped ? roleName : 'Approver name unavailable'),
      approverRole: roleName,
      decision:
        approval?.decision ||
        (isPending ? 'Pending' : isSkipped ? 'Skipped' : 'Not recorded'),
      approvalLevel: level,
      decidedAt: approval?.decidedAt || '',
      notes: parsedNotes.notes,
      accommodationAmountBefore:
        parsedNotes.accommodationAmountBefore,
      accommodationAmountAfter:
        parsedNotes.accommodationAmountAfter,
      isPending: !approval && isPending,
    }
  }

  const timelineStages: ProposalTimelineItem[] = []

  if (showFinanceManagerStage) {
    timelineStages.push(
      createApprovalStage(
        3,
        'Finance Manager Approval',
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
        isFinanceSkipped,
      ),
    )
  }

  timelineStages.push(
    createApprovalStage(
      1,
      'Document Collection & Manager Approval',
      proposal.managerName || 'Project Manager',
      managerApproval,
      isSubmitted,
      isManagerSkipped,
    ),
  )
  
  timelineStages.push({
    id: 'submission',
    title: 'Proposal Submission',
    approverName: submittedBy,
    approverRole: 'Employee / PIC',
    decision: 'Submitted',
    approvalLevel: null,
    decidedAt: submittedAt,
    notes: null,
    isSubmission: true,
  })

  const approvalButtonLabel = isSubmitted
    ? 'Approve (Manager)'
    : isUnderReview && !isFinanceManager
      ? 'Approve (Finance)'
      : 'Approve (Finance Manager)'

  const openApprovalDialog = () => {
    setActionType('Approved')
    setNotes('')
    setIsSameAmountApplied(false)

    // Mulai dari nominal asli yang tersimpan di backend.
    setApprovedAccommodationAmount(currentAccommodationAmount)

    setAccommodationAmountInput(
      currentAccommodationAmount > 0
        ? String(currentAccommodationAmount)
        : '0',
    )

    setIsChangingAccommodationBudget(false)

    // Reset status validasi setiap kali modal dibuka.
    setIsAccommodationAmountTouched(false)
    setTouchedParticipantAmounts({})
    setHasAttemptedFinanceApproval(false)
    setIsAccommodationAmountLimitExceeded(false)
    setParticipantAmountLimitWarnings({})

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

  const isNeedsRevision = isTripStatus(
    proposal.status,
    TripProposalStatus.NeedsRevision,
  )

  const reviseAction =
    isNeedsRevision && isPic && !isAdmin ? (
      <Link to="/trip-proposals/$id/edit" params={{ id: proposal.id }}>
        <Button
          type="button"
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5 shadow-2xs cursor-pointer"
        >
          <SquarePen className="h-4 w-4" aria-hidden="true" />
          Edit & Resubmit Proposal
        </Button>
      </Link>
    ) : null

  const headerActions =
    approvalActions || reviseAction ? (
      <>
        {reviseAction}
        {approvalActions}
      </>
    ) : null

  const isApprovedOrCompleted = isTripStatus(proposal.status, [
    TripProposalStatus.Approved,
    TripProposalStatus.Completed,
  ])

  const myTotalBudget =
    proposal.myParticipantAmount ?? myParticipant?.amount ?? 0

  const myRemainingBudget =
    proposal.myRemainingBudget ??
    myParticipant?.remainingBudget ??
    myTotalBudget

  const myClaimedAmount =
    proposal.myClaimedAmount ??
    myParticipant?.claimedAmount ??
    Math.max(0, myTotalBudget - myRemainingBudget)

  const canClaim =
    isApprovedOrCompleted && myTotalBudget > 0

  const hasRemainingBudget = myRemainingBudget > 0

  const claimCard =
    canClaim ? (
      hasRemainingBudget ? (
        <Link
          to="/claims/create"
          search={{
            tripProposalId: proposal.id,
            claimType: 'BusinessTripReimbursement',
          }}
          className="group block"
        >
          <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 shadow-2xs transition-all hover:border-emerald-400 hover:bg-emerald-100/70 hover:shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:hover:border-emerald-700">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                  Pengajuan Klaim Reimbursement
                </span>

                <span className="inline-flex items-center rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  Tersedia
                </span>
              </div>

              <p className="mt-0.5 text-xs text-emerald-700/90 dark:text-emerald-300/90">
                {myClaimedAmount > 0 ? (
                  <>
                    Sisa plafon Anda:{' '}
                    <span className="font-bold text-emerald-950 dark:text-emerald-100">
                      {formatCurrency(myRemainingBudget)}
                    </span>

                    <span className="ml-1 text-[11px] text-emerald-700/70 dark:text-emerald-300/70">
                      (Total: {formatCurrency(myTotalBudget)}, Terklaim:{' '}
                      {formatCurrency(myClaimedAmount)})
                    </span>
                  </>
                ) : (
                  <>
                    Plafon anggaran Anda:{' '}
                    <span className="font-bold text-emerald-950 dark:text-emerald-100">
                      {formatCurrency(myTotalBudget)}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center self-end sm:shrink-0 sm:self-center">
              <span className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-2xs transition-all group-hover:bg-emerald-700 group-hover:shadow-xs group-active:scale-95">
                Ajukan Klaim ({formatCurrency(myRemainingBudget)})
              </span>
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                Pengajuan Klaim Reimbursement
              </span>

              <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Plafon Habis
              </span>
            </div>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Seluruh plafon anggaran perjalanan Anda (
              {formatCurrency(myTotalBudget)}) telah diajukan klaim.
            </p>
          </div>

          <div className="self-end text-xs font-medium text-muted-foreground sm:shrink-0 sm:self-center">
            Plafon Terpakai Penuh
          </div>
        </div>
      )
    ) : null

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1600px] space-y-4">
      {isNeedsRevision && isPic && !isAdmin && (
        <div className="flex min-w-0 items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400"
            aria-hidden="true"
          />

          <div className="min-w-0 text-sm">
            <p className="font-semibold">Revisi Diperlukan</p>

            <p className="mt-0.5 text-xs">
              Proposal ini dikembalikan oleh reviewer untuk diperbaiki.
              Silakan periksa catatan pada kartu proses, lalu klik tombol{' '}
              <strong>Edit &amp; Resubmit Proposal</strong> untuk mengajukan
              ulang.
            </p>
          </div>
        </div>
      )}

      <TripProposalHeader
        proposal={proposal}
        backTo={backTo}
        backLabel={backLabel}
      />

      <div className="grid min-h-[720px] min-w-0 grid-cols-1 overflow-hidden rounded-xl border border-border bg-card shadow-xs lg:grid-cols-12">
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
          actions={headerActions}
          claimCard={claimCard}
        />
      </div>

      {/* Approval / Rejection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className={
            actionType === 'Approved' && isFinanceApprovalStage
              ? 'flex h-[90dvh] max-h-[90dvh] min-h-0 flex-col overflow-hidden sm:max-w-2xl'
              : 'flex max-h-[90dvh] flex-col overflow-hidden sm:max-w-md'
          }
        >
          {/* Fixed Header */}
          <DialogHeader className="shrink-0">
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
                  ? ''
                  : `Confirm approval for proposal "${proposal.destination}" (Accommodation Budget: ${formatCurrency(Number(proposal.accommodationAmount || 0))}).`
                : actionType === 'NeedsRevision'
                  ? 'Return this proposal to the employee with revision instructions.'
                  : 'Confirm that you want to reject this trip proposal.'}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Body */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2">
            {/* Form limit reimbursement Finance */}
            {actionType === 'Approved' &&
              isFinanceApprovalStage && (
                <div className="space-y-5 py-2">
                  {/* Accommodation Budget */}
                  <div className="space-y-3 rounded-lg border border-border p-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-heading">
                        Accommodation Budget
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Total budget for accommodation, tickets, and other
                        trip arrangements.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {isChangingAccommodationBudget ? (
                        <div className="min-w-0 flex-1">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                              Rp
                            </span>

                            <input
                              id="accommodation-budget"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={formatNumericInput(
                                accommodationAmountInput,
                              )}
                              placeholder="0"
                              onChange={(event) =>
                                handleAccommodationAmountChange(
                                  event.target.value,
                                )
                              }
                              onFocus={() => {
                                if (accommodationAmountInput === '0') {
                                  setAccommodationAmountInput('')
                                }
                              }}
                              onBlur={() =>
                                setIsAccommodationAmountTouched(true)
                              }
                              className={`h-10 w-full rounded-md border bg-input pl-10 pr-3 text-sm ${
                                showAccommodationAmountError
                                  ? 'border-destructive'
                                  : 'border-border'
                              }`}
                            />
                          </div>

                          {showAccommodationAmountError && (
                            <p className="mt-1 text-xs text-destructive">
                              {isAccommodationAmountLimitExceeded
                                ? 'Maximum Accommodation Budget is Rp 100.000.000.'
                                : 'Accommodation Budget must be greater than zero.'}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="min-w-0 text-xl font-bold text-heading">
                          {formatCurrency(approvedAccommodationAmount)}
                        </p>
                      )}

                      {isChangingAccommodationBudget ? (
                        <Button
                          type="button"
                          size="sm"
                          className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={handleSaveAccommodationBudget}
                        >
                          Save
                        </Button>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0 border-primary/40 text-primary hover:bg-primary/10"
                            onClick={() => {
                              setAccommodationAmountInput('0')
                              setIsAccommodationAmountTouched(false)
                              setIsAccommodationAmountLimitExceeded(false)
                              setIsChangingAccommodationBudget(true)
                            }}
                          >
                            Change Budget
                          </Button>

                          {approvedAccommodationAmount !==
                            currentAccommodationAmount && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="shrink-0"
                              onClick={handleResetAccommodationBudget}
                            >
                              Reset Budget
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {!isChangingAccommodationBudget &&
                      approvedAccommodationAmount !==
                        currentAccommodationAmount && (
                        <p className="text-xs text-muted-foreground">
                          Budget updated for this approval. You can reset
                          it to the original amount at any time.
                        </p>
                      )}

                    {!isChangingAccommodationBudget &&
                      showAccommodationAmountError && (
                        <p className="text-xs text-destructive">
                          Accommodation Budget must be greater than zero
                          and cannot exceed Rp 100.000.000. Click Change
                          Budget to enter a valid amount.
                        </p>
                      )}

                    {isChangingAccommodationBudget && (
                      <p className="text-xs text-muted-foreground">
                        Enter the new budget and click Save to apply it
                        to this approval.
                      </p>
                    )}
                  </div>

                  {/* Reimbursement Limit per Employee */}
                  <div className="min-w-0 space-y-3">
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-heading">
                          Reimbursement Limit per Employee
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Set the total reimbursement limit for each
                          participant for the entire trip.
                        </p>
                      </div>

                      <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <Users className="h-5 w-5" />
                        {proposal.participants.length} Participants
                      </span>
                    </div>

                    {proposal.participants.map((participant, index) => {
                      const amount =
                        participantAmounts[participant.employeeId] ?? '0'

                      const numericAmount = Number(amount)

                      const isInvalid =
                        amount.trim() === '' ||
                        !Number.isFinite(numericAmount) ||
                        numericAmount <= 0

                      const showAmountLimitWarning =
                        numericAmount > MAX_TRIP_AMOUNT ||
                        Boolean(
                          participantAmountLimitWarnings[
                            participant.employeeId
                          ],
                        )

                      const showAmountError =
                        showAmountLimitWarning ||
                        (
                          (
                            touchedParticipantAmounts[
                              participant.employeeId
                            ] ||
                            hasAttemptedFinanceApproval
                          ) &&
                          isInvalid
                        )

                      const amountErrorMessage =
                        showAmountLimitWarning
                          ? 'Maximum reimbursement limit is Rp 100.000.000.'
                          : 'Amount must be greater than zero.'

                      return (
                        <div
                          key={participant.employeeId}
                          className="grid min-w-0 grid-cols-1 gap-3 rounded-lg border border-border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,300px)] sm:items-center"
                        >
                          {/* Participant Information */}
                          <div className="min-w-0">
                            <p className="break-words text-sm font-semibold">
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

                          {/* Participant Amount Input */}
                          <div className="min-w-0">
                            <Label
                              htmlFor={`amount-${participant.employeeId}`}
                              className="sr-only"
                            >
                              Reimbursement limit for{' '}
                              {participant.employeeName || 'participant'}
                            </Label>

                            {index === 0 ? (
                              <div className="flex min-w-0 items-start gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                      Rp
                                    </span>

                                    <input
                                      id={`amount-${participant.employeeId}`}
                                      type="text"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={formatNumericInput(amount)}
                                      placeholder="0"
                                      onChange={(event) =>
                                        handleParticipantAmountChange(
                                          participant.employeeId,
                                          event.target.value,
                                        )
                                      }
                                      onFocus={() => {
                                        if (amount === '0') {
                                          handleParticipantAmountChange(
                                            participant.employeeId,
                                            '',
                                          )
                                        }
                                      }}
                                      onBlur={() => {
                                        setTouchedParticipantAmounts(
                                          (current) => ({
                                            ...current,
                                            [participant.employeeId]: true,
                                          }),
                                        )
                                      }}
                                      className={`h-10 w-full rounded-md border bg-input pl-10 pr-3 text-sm ${
                                        showAmountError
                                          ? 'border-destructive'
                                          : 'border-border'
                                      }`}
                                    />
                                  </div>

                                  {showAmountError && (
                                    <p className="mt-1 text-xs text-destructive">
                                      {amountErrorMessage}
                                    </p>
                                  )}
                                </div>

                                {proposal.participants.length > 1 &&
                                  !isInvalid &&
                                  !showAmountLimitWarning &&
                                  !isSameAmountApplied && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="mt-0.5 h-10 shrink-0 border-primary/30 px-3 text-xs font-semibold text-primary hover:bg-primary/10"
                                      onClick={handleApplySameAmount}
                                    >
                                      Apply to all
                                    </Button>
                                  )}
                              </div>
                            ) : (
                              <>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                    Rp
                                  </span>

                                  <input
                                    id={`amount-${participant.employeeId}`}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={formatNumericInput(amount)}
                                    placeholder="0"
                                    onChange={(event) =>
                                      handleParticipantAmountChange(
                                        participant.employeeId,
                                        event.target.value,
                                      )
                                    }
                                    onFocus={() => {
                                      if (amount === '0') {
                                        handleParticipantAmountChange(
                                          participant.employeeId,
                                          '',
                                        )
                                      }
                                    }}
                                    onBlur={() => {
                                      setTouchedParticipantAmounts(
                                        (current) => ({
                                          ...current,
                                          [participant.employeeId]: true,
                                        }),
                                      )
                                    }}
                                    className={`h-10 w-full rounded-md border bg-input pl-10 pr-3 text-sm ${
                                      showAmountError
                                        ? 'border-destructive'
                                        : 'border-border'
                                    }`}
                                  />
                                </div>

                                {showAmountError && (
                                  <p className="mt-1 text-xs text-destructive">
                                    {amountErrorMessage}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Total Proposal Budget */}
                  <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 p-4">
                    <p className="min-w-0 text-base font-semibold text-heading">
                      Total Proposal Budget
                    </p>

                    <p className="shrink-0 text-lg font-bold text-heading">
                      {(
                        isChangingAccommodationBudget
                          ? hasValidAccommodationDraft
                          : hasValidAccommodationAmount
                      )
                        ? formatCurrency(projectedTotalAmount)
                        : '-'}
                    </p>
                  </div>

                  {/* Finance Approval Limit Warning */}
                  {exceedsFinanceLimit && (
                    <div className="flex min-w-0 gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                      <div className="min-w-0 space-y-1">
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
                          . This proposal will be automatically forwarded
                          to the Finance Manager when you confirm.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Participant Validation Warning */}
                  {hasAttemptedFinanceApproval &&
                    !hasValidParticipantAmounts && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Please enter a valid reimbursement limit greater
                        than zero and not exceeding Rp 100.000.000 for
                        every participant before approving.
                      </p>
                    )}
                </div>
              )}

            {/* Approval Notes */}
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
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="shrink-0 gap-2 border-t border-border pt-4 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="button"
              disabled={
                isMutationPending ||
                (
                  (actionType === 'Rejected' ||
                    actionType === 'NeedsRevision') &&
                  !notes.trim()
                )
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

// Membaca marker perubahan Accommodation Budget dari Notes.
// Format marker:
// [ACCOMMODATION_BUDGET:nominalLama|nominalBaru]
function parseAccommodationBudgetNotes(
  notes: string | null | undefined,
): {
  notes: string | null
  accommodationAmountBefore?: number
  accommodationAmountAfter?: number
} {
  if (!notes) {
    return {
      notes: null,
    }
  }

  const markerRegex =
    /^\[ACCOMMODATION_BUDGET:([0-9]+(?:\.[0-9]+)?)\|([0-9]+(?:\.[0-9]+)?)\]\r?\n?/

  const match = notes.match(markerRegex)

  if (!match) {
    return {
      notes,
    }
  }

  const accommodationAmountBefore = Number(match[1])
  const accommodationAmountAfter = Number(match[2])

  return {
    notes: notes.slice(match[0].length).trim() || null,
    accommodationAmountBefore,
    accommodationAmountAfter,
  }
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

// Format input angka dengan titik pemisah ribuan.
// Contoh: 1000000 menjadi 1.000.000.
// Nilai mentah di state tetap berupa angka tanpa titik.
function formatNumericInput(value: string | number) {
  const digits = String(value ?? '').replace(/\D/g, '')

  if (!digits) return ''

  return new Intl.NumberFormat('id-ID').format(Number(digits))
}

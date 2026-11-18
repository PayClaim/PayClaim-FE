import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  useApproveTripProposalMutation,
  useRejectTripProposalMutation,
} from '#/features/trip-proposals/queries/queries'

import type { ApprovalAction } from '#/types/tripProposals.type'

import { MAX_TRIP_AMOUNT } from '#/features/trip-proposals/utils/tripProposalDetailUtils'

import type { TripProposalDetailResponse } from '#/types/tripProposals.type'

type Props = {
  id: string
  proposal: TripProposalDetailResponse | undefined
  isFinanceApprovalStage: boolean
  isFinanceManager: boolean
  isAdmin: boolean
  isFinanceManagerReview: boolean
}

export function useTripProposalApproval({
  id,
  proposal,
  isFinanceApprovalStage,
  isFinanceManager,
  isAdmin,
  isFinanceManagerReview,
}: Props) {
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
const handleParticipantAmountChange = (
  employeeId: string,
  amount: string,
) => {
  // Perubahan manual pada peserta mana pun membatalkan Apply to all.
  setIsSameAmountApplied(false)

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

  // Finance Limit berlaku untuk total keseluruhan proposal (hanya memicu eskalasi di tahap Finance).
  const exceedsFinanceLimit =
    Boolean(proposal) &&
    !isFinanceManager &&
    !isAdmin &&
    !isFinanceManagerReview &&
    (
      isChangingAccommodationBudget
        ? hasValidAccommodationDraft
        : hasValidAccommodationAmount
    ) &&
    hasValidParticipantAmounts &&
    (proposal?.financeLimit ?? 0) > 0 &&
    projectedTotalAmount > (proposal?.financeLimit ?? 0)

  const openApprovalDialog = () => {
    setActionType('Approved')
    setNotes('')
    setIsSameAmountApplied(false)

    setApprovedAccommodationAmount(currentAccommodationAmount)

    setAccommodationAmountInput(
      currentAccommodationAmount > 0
        ? String(currentAccommodationAmount)
        : '0',
    )

    setIsChangingAccommodationBudget(false)

    setIsAccommodationAmountTouched(false)
    setTouchedParticipantAmounts({})
    setHasAttemptedFinanceApproval(false)
    setIsAccommodationAmountLimitExceeded(false)
    setParticipantAmountLimitWarnings({})

    setDialogOpen(true)
  }

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
          ...(isFinanceApprovalStage
            ? {
                totalAmount: approvedAccommodationAmount,
                participants,
              }
            : {}),
        })

        if (
          isFinanceApprovalStage &&
          !isFinanceManager &&
          !isAdmin &&
          !isFinanceManagerReview &&
          exceedsFinanceLimit
        ) {
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

  return {
    actionType,
    setActionType,

    dialogOpen,
    setDialogOpen,

    notes,
    setNotes,

    accommodationAmountInput,
    setAccommodationAmountInput,
    approvedAccommodationAmount,
    currentAccommodationAmount,
    isChangingAccommodationBudget,
    setIsChangingAccommodationBudget,

    participantAmounts,
    isSameAmountApplied,
    touchedParticipantAmounts,
    setTouchedParticipantAmounts,

    isAccommodationAmountTouched,
    setIsAccommodationAmountTouched,
    isAccommodationAmountLimitExceeded,
    setIsAccommodationAmountLimitExceeded,
    participantAmountLimitWarnings,
    hasAttemptedFinanceApproval,

    isMutationPending,
    formatCurrency,

    hasValidAccommodationDraft,
    hasValidAccommodationAmount,
    showAccommodationAmountError,
    hasValidParticipantAmounts,
    projectedTotalAmount,
    exceedsFinanceLimit,

    handleAccommodationAmountChange,
    handleSaveAccommodationBudget,
    handleResetAccommodationBudget,
    handleParticipantAmountChange,
    handleApplySameAmount,
    openApprovalDialog,
    handleAction,
  }
}
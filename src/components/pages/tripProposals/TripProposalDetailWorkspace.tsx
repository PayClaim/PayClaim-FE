
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  SquarePen,
} from 'lucide-react'

import { getCurrentUser } from '#/features/auth/queries/queries'

import { useGetProposalByIdQuery } from '#/features/trip-proposals/queries/queries'

import { TripProposalHeader } from '#/components/pages/tripProposals/TripProposalHeader'
import { TripProposalSidebar } from '#/components/pages/tripProposals/TripProposalSidebar'
import {
  TripProposalTimeline,
  type ProposalTimelineItem,
} from '#/components/pages/tripProposals/TripProposalTimeline'
import { TripProposalApprovalDialog } from '#/components/pages/tripProposals/TripProposalApprovalDialog'
import { TripProposalClaimCard } from '#/components/pages/tripProposals/TripProposalClaimCard'

import { useTripProposalApproval } from '#/features/trip-proposals/hooks/useTripProposalApproval'

import {
  getFileName,
  parseAccommodationBudgetNotes,
} from '#/features/trip-proposals/utils/tripProposalDetailUtils'

import {
  TripProposalStatus,
  isTripStatus,
} from '#/types/tripProposals.type'

import { Button } from '#/components/ui/button'
import { DetailPageSkeleton } from '#/components/ui/page-skeleton'
import { SkeletonSwap } from '#/components/ui/skeleton-swap'

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

  // Role pengguna yang sedang login.
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

  // Status proposal.
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

  // Semua state dan logic approval dikelola oleh custom hook.
  const {
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
  } = useTripProposalApproval({
    id,
    proposal,
    isFinanceApprovalStage,
    isFinanceManager,
  })

  // Mencari data peserta yang sesuai dengan pengguna login.
  const myParticipant =
    (
      user?.employeeId
        ? proposal?.participants?.find(
            (participant) =>
              String(participant.employeeId).toLowerCase() ===
              String(user.employeeId).toLowerCase(),
          )
        : undefined
    ) ??
    (
      user?.employeeNumber
        ? proposal?.participants?.find(
            (participant) =>
              participant.employeeNumber?.trim().toLowerCase() ===
              user.employeeNumber.trim().toLowerCase(),
          )
        : undefined
    ) ??
    (
      user?.fullName
        ? proposal?.participants?.find(
            (participant) =>
              participant.employeeName?.trim().toLowerCase() ===
              user.fullName.trim().toLowerCase(),
          )
        : undefined
    )

  const isPic = Boolean(myParticipant?.isPic)

  // Menentukan apakah pengguna boleh melakukan approval.
  const canTakeAction =
    Boolean(proposal) &&
    (!isPic || isAdmin) &&
    (
      (
        isAdmin &&
        (
          isSubmitted ||
          isUnderReview ||
          isFinanceManagerReview
        )
      ) ||
      (isManager && isSubmitted) ||
      (isFinance && isUnderReview) ||
      (
        isFinanceManager &&
        (isUnderReview || isFinanceManagerReview)
      )
    )

  // Loading state.
  if (isLoading) {
    return (
      <SkeletonSwap loading skeleton={<DetailPageSkeleton />}>
        {null}
      </SkeletonSwap>
    )
  }

  // Error state.
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

  // Attachment information.
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

  // Approval history.
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

  // Menentukan tahap approval yang dilewati.
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

  // Submission information.
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
        (
          isPending || isSkipped
            ? roleName
            : 'Approver name unavailable'
        ),
      approverRole: roleName,
      decision:
        approval?.decision ||
        (
          isPending
            ? 'Pending'
            : isSkipped
              ? 'Skipped'
              : 'Not recorded'
        ),
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

  // Menyusun timeline dari tahap terbaru sampai submission.
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

  // Label tombol approval sesuai tahap workflow.
  const approvalButtonLabel = isSubmitted
    ? 'Approve (Manager)'
    : isUnderReview && !isFinanceManager
      ? 'Approve (Finance)'
      : 'Approve (Finance Manager)'

  // Tombol approval, revision, dan rejection.
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

  // Tombol edit hanya tersedia bagi PIC saat NeedsRevision.
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

  // Data klaim reimbursement peserta yang sedang login.
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

  const claimCard = (
    <TripProposalClaimCard
      proposalId={proposal.id}
      canClaim={canClaim}
      hasRemainingBudget={hasRemainingBudget}
      totalBudget={myTotalBudget}
      remainingBudget={myRemainingBudget}
      claimedAmount={myClaimedAmount}
      formatCurrency={formatCurrency}
    />
  )

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1600px] space-y-4">
      {/* Revision Warning */}
      {isNeedsRevision && isPic && !isAdmin && (
        <div className="flex min-w-0 items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400"
            aria-hidden="true"
          />

          <div className="min-w-0 text-sm">
            <p className="font-semibold">Revision Required</p>

            <p className="mt-0.5 text-xs">
              This proposal was returned by the reviewer for revision.
              Please check the notes on the process card, then click{' '}
              <strong>Edit &amp; Resubmit Proposal</strong> to resubmit.
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
      <TripProposalApprovalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        actionType={actionType}
        isFinanceApprovalStage={isFinanceApprovalStage}
        destination={proposal.destination}
        currentAccommodationAmount={currentAccommodationAmount}
        isMutationPending={isMutationPending}
        notes={notes}
        onNotesChange={setNotes}
        onAction={handleAction}
        formatCurrency={formatCurrency}
        accommodationAmountInput={accommodationAmountInput}
        onAccommodationAmountChange={handleAccommodationAmountChange}
        onAccommodationAmountFocus={() => {
          if (accommodationAmountInput === '0') {
            setAccommodationAmountInput('')
          }
        }}
        onAccommodationAmountBlur={() =>
          setIsAccommodationAmountTouched(true)
        }
        isChangingAccommodationBudget={isChangingAccommodationBudget}
        approvedAccommodationAmount={approvedAccommodationAmount}
        onSaveAccommodationBudget={handleSaveAccommodationBudget}
        onChangeAccommodationBudget={() => {
          setAccommodationAmountInput('0')
          setIsAccommodationAmountTouched(false)
          setIsAccommodationAmountLimitExceeded(false)
          setIsChangingAccommodationBudget(true)
        }}
        onResetAccommodationBudget={handleResetAccommodationBudget}
        showAccommodationAmountError={showAccommodationAmountError}
        isAccommodationAmountLimitExceeded={
          isAccommodationAmountLimitExceeded
        }
        participants={proposal.participants}
        participantAmounts={participantAmounts}
        onParticipantAmountChange={handleParticipantAmountChange}
        onParticipantAmountFocus={(employeeId) => {
          const amount = participantAmounts[employeeId] ?? '0'

          if (amount === '0') {
            handleParticipantAmountChange(employeeId, '')
          }
        }}
        onParticipantAmountBlur={(employeeId) => {
          setTouchedParticipantAmounts((current) => ({
            ...current,
            [employeeId]: true,
          }))
        }}
        touchedParticipantAmounts={touchedParticipantAmounts}
        participantAmountLimitWarnings={participantAmountLimitWarnings}
        hasAttemptedFinanceApproval={hasAttemptedFinanceApproval}
        hasValidParticipantAmounts={hasValidParticipantAmounts}
        isSameAmountApplied={isSameAmountApplied}
        onApplySameAmount={handleApplySameAmount}
        hasValidAccommodationDraft={hasValidAccommodationDraft}
        hasValidAccommodationAmount={hasValidAccommodationAmount}
        projectedTotalAmount={projectedTotalAmount}
        exceedsFinanceLimit={exceedsFinanceLimit}
        financeLimit={proposal.financeLimit ?? 0}
      />
    </main>
  )
}

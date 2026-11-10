import { createFileRoute } from '@tanstack/react-router'

import { useGetProposalByIdQuery } from '#/features/trip-proposals/queries/queries'

import { TripProposalHeader } from '#/components/pages/tripProposals/TripProposalHeader'
import { TripProposalSidebar } from '#/components/pages/tripProposals/TripProposalSidebar'
import {
  TripProposalTimeline,
  type ProposalTimelineItem,
} from '#/components/pages/tripProposals/TripProposalTimeline'

import { TripProposalStatus, isTripStatus } from '#/types/tripProposals.type'

export const Route = createFileRoute('/_app/trip-proposals/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  const {
    data: proposal,
    isLoading,
    isError,
    error,
  } = useGetProposalByIdQuery(id)

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

  // Menyiapkan URL file dari backend.
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

  // Mengambil record approval terbaru untuk setiap level.
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

  // Menentukan apakah tahapan Finance dan Finance Manager diperlukan.
  const showFinanceStage =
    Boolean(financeApproval || financeManagerApproval) ||
    [
      TripProposalStatus.UnderReview,
      TripProposalStatus.FinanceManagerReview,
      TripProposalStatus.Approved,
      TripProposalStatus.Completed,
    ].includes(proposal.status)

  const showFinanceManagerStage =
    Boolean(financeManagerApproval) ||
    proposal.status === TripProposalStatus.FinanceManagerReview

  // Menampilkan aktivitas Submitted dari backend jika tersedia.
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

  // Membuat card untuk setiap tahapan approval.
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

  // Urutan dari tahap terakhir di atas ke Submitted di bawah.
  const timelineStages: ProposalTimelineItem[] = []

  if (showFinanceManagerStage) {
    timelineStages.push(
      createApprovalStage(
        3,
        'Finance Manager Approval (Level 3)',
        'Finance Manager',
        financeManagerApproval,
        proposal.status === TripProposalStatus.FinanceManagerReview,
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
        proposal.status === TripProposalStatus.UnderReview,
      ),
    )
  }

  timelineStages.push(
    createApprovalStage(
      1,
      'Manager Approval (Level 1)',
      'Direct Manager',
      managerApproval,
      proposal.status === TripProposalStatus.Submitted,
    ),
  )

  // Submission selalu menjadi aktivitas paling bawah.
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

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-4">

      {/* Header tetap menggunakan desain sebelumnya. */}
      <TripProposalHeader proposal={proposal} />

      {/* Workspace dua panel seperti halaman Claim Detail. */}
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
          />
        
      </div>
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
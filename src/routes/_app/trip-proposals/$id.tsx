import { createFileRoute } from '@tanstack/react-router'

import { useGetProposalByIdQuery } from '#/features/trip-proposals/queries/queries'

import { TripProposalHeader } from '#/components/pages/tripProposals/TripProposalHeader'
import { TripProposalSidebar } from '#/components/pages/tripProposals/TripProposalSidebar'
import {
  TripProposalTimeline,
  type ProposalTimelineItem,
} from '#/components/pages/tripProposals/TripProposalTimeline'
import { TripProposalStatus } from '#/types/tripProposals.type'
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
      <main className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          Loading trip proposal details...
        </div>
      </main>
    )
  }

  if (isError || !proposal) {
    return (
      <main className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-destructive bg-card p-8 text-destructive">
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

  // Mengambil aktivitas approval dari backend.
// Mengambil aktivitas approval dari backend.
const activities: ProposalTimelineItem[] = (
  proposal.approvalHistory || []
).map((history) => ({
  id: `approval-${history.id}`,
  approverName: history.approverName,
  decision: history.decision,
  approvalLevel: history.approvalLevel,
  decidedAt: history.decidedAt,
}))

// Menambahkan Submitted sementara jika belum ada dari backend.
const hasSubmittedActivity = activities.some(
  (activity) => activity.decision.toLowerCase() === 'submitted',
)

if (!hasSubmittedActivity) {
  const pic = proposal.participants.find(
    (participant) => participant.isPic,
  )

  activities.push({
    id: 'submission',
    approverName: pic?.employeeName || 'Proposal PIC',
    decision: 'Submitted',
    approvalLevel: null,
    decidedAt: proposal.submittedAt,
  })
}

// Menentukan siapa yang sedang menunggu untuk melakukan approval.
let pendingApprover: string | null = null

switch (proposal.status) {
  case TripProposalStatus.Submitted:
    pendingApprover = 'Manager'
    break

  case TripProposalStatus.UnderReview:
    pendingApprover = 'Finance'
    break

  case TripProposalStatus.FinanceManagerReview:
    pendingApprover = 'Finance Manager'
    break
}

// Urutkan aktivitas terbaru dahulu.
// Dengan demikian proses dibaca dari bawah ke atas.
activities.sort(
  (a, b) =>
    new Date(b.decidedAt).getTime() -
    new Date(a.decidedAt).getTime(),
)

// Pending selalu berada paling atas.
const timelineActivities: ProposalTimelineItem[] = [
  ...(pendingApprover
    ? [
        {
          id: 'pending-current',
          approverName: pendingApprover,
          decision: 'Pending',
          approvalLevel: null,
          decidedAt: '',
          isPending: true,
        },
      ]
    : []),

  ...activities,
]

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <TripProposalHeader proposal={proposal} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <TripProposalSidebar proposal={proposal} />

        <TripProposalTimeline
            activities={timelineActivities}
            attachmentUrl={attachmentUrl}
            attachmentFileName={attachmentFileName}
          isPdf={isPdf}
        />
      </div>
    </main>
  )
}

function getFileName(path: string) {
  if (!path) return ''

  const fileName = path.split(/[\\/]/).pop()?.split(/[?#]/)[0] || path

  try {
    return decodeURIComponent(fileName)
  } catch {
    return fileName
  }
}
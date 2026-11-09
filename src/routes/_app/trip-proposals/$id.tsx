
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import { Badge, getTripProposalBadgeColor } from '#/components/ui/badge'

import { useGetProposalByIdQuery } from '#/features/trip-proposals/queries/queries'

export const Route = createFileRoute('/_app/trip-proposals/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const {
    data: proposal,
    isLoading,
    isError,
    error,
  } = useGetProposalByIdQuery(id)

  // Loading
  if (isLoading) {
    return (
      <main className="space-y-4">
        <p className="text-muted-foreground">
          Loading trip proposal details...
        </p>
      </main>
    )
  }

  // Error
  if (isError) {
    return (
      <main className="space-y-4">
        <p className="font-semibold text-destructive">
          Failed to load trip proposal.
        </p>

        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>

        <Button
          variant="outline"
          onClick={() => navigate({ to: '/trip-proposals' })}
        >
          Back to Proposals
        </Button>
      </main>
    )
  }

  if (!proposal) {
    return (
      <main className="space-y-4">
        <p>Trip proposal not found.</p>

        <Button
          variant="outline"
          onClick={() => navigate({ to: '/trip-proposals' })}
        >
          Back to Proposals
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6">

      {/* Breadcrumb and Back Button */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          Trip Proposals / {proposal.id}
        </p>

        <Button
          variant="outline"
          onClick={() => navigate({ to: '/trip-proposals' })}
        >
          Back to Proposals
        </Button>
      </div>

      {/* Page Header */}
      <section className="space-y-4 rounded-xl border border-border bg-card p-6">

        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="default"
            color={getTripProposalBadgeColor(proposal.status)}
          >
            {proposal.status}
          </Badge>

          <span className="text-sm text-muted-foreground">
            {proposal.id}
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Perjalanan dinas: {proposal.destination}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Detail informasi pengajuan perjalanan dinas.
          </p>
        </div>

        <div className="border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">
            Total estimasi biaya
          </p>

          <p className="mt-1 text-3xl font-bold">
            {formatCurrency(proposal.totalAmount)}
          </p>
        </div>
      </section>

      {/* Trip Information */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-6 text-lg font-semibold">
          Informasi Perjalanan
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">

          <DetailItem
            label="Destinasi"
            value={proposal.destination}
          />

          <DetailItem
            label="Tanggal mulai"
            value={formatDate(proposal.startDate)}
          />

          <DetailItem
            label="Tanggal selesai"
            value={formatDate(proposal.endDate)}
          />

          <DetailItem
            label="Diajukan pada"
            value={formatDateTime(proposal.submittedAt)}
          />

          <div className="sm:col-span-2">
            <DetailItem
              label="Deskripsi"
              value={proposal.description}
            />
          </div>

        </div>
      </section>

      {/* Participants */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              PIC dan Peserta
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Daftar karyawan yang mengikuti perjalanan dinas.
            </p>
          </div>

          <Badge variant="outline">
            {proposal.participants.length} Participants
          </Badge>
        </div>

        <div className="space-y-3">
          {proposal.participants.map((participant) => (
            <div
              key={participant.employeeId}
              className="flex flex-col justify-between gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">
                    {participant.employeeName || 'Unknown Employee'}
                  </p>

                  {participant.isPic && (
                    <Badge color="info">
                      PIC
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {participant.employeeNumber || '-'}
                </p>

                <p className="text-xs text-muted-foreground">
                  Employee ID: {participant.employeeId}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs text-muted-foreground">
                  Alokasi biaya
                </p>

                <p className="font-semibold">
                  {formatCurrency(participant.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Proposal Attachment */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Lampiran Proposal
        </h2>

        {proposal.filePath ? (
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <div className="rounded-md bg-muted p-3">
              <span className="text-xl">📄</span>
            </div>

            <div className="min-w-0">
              <p className="break-all text-sm font-medium">
                {getFileName(proposal.filePath)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {proposal.filePath}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No proposal attachment.
          </p>
        )}
      </section>

      {/* Approval History */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-2 text-lg font-semibold">
          Riwayat Persetujuan
        </h2>

        <p className="mb-6 text-sm text-muted-foreground">
          Riwayat proses persetujuan perjalanan dinas.
        </p>

        {proposal.approvalHistory.length > 0 ? (
          <div className="space-y-6">
            {[...proposal.approvalHistory]
              .sort((a, b) => a.approvalLevel - b.approvalLevel)
              .map((history, index) => (
                <div
                  key={history.id}
                  className="relative flex gap-4"
                >
                  {/* Timeline Number */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </div>

                    {index !== proposal.approvalHistory.length - 1 && (
                      <div className="mt-2 h-full min-h-12 w-px bg-border" />
                    )}
                  </div>

                  {/* Approval Information */}
                  <div className="min-w-0 flex-1 space-y-2 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">
                        {history.approverName}
                      </p>

                      <Badge variant="outline">
                        {history.decision}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Approval Level {history.approvalLevel}
                      {' · '}
                      {formatDateTime(history.decidedAt)}
                    </p>

                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">
                        {history.notes || 'No notes provided.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="font-medium">
              No approval history yet.
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Approval records will appear here after the proposal is reviewed.
            </p>
          </div>
        )}
      </section>

    </main>
  )
}

// Reusable detail item
function DetailItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="text-sm font-medium whitespace-pre-wrap">
        {value || '-'}
      </p>
    </div>
  )
}

// Format Rupiah
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format DateOnly
function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Format DateTime
function formatDateTime(date: string) {
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get file name from path
function getFileName(path: string) {
  return path.split(/[\\/]/).pop() || path
}

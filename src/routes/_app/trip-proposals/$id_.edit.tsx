
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { ErrorComponent, LoadingComponent } from '#/components/ErrorAndLoading'

import { TripProposalEditForm } from '#/components/pages/tripProposals/TripProposalEditForm'
import { useGetProposalByIdQuery } from '#/features/trip-proposals/queries/queries'
import { useGetAllEmployeesQuery } from '#/features/employees/queries/queries'

import { useAuth } from '#/hooks/auth.hook'

import {
  TripProposalStatus,
  isTripStatus,
} from '#/types/tripProposals.type'

export const Route = createFileRoute('/_app/trip-proposals/$id_/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { user } = useAuth()

  const {
    data: proposal,
    isError,
    error,
    isLoading,
  } = useGetProposalByIdQuery(id)

  const {
    data: employees = [],
    isLoading: isLoadingEmployees,
  } = useGetAllEmployeesQuery()

  if (isError) {
    return (
      <ErrorComponent
        pageTitle="Revise Trip Proposal"
        error={error}
      />
    )
  }

  if (isLoading || !proposal || !user || isLoadingEmployees) {
    return <LoadingComponent pageTitle="Revise Trip Proposal" />
  }

  // Cari data employee berdasarkan email akun yang sedang login.
  const currentEmployee = employees.find(
    (employee) =>
      employee.email.toLowerCase() === user.email.toLowerCase(),
  )

  if (!currentEmployee) {
    return (
      <main className="mx-auto max-w-4xl py-10">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          Data karyawan untuk akun yang sedang login tidak ditemukan.
        </div>
      </main>
    )
  }

  // Hanya PIC yang boleh merevisi proposal.
  const isPic = Boolean(
    proposal.participants?.some(
      (participant) =>
        participant.isPic &&
        String(participant.employeeId).toLowerCase() ===
          String(currentEmployee.id).toLowerCase(),
    ),
  )

  const isNeedsRevision = isTripStatus(
    proposal.status,
    TripProposalStatus.NeedsRevision,
  )

  // Batasi akses form hanya untuk PIC pada status NeedsRevision.
  if (!isPic || !isNeedsRevision) {
    return (
      <main className="mx-auto max-w-4xl space-y-4 py-8">
        <Link
          to="/trip-proposals/$id"
          params={{ id }}
        >
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Detail Proposal</span>
          </Button>
        </Link>

        <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 text-sm font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {!isPic
            ? 'Hanya PIC proposal yang dapat melakukan revisi pada pengajuan ini.'
            : 'Proposal ini tidak berstatus Needs Revision sehingga tidak dapat diubah.'}
        </div>
      </main>
    )
  }

  return (
    <TripProposalEditForm
      proposalId={id}
      proposal={proposal}
      currentEmployee={currentEmployee}
      employees={employees}
    />
  )
}

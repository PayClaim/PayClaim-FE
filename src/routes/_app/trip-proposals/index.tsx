
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { Badge, getTripProposalBadgeColor } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

import { useGetAllProposalsQuery } from '#/features/trip-proposals/queries/queries'
import {
  TripProposalStatus,
  type TripProposal,
} from '#/types/tripProposals.type'

export const Route = createFileRoute('/_app/trip-proposals/')({
  component: RouteComponent,
})

function RouteComponent() {
  // Mengambil data Trip Proposals dari backend
  const {
    data: proposals = [],
    isError,
    isFetching,
    error,
  } = useGetAllProposalsQuery()

  // State untuk menyimpan nilai filter
  const [statusFilter, setStatusFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')
  const [searchFilter, setSearchFilter] = useState('')

  // Tampilan ketika data sedang dimuat
  if (isFetching && proposals.length === 0) {
    return <p>Loading trip proposals...</p>
  }

  // Tampilan ketika gagal mengambil data
  if (isError) {
    return (
      <div className="space-y-2">
        <p className="font-medium text-destructive">
          Failed to load trip proposals.
        </p>

        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  // Filter data berdasarkan pencarian, status, dan bulan
  const filteredProposals = proposals.filter((proposal) => {
    const search = searchFilter.toLowerCase()

    const matchesSearch =
      proposal.destination.toLowerCase().includes(search) ||
      (proposal.picName?.toLowerCase().includes(search) ?? false)

    const matchesStatus =
      statusFilter === 'all' || proposal.status === statusFilter

    const matchesMonth =
      monthFilter === 'all' ||
      (new Date(proposal.startDate).getMonth() + 1).toString() ===
        monthFilter

    return matchesSearch && matchesStatus && matchesMonth
  })

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold">Trip Proposals</h1>
        </div>

        <Button>
          New Proposal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Proposals"
          value={proposals.length}
        />

        <SummaryCard
          title="Submitted"
          value={proposals.filter(
            (proposal) =>
              proposal.status.toLowerCase() === 'submitted',
          ).length}
        />

        <SummaryCard
          title="Approved"
          value={proposals.filter(
            (proposal) =>
              proposal.status.toLowerCase() === 'approved',
          ).length}
        />

        <SummaryCard
          title="Completed"
          value={proposals.filter(
            (proposal) =>
              proposal.status.toLowerCase() === 'completed',
          ).length}
        />
      </div>

      {/* Proposal Table Section */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            All Proposals
          </h2>

          <p className="text-sm text-muted-foreground">
            View and manage your submitted business trips.
          </p>
        </div>

        {/* Search and Filters */}
        <FilterSection
          search={searchFilter}
          status={statusFilter}
          month={monthFilter}
          statuses={Object.values(TripProposalStatus)}
          setSearch={setSearchFilter}
          setStatus={setStatusFilter}
          setMonth={setMonthFilter}
        />

        {/* Table or Empty State */}
        {filteredProposals.length > 0 ? (
          <ProposalTable proposals={filteredProposals} />
        ) : (
          <div className="py-12 text-center">
            <p className="font-medium text-foreground">
              No trip proposals found.
            </p>
          </div>
        )}

        {/* Total Data */}
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredProposals.length} of {proposals.length} proposals
        </div>
      </section>
    </main>
  )
}

// Summary Card Component
function SummaryCard({
  title,
  value,
}: {
  title: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-medium text-muted-foreground">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-foreground">
        {value}
      </p>
    </div>
  )
}

// Proposal Table Component
function ProposalTable({
  proposals,
}: {
  proposals: TripProposal[]
}) {
  // Format angka menjadi mata uang Rupiah
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format tanggal
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="overflow-x-auto">
      <Table className="w-full text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-3">DESTINATION</TableHead>
            <TableHead className="px-4 py-3">TRIP DATE</TableHead>
            <TableHead className="px-4 py-3">PIC</TableHead>
            <TableHead className="px-4 py-3">PARTICIPANTS</TableHead>
            <TableHead className="px-4 py-3">TOTAL ESTIMATED</TableHead>
            <TableHead className="px-4 py-3">SUBMITTED</TableHead>
            <TableHead className="px-4 py-3">STATUS</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {proposals.map((proposal) => (
            <TableRow key={proposal.id}>
              <TableCell className="px-4 py-4 font-medium">
                {proposal.destination}
              </TableCell>

              <TableCell className="whitespace-nowrap px-4 py-4">
                <div>{formatDate(proposal.startDate)}</div>

                <div className="text-xs text-muted-foreground">
                  to {formatDate(proposal.endDate)}
                </div>
              </TableCell>

              <TableCell className="px-4 py-4">
                {proposal.picName || '-'}
              </TableCell>

              <TableCell className="px-4 py-4">
                {proposal.participantCount}
              </TableCell>

              <TableCell className="whitespace-nowrap px-4 py-4">
                {formatCurrency(proposal.totalAmount)}
              </TableCell>

              <TableCell className="whitespace-nowrap px-4 py-4">
                {formatDate(proposal.submittedAt)}
              </TableCell>

              <TableCell className="px-4 py-4">
                <Badge
                  variant="default"
                  color={getTripProposalBadgeColor(proposal.status)}
                >
                  {proposal.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Filter Section Component
function FilterSection({
  search,
  status,
  month,
  statuses,
  setSearch,
  setStatus,
  setMonth,
}: {
  search: string
  status: string
  month: string
  statuses: string[]
  setSearch: (value: string) => void
  setStatus: (value: string) => void
  setMonth: (value: string) => void
}) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search destination or PIC..."
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring md:max-w-sm"
      />

      {/* Status Filter */}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All Status</SelectItem>

            {statuses.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Month Filter */}
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Filter by month" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All Months</SelectItem>

            {months.map((item, index) => (
              <SelectItem
                key={item}
                value={(index + 1).toString()}
              >
                {item}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

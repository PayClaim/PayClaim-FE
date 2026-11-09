import { FilterSelect, FilterSelectNumber } from '#/components/FilterSelect'
import { SearchFilter } from '#/components/SearchFilter'
import { Badge, getTripProposalBadgeColor } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useGetAllClaimsQuery } from '#/features/claims/queries/queries'
import { toDateTimeString } from '#/lib/utils'
import type { ClaimResponse } from '#/types/claims.type'
// import { idNumberFormatter, usDateFormatter } from '#/lib/formatter'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/_app/claims/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: myClaimResponse, isError, isFetching } = useGetAllClaimsQuery()
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [monthFilter, setMonthFilter] = useState<number | null>(null)
  const [searchFilter, setSearchFilter] = useState<string>('')

  const monthOptions = [
    { label: 'Jan', optionValue: 0 },
    { label: 'Feb', optionValue: 1 },
    { label: 'Mar', optionValue: 2 },
    { label: 'Apr', optionValue: 3 },
    { label: 'May', optionValue: 4 },
    { label: 'Jun', optionValue: 5 },
    { label: 'Jul', optionValue: 6 },
    { label: 'Aug', optionValue: 7 },
    { label: 'Sep', optionValue: 8 },
    { label: 'Oct', optionValue: 9 },
    { label: 'Nov', optionValue: 10 },
    { label: 'Des', optionValue: 11 },
  ]

  const statusOptions = [
    { optionValue: 'Submitted', label: 'Submitted' },
    { optionValue: 'UnderReview', label: 'UnderReview' },
    { optionValue: 'NeedsRevision', label: 'NeedsRevision' },
    { optionValue: 'Approved', label: 'Approved' },
    { optionValue: 'Rejected', label: 'Rejected' },
    { optionValue: 'Paid', label: 'Paid' },
  ]

  if (isError || !myClaimResponse) return <div>Terjadi Error</div>
  if (isFetching) return <div>Loading...</div>

  const displayData = myClaimResponse.data.filter((c) => {
    const matchSearch =
      !searchFilter || c.benefitName?.toLowerCase().includes(searchFilter)
    const matchMonth =
      monthFilter === null || c.transactionDate.getMonth() === monthFilter
    const matchStatus = !statusFilter || c.status === statusFilter

    return matchSearch && matchMonth && matchStatus
  })

  return (
    <main>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">My Claims</h1>
        <Link to="/claims/create">
          <Button className="bg-primary">New Claim</Button>
        </Link>
      </div>
      <div className="bg-card p-8 rounded-2xl mb-8  border border-border">
        <div className="flex justify-start items-center gap-8 border-b border-border">
          <SearchFilter search={searchFilter} setSearch={setSearchFilter} />
          <FilterSelectNumber
            nullable
            val={monthFilter}
            setValue={setMonthFilter}
            options={monthOptions}
            filterLabel="By Month"
          />
          <FilterSelect
            nullable
            val={statusFilter}
            setValue={setStatusFilter}
            options={statusOptions}
            filterLabel="By Status"
          />
        </div>

        {/* Table */}
        {displayData.length != 0 ? (
          <ClaimTable claims={displayData} />
        ) : (
          <p>You have 0 Claims</p>
        )}
      </div>
    </main>
  )
}

function ClaimTable({ claims }: { claims: ClaimResponse[] }) {
  const navigate = useNavigate()
  const thClass = 'px-6 py-3 font-bold'
  return (
    <Table className="w-full text-sm text-left rtl:text-right text-body">
      <TableHeader className="text-sm border-b border-border">
        <TableRow>
          <TableHead className={thClass}>TYPE</TableHead>
          <TableHead className={thClass}>TRANSACTION DATE</TableHead>
          <TableHead className={thClass}>AMOUNT</TableHead>
          <TableHead className={thClass}>SUBMITTED</TableHead>
          <TableHead className={thClass}>STATUS</TableHead>
          <TableHead className={thClass}>BENEFIT/TRIP</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {claims.map((claim) => (
          <TableRow
            key={claim.id}
            className="cursor-pointer bg-neutral-primary-soft border-b border-default hover:bg-(--hover-shadow)"
            onClick={() => {
              console.log('Click')
              navigate({
                to: '/claims/$claimId',
                params: {
                  claimId: claim.id.toString(),
                },
              })
            }}
          >
            <TableCell className="px-6 py-4 font-medium text-heading whitespace-nowrap">
              {claim.claimType}
            </TableCell>
            <TableCell className="px-6 py-4">
              {claim.transactionDate.toString()}
            </TableCell>
            <TableCell className="px-6 py-4">{claim.amount}</TableCell>
            <TableCell className="px-6 py-4">
              {toDateTimeString(claim.submittedAt)}
            </TableCell>
            <TableCell className="px-6 py-4">
              <Badge
                variant="default"
                color={getTripProposalBadgeColor(claim.status)}
              >
                {claim.status}
              </Badge>
            </TableCell>
            <TableCell className="px-6 py-4">{claim.benefitName}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

import { ErrorComponent, LoadingComponent } from '#/components/ErrorAndLoading'
import { FilterSelect, FilterSelectNumber } from '#/components/FilterSelect'
import { SearchFilter } from '#/components/SearchFilter'
import { useGetAdminAllClaimsQuery } from '#/features/claims/queries/queries'
import {
  createFileRoute,
  useNavigate,
  useRouteContext,
} from '@tanstack/react-router'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import type { ClaimResponse } from '#/types/claims.type'
import { idNumberFormatter } from '#/lib/formatter'
import { toDateTimeString } from '#/lib/utils'
import { getClaimBadgeClass } from '#/components/ui/badge'
import { FileText } from 'lucide-react'

export const Route = createFileRoute('/_app/approval/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { user } = useRouteContext({ from: '/_app' })
  const canView = user.roles.some((r) =>
    ['Admin', 'Manager', 'Finance', 'Finance Manager'].includes(r),
  )

  if (!canView) {
    navigate({
      to: '/dashboard',
    })
  }

  const {
    data: claimResponse,
    isError,
    isFetching,
  } = useGetAdminAllClaimsQuery()

  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
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
    { label: 'Dec', optionValue: 11 },
  ]
  const statusOptions = [
    { optionValue: 'Submitted', label: 'Submitted' },
    { optionValue: 'UnderReview', label: 'UnderReview' },
    { optionValue: 'NeedsRevision', label: 'NeedsRevision' },
    { optionValue: 'Approved', label: 'Approved' },
    { optionValue: 'Paid', label: 'Paid' },
    { optionValue: 'Rejected', label: 'Rejected' },
  ]
  const typeOptions = [
    { optionValue: 'Benefit', label: 'Benefit' },
    { optionValue: 'OperationalReimbursement', label: 'Operational' },
    { optionValue: 'BusinessTripReimbursement', label: 'Business Trip' },
  ]

  if (isError) return <ErrorComponent pageTitle="Approval" />
  if (isFetching) return <LoadingComponent pageTitle="Approval" />

  const claimsList = claimResponse?.data || []

  const displayData = claimsList
    .filter((c) => {
      const searchLower = searchFilter.toLowerCase()
      const matchSearch =
        !searchFilter ||
        (c.employeeName &&
          c.employeeName.toLowerCase().includes(searchLower)) ||
        (c.benefitName && c.benefitName.toLowerCase().includes(searchLower)) ||
        (c.description && c.description.toLowerCase().includes(searchLower)) ||
        (c.tripProposalDescription &&
          c.tripProposalDescription.toLowerCase().includes(searchLower))

      const txDate = new Date(c.transactionDate)
      const matchMonth =
        monthFilter === null ||
        (!isNaN(txDate.getTime()) && txDate.getMonth() === monthFilter)

      const matchStatus = !statusFilter || c.status === statusFilter
      const matchType = !typeFilter || c.claimType === typeFilter

      return matchSearch && matchMonth && matchStatus && matchType
    })
    .sort((a, b) => {
      const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
      const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
      return timeB - timeA
    })

  return (
    <main>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Approval Claim</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review, approve, and disburse employee claims and reimbursements
          </p>
        </div>
      </div>
      <div className="bg-card p-8 rounded-2xl mb-8 border border-border">
        <div className="flex flex-wrap justify-start items-center gap-4 pb-6 border-b border-border">
          <SearchFilter search={searchFilter} setSearch={setSearchFilter} />
          <FilterSelect
            nullable
            val={typeFilter}
            setValue={setTypeFilter}
            options={typeOptions}
            filterLabel="Claim Type"
            nullLabel="All Types"
          />
          <FilterSelect
            nullable
            val={statusFilter}
            setValue={setStatusFilter}
            options={statusOptions}
            filterLabel="Status"
            nullLabel="All Statuses"
          />
          <FilterSelectNumber
            nullable
            val={monthFilter}
            setValue={setMonthFilter}
            options={monthOptions}
            filterLabel="By Month"
            nullLabel="All Months"
          />
        </div>

        {/* Table */}
        <div className="mt-6">
          <ClaimTable claims={displayData} />
        </div>
      </div>
    </main>
  )
}

function ClaimTable({
  claims,
  //   showEmployeeCol,
}: {
  claims: ClaimResponse[]
  //   showEmployeeCol: boolean
}) {
  const navigate = useNavigate()
  const thClass = 'px-6 py-3 font-bold'

  return (
    <Table className="w-full text-sm text-left rtl:text-right text-body max-w-full">
      <TableHeader className="text-sm border-b border-border">
        <TableRow>
          <TableHead className={thClass}>EMPLOYEE</TableHead>
          <TableHead className={thClass}>TYPE</TableHead>
          <TableHead className={thClass}>TRANSACTION DATE</TableHead>
          <TableHead className={thClass}>AMOUNT</TableHead>
          <TableHead className={thClass}>SUBMITTED</TableHead>
          <TableHead className={thClass}>STATUS</TableHead>
          <TableHead className={thClass}>BENEFIT / TRIP</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {claims.map((claim) => (
          <TableRow
            key={claim.id}
            className="cursor-pointer bg-neutral-primary-soft border-b border-default hover:bg-(--hover-shadow) transition-colors"
            onClick={() => {
              navigate({
                to: '/claims/$claimId',
                params: {
                  claimId: claim.id,
                },
              })
            }}
          >
            <TableCell className="px-6 py-4 font-medium text-heading whitespace-nowrap">
              {claim.employeeName || 'Unknown'}
            </TableCell>
            <TableCell className="px-6 py-4 font-medium text-heading whitespace-nowrap">
              {claim.claimType === 'OperationalReimbursement'
                ? 'Operational'
                : claim.claimType === 'BusinessTripReimbursement'
                  ? 'Business Trip'
                  : 'Benefit'}
            </TableCell>
            <TableCell className="px-6 py-4">
              {claim.transactionDate ? String(claim.transactionDate) : '-'}
            </TableCell>
            <TableCell className="px-6 py-4 font-semibold">
              {idNumberFormatter.format(claim.amount)}
            </TableCell>
            <TableCell className="px-6 py-4 text-muted-foreground">
              {claim.submittedAt
                ? toDateTimeString(new Date(claim.submittedAt))
                : '-'}
            </TableCell>
            <TableCell className="px-6 py-4">
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getClaimBadgeClass(
                  claim.status,
                )}`}
              >
                {claim.status}
              </span>
            </TableCell>
            <TableCell className="px-6 py-4">
              {claim.benefitName || claim.tripProposalDescription || '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>

      {claims.length <= 0 && (
        <TableFooter>
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center py-8 text-muted-foreground"
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <FileText className="h-6 w-6 text-muted-foreground/60" />
                <p>No claims found</p>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  )
}

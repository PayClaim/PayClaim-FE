import { FilterSelect } from '#/components/FilterSelect'
import { SearchFilter } from '#/components/SearchFilter'
import { getClaimBadgeClass } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { useGetAllClaimsQuery } from '#/features/claims/queries/queries'
import type { ClaimFilterParams } from '#/features/claims/queries/queries'
import { idNumberFormatter } from '#/lib/formatter'
import { toDateOnly, toDateTimeString } from '#/lib/utils'
import type { ClaimResponse, ClaimTypeEnum } from '#/types/claims.type'
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouteContext,
} from '@tanstack/react-router'
import { useState } from 'react'
import { FileText, Plus } from 'lucide-react'
import { ErrorComponent, LoadingComponent } from '#/components/ErrorAndLoading'
import { PaginationSection } from '#/components/PaginationSection'
import { DatePickerWithRange } from '#/components/DateRangePicker'
import type { DateRange } from 'react-day-picker'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'

export const Route = createFileRoute('/_app/claims/')({
  component: RouteComponent,
  validateSearch: (s) => s as ClaimFilterParams,
})

function RouteComponent() {
  const navigate = useNavigate()
  const params = Route.useSearch()
  const { isAdmin } = useRouteContext({ from: '/_app' })
  const {
    data: claimResponse,
    isError,
    isFetching,
  } = useGetAllClaimsQuery(params)

  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [date, setDate] = useState<DateRange | undefined>()
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [claimType, setClaimType] = useState<ClaimTypeEnum | undefined>()

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

  const claimsList = claimResponse?.data || []
  const applyFilterClick = async () => {
    await navigate({
      to: '.',
      search: {
        claimType: claimType,
        pageNumber: 0,
        pageSize: 10,
        startDate: toDateOnly(date?.from),
        endDate: toDateOnly(date?.to),
        status: statusFilter ? statusFilter : undefined,
      },
    })
  }

  if (isError)
    return <ErrorComponent pageTitle={isAdmin ? 'All Claims' : 'My Claims'} />

  if (isFetching || !claimResponse)
    return <LoadingComponent pageTitle={isAdmin ? 'All Claims' : 'My Claims'} />

  const { data, errors, message, statusCode, success, ...paginationProp } =
    claimResponse

  return (
    <main>
      {/* Heading */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">
            {isAdmin ? 'All Claims' : 'My Claims'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAdmin
              ? 'Monitor and review employee benefit and reimbursement claims'
              : 'Submit and track your benefit and reimbursement claims'}
          </p>
        </div>

        {!isAdmin && (
          <Link to="/claims/create">
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              <span>New Claim</span>
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-card p-8 rounded-2xl mb-8 border border-border">
        <div className="flex flex-wrap justify-between items-center gap-4 pb-6 border-b border-border">
          <SearchFilter search={searchFilter} setSearch={setSearchFilter} />

          <Popover>
            <PopoverTrigger asChild>
              <Button>Add Filter</Button>
            </PopoverTrigger>
            <PopoverContent align="end">
              <div className="">
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
                <DatePickerWithRange date={date} setDate={setDate} />
              </div>
              <Button className="w-full" onClick={applyFilterClick}>
                Apply Filter
              </Button>
            </PopoverContent>
          </Popover>
        </div>

        {/* Table */}
        <div className="mt-6">
          <ClaimTable claims={claimsList} />
        </div>
        <div>
          <PaginationSection pagination={paginationProp} />
        </div>
      </div>
    </main>
  )
}

function ClaimTable({ claims }: { claims: ClaimResponse[] }) {
  const navigate = useNavigate()
  const thClass = 'px-6 py-3 font-bold'

  return (
    <Table className="w-full text-sm text-left rtl:text-right text-body max-w-full">
      <TableHeader className="text-sm border-b border-border">
        <TableRow>
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
              colSpan={6}
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

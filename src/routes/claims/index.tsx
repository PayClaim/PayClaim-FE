import { Button } from '#/components/ui/button'
import { ButtonGroup } from '#/components/ui/button-group'
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
import { getAllClaimsQuery } from '#/features/claims/queries/getAllClaims'
// import { idNumberFormatter, usDateFormatter } from '#/lib/formatter'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/claims/')({
  component: RouteComponent,
})

interface TClaims {
  id: number
  types: string
  transaction_date: Date
  amount: number
  submittedAt: Date
  status: string
  benefitName: string
  tripLocation: string
}

function RouteComponent() {
  // const claims = Route.useLoaderData()
  const { data: claims, isError, isFetching } = getAllClaimsQuery()
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  if (isError) return <div>Terjadi Error</div>
  if (isFetching) return <div>Loading...</div>

  return (
    <main>
      <div className="mb-8 flex justify-between">
        <h1 className="text-3xl font-bold">20 Claims</h1>
        <Link to="/claims/create">
          <Button className="bg-primary">New Claim</Button>
        </Link>
      </div>
      <div>
        <div className="flex justify-start items-center gap-8 ">
          <div className="p-4">
            <label htmlFor="input-group-1" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 inset-s-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-body"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-width="2"
                    d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="input-group-1"
                className="block w-full max-w-96 ps-9 pe-3 py-2 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand px-3 shadow-xs placeholder:text-body"
                placeholder="Search"
              />
            </div>
          </div>
          <div>
            <ButtonGroup>
              <Button variant="outline" disabled>
                Status
              </Button>
              <Select
                defaultValue="null"
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={'null'}>No filter</SelectItem>
                    <SelectItem value={'a'}>Rejected</SelectItem>
                    <SelectItem value={'b'}>Pending</SelectItem>
                    <SelectItem value={'c'}>Approve</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </ButtonGroup>
          </div>
          <div>
            <ButtonGroup>
              <Button variant="outline" disabled>
                Month
              </Button>
              <Select
                defaultValue="null"
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={'null'}>No filter</SelectItem>
                    <SelectItem value={'a'}>January</SelectItem>
                    <SelectItem value={'b'}>February</SelectItem>
                    <SelectItem value={'c'}>March</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </ButtonGroup>
          </div>
        </div>

        {claims ? <ClaimTable claims={claims} /> : <p>You have 0 Claims</p>}
      </div>
    </main>
  )
}

function ClaimTable({ claims }: { claims: TClaims[] }) {
  const navigate = useNavigate()
  return (
    <Table className="w-full text-sm text-left rtl:text-right text-body bg-background">
      <TableHeader className="text-sm border-b border-border">
        <TableRow>
          <TableHead className="px-6 py-3 font-bold">TYPE</TableHead>
          <TableHead className="px-6 py-3 font-bold">
            TRANSACTION DATE
          </TableHead>
          <TableHead className="px-6 py-3 font-bold">AMOUNT</TableHead>
          <TableHead className="px-6 py-3 font-bold">SUBMITTED</TableHead>
          <TableHead className="px-6 py-3 font-bold">STATUS</TableHead>
          <TableHead className="px-6 py-3 font-bold">BENEFIT/TRIP</TableHead>
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
              {claim.types}
            </TableCell>
            <TableCell className="px-6 py-4">
              {claim.transaction_date.toLocaleDateString()}
            </TableCell>
            <TableCell className="px-6 py-4">{claim.amount}</TableCell>
            <TableCell className="px-6 py-4">
              {claim.submittedAt.toLocaleDateString()}
            </TableCell>
            <TableCell className="px-6 py-4">{claim.status}</TableCell>
            <TableCell className="px-6 py-4">{claim.benefitName}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

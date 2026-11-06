import { Button } from '#/components/ui/button'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { ReactNode } from 'react'
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
import { ButtonGroup } from '#/components/ui/button-group'
import { Pencil, Trash } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import { useGetAllCategoriesQuery } from '#/features/benefit-categories/queries/queries'
import type { BenefitCategoryResponse } from '#/types/benefitCategories'

export const Route = createFileRoute('/_app/admin/benefit-categories/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: categories, isError, isFetching } = useGetAllCategoriesQuery()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [monthFilter, setMonthFilter] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState<string>('')

  if (isError) return <div>Terjadi Error</div>
  if (isFetching) return <div>Loading...</div>

  return (
    <main className="bg-card p-8 rounded-2xl">
      <div className="mb-8 flex justify-between">
        <h1 className="text-3xl font-bold">Benefits Categories</h1>
        <Link to="/admin/benefit-categories/create">
          <Button className="bg-primary">New Category</Button>
        </Link>
      </div>
      <div className=" border-t border-border">
        <FilterSection
          status={statusFilter}
          search={searchFilter}
          month={monthFilter}
          setMonth={setMonthFilter}
          setSearch={setSearchFilter}
          setStatus={setStatusFilter}
        />

        {/* Table */}
        {categories.length != 0 ? (
          <BenefitTable categories={categories} />
        ) : (
          <p>You have 0 Claims</p>
        )}
      </div>
    </main>
  )
}

function BenefitTable({
  categories,
}: {
  categories: BenefitCategoryResponse[]
}) {
  const navigate = useNavigate()
  const thClass = 'px-6 py-3 font-bold'
  return (
    <Table className="w-full text-sm text-left rtl:text-right text-body max-w-full">
      <TableHeader className="text-sm border-b border-border">
        <TableRow>
          <TableHead className={thClass}>NAME</TableHead>
          <TableHead className={thClass}>ACTION</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((c) => (
          <TableRow
            key={c.id}
            className="cursor-pointer bg-neutral-primary-soft border-b border-default hover:bg-(--hover-shadow)"
          >
            <TableCell
              className="px-6 py-4 font-medium text-heading whitespace-nowrap"
              onClick={() => {
                console.log('Click')
                navigate({
                  to: '/admin/benefits',
                  search: {
                    categoryId: c.id,
                  },
                })
              }}
            >
              {c.name}
            </TableCell>
            <TableCell className="px-6 py-4 flex gap-2">
              <Button
                className="bg-amber-400 text-slate-900"
                onClick={() =>
                  navigate({
                    to: '/admin/benefit-categories/$categoryId/edit',
                    params: { categoryId: c.id },
                  })
                }
              >
                <Pencil />
              </Button>

              <DeleteDialog>
                <Button variant={'destructive'}>
                  <Trash />
                </Button>
              </DeleteDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function FilterSection({
  search,
  status,
  month,
  setSearch,
  setMonth,
  setStatus,
}: {
  search: string
  status: string
  month: string
  setSearch: (s: string) => void
  setMonth: (s: string) => void
  setStatus: (s: string) => void
}) {
  return (
    <div className="flex justify-start items-center gap-8 ">
      <div className="p-4">
        <label htmlFor="input-group-1" className="sr-only">
          Search
        </label>

        {/* Search filter */}
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="input-group-1"
            className="block w-full max-w-96 ps-9 pe-3 py-2 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand px-3 shadow-xs placeholder:text-body"
            placeholder="Search"
          />
        </div>
      </div>

      {/* Status filter */}
      <div>
        <ButtonGroup>
          <Button variant="outline" disabled>
            Status
          </Button>
          <Select
            defaultValue="null"
            onValueChange={(value) => setStatus(value)}
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

      {/* Month filter */}
      <div>
        <ButtonGroup>
          <Button variant="outline" disabled>
            Month
          </Button>
          <Select
            defaultValue="null"
            onValueChange={(value) => setMonth(value)}
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
  )
}

function DeleteDialog({ children }: { children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            <p>Are you want to delete this category?</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant={'destructive'}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

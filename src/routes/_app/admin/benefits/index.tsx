import { Button } from '#/components/ui/button'
import { useGetAllBenefitsQuery } from '#/features/benefits/queries/queries'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import type { BenefitResponse } from '#/types/benefits.type'
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
import { FilterSelect, FilterSelectNumber } from '#/components/FilterSelect'
import { SearchFilter } from '#/components/SearchFilter'
import { useGetAllCategoriesQuery } from '#/features/benefit-categories/queries/queries'
import { deleteBenefitForm } from '#/features/benefits/forms/forms'

export const Route = createFileRoute('/_app/admin/benefits/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: benefits, isError, isFetching } = useGetAllBenefitsQuery()
  const { data: categories } = useGetAllCategoriesQuery()
  const [periodFilter, setPeriodFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<number>(0)
  const [searchFilter, setSearchFilter] = useState<string>('')

  const categoryOptions = categories.map((c) => {
    return { label: c.name, optionValue: c.id }
  })
  const periodOptions = [
    { label: 'Monthly', optionValue: 'Monthly' },
    { label: 'Yearly', optionValue: 'Yearly' },
    { label: 'One Time', optionValue: 'OneTime' },
  ]

  const displayData = benefits.filter((b) => {
    const matchSearch =
      !searchFilter || b.name.toLowerCase().includes(searchFilter)
    const matchCategory = !categoryFilter || b.categoryId === categoryFilter
    const matchPeriod = !periodFilter || b.periodType === periodFilter

    return matchSearch && matchCategory && matchPeriod
  })

  if (isError) return <div>Terjadi Error</div>
  if (isFetching) return <div>Loading...</div>

  return (
    <main className="bg-card p-8 rounded-2xl">
      <div className="mb-8 flex justify-between">
        <h1 className="text-3xl font-bold">Benefits</h1>
        <Link to="/admin/benefits/create">
          <Button className="bg-primary">New Benefit</Button>
        </Link>
      </div>
      <div className=" border-t border-border">
        <div className="flex justify-start items-center gap-8 ">
          <SearchFilter search={searchFilter} setSearch={setSearchFilter} />
          <FilterSelect
            val={periodFilter}
            setValue={setPeriodFilter}
            options={periodOptions}
            filterLabel="Period Type"
          />

          <FilterSelectNumber
            val={categoryFilter}
            setValue={setCategoryFilter}
            options={categoryOptions}
            filterLabel="Category"
          />
        </div>

        {/* Table */}
        {benefits.length != 0 ? (
          <BenefitTable benefits={displayData} />
        ) : (
          <p>You have 0 Claims</p>
        )}
      </div>
    </main>
  )
}

function BenefitTable({ benefits }: { benefits: BenefitResponse[] }) {
  const navigate = useNavigate()
  const thClass = 'px-6 py-3 font-bold'
  return (
    <Table className="w-full text-sm text-left rtl:text-right text-body max-w-full">
      <TableHeader className="text-sm border-b border-border">
        <TableRow>
          <TableHead className={thClass}>NAME</TableHead>
          <TableHead className={thClass}>DESCRIPTION</TableHead>
          <TableHead className={thClass}>PERIOD TYPE</TableHead>
          <TableHead className={thClass}>CATEGORY NAME</TableHead>
          <TableHead className={thClass}>ACTION</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {benefits.map((b) => (
          <TableRow
            key={b.id}
            className="cursor-pointer bg-neutral-primary-soft border-b border-default hover:bg-(--hover-shadow)"
            // onClick={() => {
            //   console.log('Click')
            //   navigate({
            //     to: '/claims/$claimId',
            //     params: {
            //       claimId: claim.id.toString(),
            //     },
            //   })
            // }}
          >
            <TableCell className="px-6 py-4 font-medium text-heading whitespace-nowrap">
              {b.name}
            </TableCell>
            <TableCell className="px-6 py-4">{b.description}</TableCell>
            <TableCell className="px-6 py-4">{b.periodType}</TableCell>
            <TableCell className="px-6 py-4">{b.categoryName}</TableCell>
            <TableCell className="px-6 py-4 flex gap-2">
              <Button
                className="bg-amber-400 text-slate-900"
                onClick={() => {
                  const { id, categoryName, ...rest } = b
                  return navigate({
                    to: '/admin/benefits/$benefitId/edit',
                    params: { benefitId: b.id },
                    search: rest,
                  })
                }}
              >
                <Pencil />
              </Button>

              <DeleteDialog id={b.id} name={b.name}>
                <Button variant={'destructive'}>
                  <Trash />
                </Button>
              </DeleteDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>

      {benefits.length <= 0 && (
        <TableFooter>
          <TableCell colSpan={5}>
            <p className="text-center">Benefit not found</p>
          </TableCell>
        </TableFooter>
      )}
    </Table>
  )
}

function DeleteDialog({
  children,
  id,
  name,
}: {
  children: ReactNode
  id: string
  name?: string
}) {
  const form = deleteBenefitForm(id)
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Benefit</DialogTitle>
          <DialogDescription>
            <p>Are you want to delete the benefits {name}?</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <form.AppForm>
              <Button type="submit" variant={'destructive'}>
                Delete
              </Button>
            </form.AppForm>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

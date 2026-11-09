import { Button } from '#/components/ui/button'
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
import { SearchFilter } from '#/components/SearchFilter'
import { deleteCategoryForm } from '#/features/benefit-categories/forms/forms'

export const Route = createFileRoute('/_app/admin/benefit-categories/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: categories = [], isError, isLoading } = useGetAllCategoriesQuery()
  const [searchFilter, setSearchFilter] = useState<string>('')

  const displayData = categories.filter((c) => {
    return !searchFilter || c.name.toLowerCase().includes(searchFilter.toLowerCase())
  })

  if (isError) return <div className="p-4 text-destructive">Terjadi Error saat mengambil kategori benefit</div>
  if (isLoading) return <div className="p-4 text-muted-foreground">Loading categories...</div>

  return (
    <main>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Benefit Categories</h1>
        <Link to="/admin/benefit-categories/create">
          <Button className="bg-primary">New Category</Button>
        </Link>
      </div>
      <div className="bg-card p-8 rounded-2xl mb-8  border border-border">
        <div className="flex justify-start items-center gap-8 border-b border-border">
          <SearchFilter search={searchFilter} setSearch={setSearchFilter} />
        </div>

        {/* Table */}
        <CategoryTable categories={displayData} />
      </div>
    </main>
  )
}

function CategoryTable({
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
            <TableCell className="px-6 py-4 font-medium text-heading whitespace-nowrap">
              {c.name}
            </TableCell>
            <TableCell className="px-6 py-4 flex gap-2">
              <Button
                className="bg-amber-400 text-slate-900"
                onClick={() => {
                  navigate({
                    to: '/admin/benefit-categories/$categoryId/edit',
                    params: { categoryId: c.id.toString() },
                    search: { name: c.name },
                  })
                }}
              >
                <Pencil />
              </Button>

              <DeleteDialog id={c.id} name={c.name}>
                <Button variant={'destructive'}>
                  <Trash />
                </Button>
              </DeleteDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {categories.length <= 0 && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>
              <p className="text-center">No categories found</p>
            </TableCell>
          </TableRow>
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
  id: number
  name: string
}) {
  const form = deleteCategoryForm(id)
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete category "{name}"?
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

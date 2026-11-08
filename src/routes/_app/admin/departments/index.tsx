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
import { SearchFilter } from '#/components/SearchFilter'
import type { DepartmentResponse } from '#/types/department.type'
import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { deleteDepartmentForm } from '#/features/departments/forms/forms'

export const Route = createFileRoute('/_app/admin/departments/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: departments, isError, isFetching } = useGetAllDepartmentsQuery()
  const [searchFilter, setSearchFilter] = useState<string>('')

  const displayData = departments.filter((d) => {
    return (
      !searchFilter || d.name.toLowerCase().includes(searchFilter.toLowerCase())
    )
  })

  if (isError) return <div>Terjadi Error</div>
  if (isFetching) return <div>Loading...</div>

  return (
    <main>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Company Departments</h1>
        <Link to="/admin/departments/create">
          <Button className="bg-primary">New Department</Button>
        </Link>
      </div>
      <div className="bg-card p-8 rounded-2xl mb-8  border border-border">
        <div className="flex justify-start items-center gap-8 ">
          <SearchFilter search={searchFilter} setSearch={setSearchFilter} />
        </div>

        {/* Table */}
        <DepartmentTable departments={displayData} />
      </div>
    </main>
  )
}

function DepartmentTable({
  departments,
}: {
  departments: DepartmentResponse[]
}) {
  const navigate = useNavigate()
  const thClass = 'px-6 py-3 font-bold'
  return (
    <Table className="w-full text-sm text-left rtl:text-right text-body max-w-full">
      <TableHeader className="text-sm border-b border-border">
        <TableRow>
          <TableHead className={thClass}>CODE</TableHead>
          <TableHead className={thClass}>NAME</TableHead>
          <TableHead className={thClass}>PARENT DEPARTMENT</TableHead>
          <TableHead className={thClass}>ACTION</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {departments.map((d) => (
          <TableRow
            key={d.id}
            className="cursor-pointer bg-neutral-primary-soft border-b border-default hover:bg-(--hover-shadow)"
          >
            <TableCell>{d.id}</TableCell>
            <TableCell
              className="px-6 py-4 font-medium text-heading whitespace-nowrap"
              onClick={() => {
                console.log('Click')
                navigate({
                  to: '/dashboard',
                })
              }}
            >
              {d.name}
            </TableCell>
            <TableCell>{d.parentDeptName ?? ''}</TableCell>
            <TableCell className="px-6 py-4 flex gap-2">
              <Button
                className="bg-amber-400 text-slate-900"
                onClick={() =>
                  navigate({
                    to: '/admin/departments/$departmentId/edit',
                    params: { departmentId: d.id },
                    search: {
                      name: d.name,
                      parentDeptId: d.parentDeptId,
                    },
                  })
                }
              >
                <Pencil />
              </Button>

              <DeleteDialog id={d.id} name={d.name}>
                <Button variant={'destructive'}>
                  <Trash />
                </Button>
              </DeleteDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {departments.length <= 0 && (
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
  const form = deleteDepartmentForm(id)
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            <p>Do you want to delete the department {name}?</p>
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

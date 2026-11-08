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
import { FilterSelect } from '#/components/FilterSelect'
import { SearchFilter } from '#/components/SearchFilter'
import { useGetAllEmployeeQuery } from '#/features/employees/queries/queries'
import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { useGetAllPositionsQuery } from '#/features/positions/queries/queries'
import type { EmployeeResponse } from '#/types/employee.type'
import { deleteEmployeeForm } from '#/features/employees/forms/forms'

export const Route = createFileRoute('/_app/admin/employees/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: employees, isError, isFetching } = useGetAllEmployeeQuery()
  const { data: departments } = useGetAllDepartmentsQuery()
  const { data: positions } = useGetAllPositionsQuery()

  const [departmentFilter, setDepartmentFilter] = useState<string>('')
  const [positionFilter, setPositionFilter] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState<string>('')

  const departmentOptions = departments.map((d) => {
    return { label: d.name, optionValue: d.id }
  })
  const positionOptions = positions.map((p) => {
    return { label: p.title, optionValue: p.id }
  })

  const displayData = employees.filter((e) => {
    const matchSearch =
      !searchFilter || e.fullName.toLowerCase().includes(searchFilter)
    const matchDepartment =
      !departmentFilter || e.departmentId === departmentFilter
    const matchPosition = !positionFilter || e.positionId === positionFilter

    return matchSearch && matchDepartment && matchPosition
  })

  if (isError) return <div>Terjadi Error</div>
  if (isFetching) return <div>Loading...</div>

  return (
    <main>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Benefit List</h1>
        <Link to="/admin/employees/create">
          <Button className="bg-primary">New Employee</Button>
        </Link>
      </div>

      <div className="bg-card p-8 rounded-2xl mb-8  border border-border">
        <div className="flex justify-start items-center gap-8 ">
          <SearchFilter search={searchFilter} setSearch={setSearchFilter} />
          <FilterSelect
            val={positionFilter}
            setValue={setPositionFilter}
            options={positionOptions}
            filterLabel="Position"
          />

          <FilterSelect
            val={departmentFilter}
            setValue={setDepartmentFilter}
            options={departmentOptions}
            filterLabel="Department"
          />
        </div>

        <EmployeeTable employees={displayData} />
      </div>
    </main>
  )
}

function EmployeeTable({ employees }: { employees: EmployeeResponse[] }) {
  const navigate = useNavigate()
  const thClass = 'px-6 py-3 font-bold'
  return (
    <Table className="w-full text-sm text-left rtl:text-right text-body max-w-full">
      <TableHeader className="text-sm border-b border-border">
        <TableRow>
          <TableHead className={thClass}>NUMBER</TableHead>
          <TableHead className={thClass}>NAME</TableHead>
          <TableHead className={thClass}>EMAIL</TableHead>
          <TableHead className={thClass}>POSITION</TableHead>
          <TableHead className={thClass}>DEPARTMENT</TableHead>
          <TableHead className={thClass}>MANAGER</TableHead>
          <TableHead className={thClass}>ACTION</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {employees.map((e) => (
          <TableRow
            key={e.id}
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
            <TableCell className="px-6 py-4">{e.number}</TableCell>
            <TableCell className="px-6 py-4 font-medium text-heading whitespace-nowrap">
              {e.fullName}
            </TableCell>
            <TableCell className="px-6 py-4">{e.email}</TableCell>
            <TableCell className="px-6 py-4">{e.positionTitle}</TableCell>
            <TableCell className="px-6 py-4">{e.departmentName}</TableCell>
            <TableCell className="px-6 py-4">{e.managerName}</TableCell>
            <TableCell className="px-6 py-4 flex gap-2">
              <Button
                className="bg-amber-400 text-slate-900"
                onClick={() => {
                  const {
                    id,
                    number,
                    positionTitle,
                    departmentName,
                    managerName,
                    ...rest
                  } = e
                  return navigate({
                    to: '/admin/employees/$employeeId/edit',
                    params: { employeeId: e.id },
                    search: { ...rest },
                  })
                }}
              >
                <Pencil />
              </Button>

              {/* <DeleteDialog id={e.id} name={e.fullName}>
                <Button variant={'destructive'}>
                  <Trash />
                </Button>
              </DeleteDialog> */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>

      {employees.length <= 0 && (
        <TableFooter>
          <TableCell colSpan={7}>
            <p className="text-center">Employee not found</p>
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
  const form = deleteEmployeeForm(id)
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Employee</DialogTitle>
          <DialogDescription>
            <p>Are you want to delete the employee {name}?</p>
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

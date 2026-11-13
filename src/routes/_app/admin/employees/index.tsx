import { Button } from '#/components/ui/button'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import {
  Filter,
  Pencil,
  Plus,
  Search,
  SearchX,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react'
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
import {
  useGetAllEmployeeQuery,
  useActivateEmployeeMutation,
} from '#/features/employees/queries/queries'
import type { EmployeeFilterParams } from '#/features/employees/queries/queries'
import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { useGetAllPositionsQuery } from '#/features/positions/queries/queries'
import type { EmployeeResponse } from '#/types/employee.type'
import { deleteEmployeeForm } from '#/features/employees/forms/forms'
import { toast } from 'sonner'
import { getFriendlyErrorMessage } from '#/lib/error'
import { PaginationSection } from '#/components/PaginationSection'
import { ButtonGroup } from '#/components/ui/button-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'

export const Route = createFileRoute('/_app/admin/employees/')({
  component: RouteComponent,
  validateSearch: (s) => s as EmployeeFilterParams,
})

function getInitials(name?: string | null): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function RouteComponent() {
  const searchParams = Route.useSearch()
  const navigate = useNavigate()
  const {
    data: employeesResponse,
    isError,
    error,
    isFetching,
  } = useGetAllEmployeeQuery(searchParams)
  const { data: departments = [] } = useGetAllDepartmentsQuery()
  const { data: positions = [] } = useGetAllPositionsQuery()

  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(
    searchParams.departmentId,
  )
  const [positionFilter, setPositionFilter] = useState<string | undefined>(
    undefined,
  )
  const [statusFilter, setStatusFilter] = useState<string | undefined>('active')
  const [searchFilter, setSearchFilter] = useState<string>('')

  const departmentOptions = departments.map((d) => ({
    label: d.name,
    optionValue: d.id,
  }))

  const positionOptions = positions.map((p) => ({
    label: p.title,
    optionValue: p.id,
  }))

  const statusOptions = [
    { label: 'Active', optionValue: 'active' },
    { label: 'Inactive', optionValue: 'inactive' },
  ]

  const employeeList: EmployeeResponse[] = employeesResponse?.data || []

  const hasActiveFilters = Boolean(
    searchFilter ||
    departmentFilter ||
    positionFilter ||
    statusFilter !== 'active',
  )

  const applyFilterClick = () => {
    navigate({
      to: '.',
      search: {
        search: searchFilter,
        departmentId: departmentFilter,
        positionId: positionFilter,
        isActive: statusFilter == 'active' ? true : undefined,
      },
    })
  }

  if (isError) {
    return (
      <main className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-semibold">
          An error occurs when loading employees data.
          {error instanceof Error
            ? error.message
            : 'Failed to load employees data.'}
        </div>
      </main>
    )
  }

  if (isFetching || !employeesResponse) {
    return (
      <main className="py-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">
          Loading employees data...
        </p>
      </main>
    )
  }

  const { data, errors, message, statusCode, success, ...paginationProp } =
    employeesResponse

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-heading tracking-tight">
                Employees
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {employeesResponse.totalCount}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage master data of employees, positions, departments, and
              direct manager for claims approver.
            </p>
          </div>
        </div>

        <Link to="/admin/employees/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs gap-1.5 h-10 px-4 rounded-lg">
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>New Employee</span>
          </Button>
        </Link>
      </div>

      {/* Table Card Container */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 sm:p-5 border-b border-border/70 flex flex-wrap items-center justify-between gap-4 bg-muted/15">
          <div className="flex flex-wrap items-center gap-3">
            <ButtonGroup>
              <div className="relative grow max-w-70 sm:w-64">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search name, department, or position..."
                  className="w-full pl-9 pr-4 py-2.25 bg-background border border-border rounded-lg rounded-br-none rounded-tr-none text-sm text-heading placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                />
              </div>
              <Button onClick={applyFilterClick}>Search</Button>
            </ButtonGroup>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button>
                <Filter /> Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="grid grid-cols-1 gap-4 w-fit"
            >
              <FilterSelect
                val={positionFilter}
                setValue={setPositionFilter}
                options={positionOptions}
                filterLabel="Position"
                nullable
                nullLabel="All Positions"
              />

              <FilterSelect
                val={departmentFilter}
                setValue={setDepartmentFilter}
                options={departmentOptions}
                filterLabel="Department"
                nullable
                nullLabel="All Departments"
              />

              <FilterSelect
                val={statusFilter}
                setValue={setStatusFilter}
                options={statusOptions}
                filterLabel="Status"
                nullable
                nullLabel="All Statuses"
              />
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchFilter('')
                    setDepartmentFilter(undefined)
                    setPositionFilter(undefined)
                    setStatusFilter(undefined)
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground h-9 border"
                >
                  Reset Filter
                </Button>
              )}
              <Button onClick={applyFilterClick}>Apply</Button>
            </PopoverContent>
          </Popover>
        </div>

        {/* Table Content */}
        {employeeList.length > 0 ? (
          <>
            <EmployeeTable employees={employeeList} />
            <div className="flex justify-between items-center px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>
                  Showing {employeeList.length} of{' '}
                  {employeesResponse.totalCount} employees total
                </span>
              </div>
              <div className="w-fit grow-0">
                <PaginationSection pagination={paginationProp} />
              </div>
            </div>
          </>
        ) : (
          <div className="py-16 text-center space-y-3">
            <SearchX
              className="w-10 h-10 text-muted-foreground/50 mx-auto"
              strokeWidth={1.5}
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-heading">
                Employees not found
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'No employees data that match with the filters.'
                  : 'No registered employees available yet.'}
              </p>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchFilter('')
                  setDepartmentFilter(undefined)
                  setPositionFilter(undefined)
                  setStatusFilter(undefined)
                }}
                className="text-xs font-semibold h-8"
              >
                Reset Filter
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

function EmployeeTable({ employees }: { employees: EmployeeResponse[] }) {
  const navigate = useNavigate()
  const thClass =
    'px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground'

  return (
    <div className="overflow-x-auto">
      <Table className="w-full text-sm text-left">
        <TableHeader className="bg-muted/30 border-b border-border/70">
          <TableRow className="hover:bg-transparent">
            <TableHead className={thClass}>EMPLOYEE</TableHead>
            <TableHead className={thClass}>EMAIL</TableHead>
            <TableHead className={thClass}>POSITION</TableHead>
            <TableHead className={thClass}>DEPARTMENT</TableHead>
            <TableHead className={thClass}>DIRECT MANAGER</TableHead>
            <TableHead className={thClass}>STATUS</TableHead>
            <TableHead className={`${thClass} text-right w-28`}>
              ACTION
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {employees.map((e) => (
            <TableRow
              key={e.id}
              className="hover:bg-muted/30 transition-colors border-b border-border/60"
            >
              {/* Employee Name & Number with Avatar */}
              <TableCell className="px-5 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0 border border-blue-500/20"
                    aria-hidden="true"
                  >
                    {getInitials(e.fullName)}
                  </div>
                  <div>
                    <p className="font-semibold text-heading leading-tight">
                      {e.fullName}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {e.number}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                {e.email}
              </TableCell>

              <TableCell className="px-5 py-4 whitespace-nowrap">
                <span className="font-medium text-heading text-xs">
                  {e.positionTitle || '-'}
                </span>
              </TableCell>

              <TableCell className="px-5 py-4 whitespace-nowrap">
                <span className="text-xs text-muted-foreground">
                  {e.departmentName || '-'}
                </span>
              </TableCell>

              <TableCell className="px-5 py-4 whitespace-nowrap">
                {e.managerName ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-heading font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {e.managerName}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/60">-</span>
                )}
              </TableCell>

              <TableCell className="px-5 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    e.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      e.isActive ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  />
                  {e.isActive ? 'Active' : 'Inactive'}
                </span>
              </TableCell>

              <TableCell className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {e.isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-400 cursor-pointer"
                      title="Edit Employee"
                      onClick={() => {
                        return navigate({
                          to: '/admin/employees/$employeeId/edit',
                          params: { employeeId: e.id },
                        })
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  ) : null}

                  {e.isActive ? (
                    <DeleteDialog id={e.id} name={e.fullName}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg text-slate-700 dark:text-slate-200 hover:text-rose-600 hover:border-rose-300 dark:hover:text-rose-400 cursor-pointer"
                        title="Deactivate Employee"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Deactivate</span>
                      </Button>
                    </DeleteDialog>
                  ) : (
                    <ActivateDialog id={e.id} name={e.fullName}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 cursor-pointer"
                        title="Activate Employee"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span className="sr-only">Activate</span>
                      </Button>
                    </ActivateDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Deactivate Employee</DialogTitle>
          <DialogDescription className="text-sm pt-1 space-y-2">
            <p>
              Are you sure want to deactivate employee <strong>"{name}"</strong>
              ?
            </p>
            <p className="text-xs text-muted-foreground">
              The account will be deactivate, so the employee no longer able to
              login. Employee history will be kept for company auditing purpose.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <Button variant="destructive" size="sm" type="submit">
              Deactivate
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ActivateDialog({
  children,
  id,
  name,
}: {
  children: ReactNode
  id: string
  name?: string
}) {
  const [open, setOpen] = useState(false)
  const activateMutation = useActivateEmployeeMutation()

  const handleActivate = async () => {
    try {
      await activateMutation.mutateAsync(id)
      toast.success(`Employee ${name} successfully reactivated.`)
      setOpen(false)
    } catch (err: unknown) {
      toast.error(getFriendlyErrorMessage(err, 'Failed to reactivate employee'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reactivate Employee</DialogTitle>
          <DialogDescription className="text-sm pt-1 space-y-2">
            <p>
              Are you sure want to reactivate employee <strong>"{name}"</strong>
              ?
            </p>
            <p className="text-xs text-muted-foreground">
              The account will be reactivated and the benefit will be applied
              according to its position and department
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={activateMutation.isPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            size="sm"
            onClick={handleActivate}
            disabled={activateMutation.isPending}
          >
            {activateMutation.isPending
              ? 'Reactivating...'
              : 'Activate Employee'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

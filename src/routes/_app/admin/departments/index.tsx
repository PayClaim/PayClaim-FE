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
import { Building2, Pencil, Plus, Search, SearchX, Trash2 } from 'lucide-react'
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
import type { DepartmentResponse } from '#/types/department.type'
import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { deleteDepartmentForm } from '#/features/departments/forms/forms'

export const Route = createFileRoute('/_app/admin/departments/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: departments = [], isError, isFetching } = useGetAllDepartmentsQuery()
  const [searchFilter, setSearchFilter] = useState<string>('')

  const displayData = departments.filter((d) => {
    const s = searchFilter.toLowerCase()
    return (
      !searchFilter ||
      d.name.toLowerCase().includes(s) ||
      d.id.toLowerCase().includes(s) ||
      d.parentDeptName?.toLowerCase().includes(s)
    )
  })

  if (isError) {
    return (
      <main className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-semibold">
          An error occurred while loading departments. Please try again later.
        </div>
      </main>
    )
  }

  if (isFetching && departments.length === 0) {
    return (
      <main className="py-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading departments...</p>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-heading tracking-tight">
                Departments
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {departments.length}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage company divisions, departments, and organizational hierarchy.
            </p>
          </div>
        </div>

        <Link to="/admin/departments/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs gap-1.5 h-10 px-4 rounded-lg cursor-pointer">
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>New Department</span>
          </Button>
        </Link>
      </div>

      {/* Table Card Container */}
      <div className="bg-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-border/70 flex flex-wrap items-center justify-between gap-4 bg-muted/15">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by code or department name..."
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-heading placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            />
          </div>

          <div className="text-xs text-muted-foreground font-medium">
            Showing {displayData.length} of {departments.length} departments
          </div>
        </div>

        {/* Table Content */}
        {displayData.length > 0 ? (
          <DepartmentTable departments={displayData} />
        ) : (
          <div className="py-16 text-center space-y-3">
            <SearchX className="w-10 h-10 text-muted-foreground/50 mx-auto" strokeWidth={1.5} />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-heading">No departments found</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchFilter
                  ? `No departments match "${searchFilter}". Try changing your search keyword.`
                  : 'No departments are registered in the system yet.'}
              </p>
            </div>
            {searchFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchFilter('')}
                className="text-xs font-semibold h-8"
              >
                Reset Search
              </Button>
            )}
          </div>
        )}
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
  const thClass = 'px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground'

  return (
    <div className="overflow-x-auto">
      <Table className="w-full text-sm text-left">
        <TableHeader className="bg-muted/30 border-b border-border/70">
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${thClass} w-36`}>DEPARTMENT CODE</TableHead>
            <TableHead className={thClass}>NAME</TableHead>
            <TableHead className={thClass}>PARENT DEPARTMENT</TableHead>
            <TableHead className={`${thClass} text-right w-28`}>ACTION</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {departments.map((d) => (
            <TableRow
              key={d.id}
              className="row-enter hover:bg-muted/30 transition-colors border-b border-border/60"
            >
              <TableCell className="px-5 py-4 font-mono font-semibold text-xs text-heading">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/60 border border-border/60">
                  {d.id}
                </span>
              </TableCell>

              <TableCell className="px-5 py-4 font-semibold text-heading whitespace-nowrap">
                {d.name}
              </TableCell>

              <TableCell className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                {d.parentDeptName ? (
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {d.parentDeptName}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/60">Root Department</span>
                )}
              </TableCell>

              <TableCell className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-400 cursor-pointer"
                    title="Edit Department"
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
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="sr-only">Edit</span>
                  </Button>

                  <DeleteDialog id={d.id} name={d.name}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-lg text-slate-700 dark:text-slate-200 hover:text-rose-600 hover:border-rose-300 dark:hover:text-rose-400 cursor-pointer"
                      title="Delete Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </DeleteDialog>
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
  const form = deleteDepartmentForm(id)
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Department</DialogTitle>
          <DialogDescription className="text-sm pt-1">
            Are you sure you want to delete the department <strong>"{name || id}"</strong>? Make sure no employees or sub-departments remain linked.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <Button variant="destructive" size="sm" type="submit">
              Delete Department
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
import { Pencil, Trash, UserCheck } from 'lucide-react'
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
import {
  useGetAllEmployeeQuery,
  useActivateEmployeeMutation,
} from '#/features/employees/queries/queries'
import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { useGetAllPositionsQuery } from '#/features/positions/queries/queries'
import type { EmployeeResponse } from '#/types/employee.type'
import { deleteEmployeeForm } from '#/features/employees/forms/forms'
import { toast } from 'sonner'

export const Route = createFileRoute('/_app/admin/employees/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: employees, isError, isFetching } = useGetAllEmployeeQuery()
  const { data: departments } = useGetAllDepartmentsQuery()
  const { data: positions } = useGetAllPositionsQuery()

  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null)
  const [positionFilter, setPositionFilter] = useState<string | null>(null)
  // Default filter: 'active' agar langsung menampilkan karyawan aktif
  const [statusFilter, setStatusFilter] = useState<string | null>('active')
  const [searchFilter, setSearchFilter] = useState<string>('')

  const departmentOptions = departments.map((d) => {
    return { label: d.name, optionValue: d.id }
  })
  const positionOptions = positions.map((p) => {
    return { label: p.title, optionValue: p.id }
  })
  const statusOptions = [
    { label: 'Active', optionValue: 'active' },
    { label: 'Inactive', optionValue: 'inactive' },
  ]

  const displayData = employees.filter((e) => {
    const searchLower = searchFilter.toLowerCase()
    const matchSearch =
      !searchFilter ||
      e.fullName.toLowerCase().includes(searchLower) ||
      e.email.toLowerCase().includes(searchLower) ||
      e.number.toLowerCase().includes(searchLower)
    const matchDepartment =
      !departmentFilter || e.departmentId === departmentFilter
    const matchPosition = !positionFilter || e.positionId === positionFilter
    const matchStatus =
      !statusFilter ||
      (statusFilter === 'active' && e.isActive) ||
      (statusFilter === 'inactive' && !e.isActive)

    return matchSearch && matchDepartment && matchPosition && matchStatus
  })

  if (isError) return <div>Terjadi Error</div>
  if (isFetching) return <div>Loading...</div>

  return (
    <main>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Employee List</h1>
        <Link to="/admin/employees/create">
          <Button className="bg-primary">New Employee</Button>
        </Link>
      </div>

      <div className="bg-card p-8 rounded-2xl mb-8 border border-border">
        <div className="flex flex-wrap justify-start items-center gap-6 border-b border-border pb-4">
          <SearchFilter search={searchFilter} setSearch={setSearchFilter} />
          <FilterSelect
            val={positionFilter}
            setValue={setPositionFilter}
            options={positionOptions}
            filterLabel="Position"
            nullable
            nullLabel="Semua Posisi"
          />

          <FilterSelect
            val={departmentFilter}
            setValue={setDepartmentFilter}
            options={departmentOptions}
            filterLabel="Department"
            nullable
            nullLabel="Semua Departemen"
          />

          <FilterSelect
            val={statusFilter}
            setValue={setStatusFilter}
            options={statusOptions}
            filterLabel="Status"
            nullable
            nullLabel="Semua Status"
          />
        </div>

        {employees.length !== 0 ? (
          <EmployeeTable employees={displayData} />
        ) : (
          <p className="mt-4">You have 0 Employees</p>
        )}
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
          <TableHead className={thClass}>STATUS</TableHead>
          <TableHead className={thClass}>ACTION</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {employees.map((e) => (
          <TableRow
            key={e.id}
            className="cursor-pointer bg-neutral-primary-soft border-b border-default hover:bg-(--hover-shadow)"
          >
            <TableCell className="px-6 py-4">{e.number}</TableCell>
            <TableCell className="px-6 py-4 font-medium text-heading whitespace-nowrap">
              {e.fullName}
            </TableCell>
            <TableCell className="px-6 py-4">{e.email}</TableCell>
            <TableCell className="px-6 py-4">{e.positionTitle}</TableCell>
            <TableCell className="px-6 py-4">{e.departmentName}</TableCell>
            <TableCell className="px-6 py-4">{e.managerName ?? '-'}</TableCell>
            <TableCell className="px-6 py-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  e.isActive
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {e.isActive ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
            <TableCell className="px-6 py-4 flex gap-2">
              {/* Tombol Edit: hanya bisa jika karyawan aktif */}
              {e.isActive ? (
                <Button
                  className="bg-amber-400 text-slate-900 hover:bg-amber-500"
                  title="Edit Karyawan"
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
                  <Pencil className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  disabled
                  className="bg-amber-400/40 text-slate-900/40 cursor-not-allowed"
                  title="Karyawan tidak aktif tidak dapat diedit"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}

              {/* Action Deactivate / Activate */}
              {e.isActive ? (
                <DeleteDialog id={e.id} name={e.fullName}>
                  <Button variant={'destructive'} title="Nonaktifkan Karyawan">
                    <Trash className="w-4 h-4" />
                  </Button>
                </DeleteDialog>
              ) : (
                <ActivateDialog id={e.id} name={e.fullName}>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    title="Aktifkan Kembali Karyawan"
                  >
                    <UserCheck className="w-4 h-4" />
                  </Button>
                </ActivateDialog>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>

      {employees.length <= 0 && (
        <TableFooter>
          <TableCell colSpan={8}>
            <p className="text-center py-4 text-muted-foreground">Employee not found</p>
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
          <DialogTitle>Nonaktifkan Karyawan</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-2">
            Apakah Anda yakin ingin menonaktifkan karyawan{' '}
            <strong className="text-foreground">{name}</strong>?
            <br />
            <br />
            Akun login akan dihapus sehingga karyawan tidak dapat login kembali ke sistem, namun data profil dan seluruh riwayat transaksi (klaim reimbursement, proposal perjalanan, dan riwayat persetujuan) tetap disimpan demi integritas audit.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
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
                Nonaktifkan
              </Button>
            </form.AppForm>
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
      toast.success(`Karyawan ${name} berhasil diaktifkan kembali`)
      setOpen(false)
    } catch (err: unknown) {
      const error = err as { message?: string }
      toast.error(error.message || 'Gagal mengaktifkan karyawan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aktifkan Kembali Karyawan</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-2">
            Apakah Anda yakin ingin mengaktifkan kembali karyawan{' '}
            <strong className="text-foreground">{name}</strong>?
            <br />
            <br />
            Akun login baru akan otomatis dibuatkan dan jatah plafon benefit tahun berjalan akan dipulihkan sesuai posisi dan departemen karyawan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <DialogClose asChild>
            <Button variant="outline" disabled={activateMutation.isPending}>
              Batal
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleActivate}
            disabled={activateMutation.isPending}
          >
            {activateMutation.isPending ? 'Mengaktifkan...' : 'Aktifkan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

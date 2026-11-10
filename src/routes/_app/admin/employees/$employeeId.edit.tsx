import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { editEmployeeForm } from '#/features/employees/forms/forms'
import {
  useGetAllEmployeeQuery,
  useGetEmployeeQuery,
} from '#/features/employees/queries/queries'
import { useGetAllPositionsQuery } from '#/features/positions/queries/queries'
import type { EmployeeResponse } from '#/types/employee.type'
import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_app/admin/employees/$employeeId/edit')({
  component: RouteComponent,
  validateSearch: (s: Record<string, unknown>) => s,
})

function RouteComponent() {
  const { employeeId } = Route.useParams()
  const { data: employee, isLoading, isError } = useGetEmployeeQuery(employeeId)
  const { data: positions = [] } = useGetAllPositionsQuery()
  const { data: departments = [] } = useGetAllDepartmentsQuery()
  const { data: employees = [] } = useGetAllEmployeeQuery()

  if (isLoading) {
    return (
      <main className="bg-card max-w-200 rounded-2xl p-6 mx-auto border border-border text-center text-muted-foreground">
        Loading employee data...
      </main>
    )
  }

  if (isError || !employee) {
    return (
      <main className="bg-card max-w-200 rounded-2xl p-6 mx-auto border border-border text-center text-destructive">
        Employee not found.
      </main>
    )
  }

  return (
    <EditEmployeeFormContent
      employeeId={employeeId}
      employee={employee}
      positions={positions}
      departments={departments}
      employees={employees}
    />
  )
}

function EditEmployeeFormContent({
  employeeId,
  employee,
  positions,
  departments,
  employees,
}: {
  employeeId: string
  employee: EmployeeResponse
  positions: any[]
  departments: any[]
  employees: EmployeeResponse[]
}) {
  const isInactive = !employee.isActive
  const formattedHireDate = employee.hireDate
    ? employee.hireDate.split('T')[0]
    : ''

  const form = editEmployeeForm(employeeId, {
    fullName: employee.fullName,
    email: employee.email,
    hireDate: formattedHireDate,
    positionId: employee.positionId,
    departmentId: employee.departmentId,
    managerId: employee.managerId,
    isActive: employee.isActive,
  })

  const positionOptions = positions.map((p) => {
    return { label: p.title, value: p.id }
  })

  const departmentOptions = departments.map((d) => {
    return { label: d.name, value: d.id }
  })

  const managerOptions = employees
    .filter((e) => e.id !== employeeId)
    .map((e) => {
      return { label: e.fullName, value: e.id }
    })

  return (
    <main className="bg-card max-w-200 rounded-2xl p-6 mx-auto border border-border">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/admin/employees">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Employee</h1>
        <div className="w-20" />
      </div>

      {isInactive && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">
            Karyawan ini berstatus <strong>Inactive</strong>. Data karyawan yang nonaktif tidak dapat diubah. Silakan aktifkan kembali karyawan terlebih dahulu melalui daftar karyawan.
          </p>
        </div>
      )}

      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!isInactive) {
              form.handleSubmit()
            }
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="fullName">
              {(field) => <field.TextField label="Name" disabled={isInactive} />}
            </form.AppField>

            <form.AppField name="email">
              {(field) => <field.TextField label="Email" disabled={isInactive} />}
            </form.AppField>

            {/* Hire date cannot be modified */}
            <form.AppField name="hireDate">
              {(field) => (
                <field.TextField
                  label="Hire Date (Permanent)"
                  disabled={true}
                />
              )}
            </form.AppField>

            <form.AppField name="positionId">
              {(field) => (
                <field.FormSelect
                  values={positionOptions}
                  placeholder="Pick Position"
                  label="Position"
                  disabled={isInactive}
                />
              )}
            </form.AppField>

            <form.AppField name="departmentId">
              {(field) => (
                <field.FormSelect
                  values={departmentOptions}
                  label="Department"
                  placeholder="Pick Department"
                  disabled={isInactive}
                />
              )}
            </form.AppField>

            <form.Subscribe selector={(state) => state.values.positionId}>
              {(positionId) => {
                const selectedPos = positions.find((p) => p.id === positionId)
                const isManager =
                  positionId?.toUpperCase() === 'MGR' ||
                  Boolean(selectedPos?.title.toLowerCase().includes('manager'))

                if (isManager) return null

                return (
                  <form.AppField name="managerId">
                    {(field) => (
                      <field.FormSelect
                        nullable
                        values={managerOptions}
                        label="Manager"
                        placeholder="Pick Manager"
                        disabled={isInactive}
                      />
                    )}
                  </form.AppField>
                )
              }}
            </form.Subscribe>
          </div>

          <div className="mt-6 flex justify-end">
            <form.AppForm>
              <form.FormButton label="Submit" disabled={isInactive} />
            </form.AppForm>
          </div>
        </form>
      </div>
    </main>
  )
}

import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { editEmployeeForm } from '#/features/employees/forms/forms'
import {
  useGetAllEmployeesQuery,
  useGetEmployeeQuery,
} from '#/features/employees/queries/queries'
import { buildEmployeeGroups } from '#/features/employees/utils/employee-options'
import { useGetAllPositionsQuery } from '#/features/positions/queries/queries'
import type { EmployeeResponse } from '#/types/employee.type'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft, Users } from 'lucide-react'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_app/admin/employees/$employeeId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const { employeeId } = Route.useParams()
  const {
    data: employee,
    isFetching,
    isError,
  } = useGetEmployeeQuery(employeeId)
  const { data: positions = [] } = useGetAllPositionsQuery()
  const { data: departments = [] } = useGetAllDepartmentsQuery()
  const { data: employees = [] } = useGetAllEmployeesQuery()

  if (isFetching) {
    return (
      <main className="max-w-2xl mx-auto py-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">
          Loading employee data...
        </p>
      </main>
    )
  }

  if (isError || !employee) {
    return (
      <main className="max-w-2xl mx-auto space-y-4">
        <Button
          onClick={() => router.history.back()}
          variant="outline"
          size="sm"
          className="gap-2 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Employees List</span>
        </Button>
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-semibold">
          Employee not found or already deleted
        </div>
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
  positions: { id: string; title: string }[]
  departments: { id: string; name: string }[]
  employees: EmployeeResponse[]
}) {
  const router = useRouter()
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

  const positionOptions = positions.map((p) => ({
    label: p.title,
    value: p.id,
  }))

  const departmentOptions = departments.map((d) => ({
    label: d.name,
    value: d.id,
  }))

  const managerGroups = buildEmployeeGroups(employees, {
    filter: (employee) =>
      employee.id !== employeeId &&
      employee.positionTitle.toLowerCase().includes('manager'),
    label: (employee) => `${employee.fullName} (${employee.number})`,
  })

  return (
    <main className="max-w-2xl mx-auto space-y-6">
      <Button
        onClick={() => router.history.back()}
        variant="outline"
        size="sm"
        className="gap-2 text-xs font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Employees List</span>
      </Button>

      <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border/70">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-heading tracking-tight">
              Edit Employee Profile
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Employee Number:{' '}
              <span className="font-mono font-bold text-heading">
                {employee.number}
              </span>
            </p>
          </div>
        </div>

        {isInactive && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">
              This employee is <strong>Inactive</strong>. You cannot change the
              inactive employee data. Please reactivate before continue to edit
            </p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!isInactive) {
              form.handleSubmit()
            }
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <form.AppField name="fullName">
                {(field) => (
                  <field.TextField label="Fullname" disabled={isInactive} />
                )}
              </form.AppField>
            </div>

            <form.AppField name="email">
              {(field) => (
                <field.TextField label="Work Email" disabled={isInactive} />
              )}
            </form.AppField>

            <form.AppField name="hireDate">
              {(field) => (
                <field.TextField
                  label="Join Date (Permanent)"
                  disabled={true}
                />
              )}
            </form.AppField>

            <form.AppField name="positionId">
              {(field) => (
                <field.FormSelect
                  values={positionOptions}
                  placeholder="Pick a job position"
                  label="Job Position"
                  disabled={isInactive}
                />
              )}
            </form.AppField>

            <form.AppField name="departmentId">
              {(field) => (
                <field.FormSelect
                  values={departmentOptions}
                  label="Department"
                  placeholder="Pick a department"
                  disabled={isInactive}
                />
              )}
            </form.AppField>

            <form.Subscribe selector={(state) => state.values.positionId}>
              {(positionId) => {
                const selectedPos = positions.find((p) => p.id === positionId)
                const isManager =
                  positionId.toUpperCase() === 'MGR' ||
                  Boolean(selectedPos?.title.toLowerCase().includes('manager'))

                if (isManager) return null

                return (
                  <div className="sm:col-span-2">
                    <form.AppField name="managerId">
                      {(field) => (
                        <field.FormSelect
                          nullable
                          values={managerOptions}
                          label="Direct Manager (Level 1 claim approver)"
                          placeholder="Pick a Direct Manager"
                          disabled={isInactive}
                        />
                      )}
                    </form.AppField>
                  </div>
                )
              }}
            </form.Subscribe>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
            <Button
              onClick={() => router.history.back()}
              variant="outline"
              type="button"
              size="sm"
            >
              Batal
            </Button>
            <form.AppForm>
              <form.FormButton
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                label="Update employee data"
                disabled={isInactive}
              />
            </form.AppForm>
          </div>
        </form>
      </div>
    </main>
  )
}

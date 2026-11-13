import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { createEmployeeForm } from '#/features/employees/forms/forms'
import { useGetAllEmployeesQuery } from '#/features/employees/queries/queries'
import { buildEmployeeGroups } from '#/features/employees/utils/employee-options'
import { useGetAllPositionsQuery } from '#/features/positions/queries/queries'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_app/admin/employees/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  const form = createEmployeeForm()

  const { data: positions = [] } = useGetAllPositionsQuery()
  const positionOptions = positions.map((p) => ({
    label: p.title,
    value: p.id,
  }))

  const { data: departments = [] } = useGetAllDepartmentsQuery()
  const departmentOptions = departments.map((d) => ({
    label: d.name,
    value: d.id,
  }))

  const { data: employees = [] } = useGetAllEmployeesQuery()
  const managerGroups = buildEmployeeGroups(employees, {
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
              Create a New Employee
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Register employee account, position, department, dan direct
              manager for claims approver.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <form.AppField name="fullName">
                {(field) => (
                  <field.TextField
                    label="Fullname"
                    placeholder="Budi Santoso"
                  />
                )}
              </form.AppField>
            </div>

            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  label="Work Email"
                  placeholder="budi.santoso@mii.co.id"
                />
              )}
            </form.AppField>

            <form.AppField name="hireDate">
              {(field) => <field.DatePicker label="Join Date" />}
            </form.AppField>

            <form.AppField name="positionId">
              {(field) => (
                <field.FormSelect
                  values={positionOptions}
                  placeholder="Pick a job position"
                  label="Job Position"
                />
              )}
            </form.AppField>

            <form.AppField name="departmentId">
              {(field) => (
                <field.FormSelect
                  values={departmentOptions}
                  label="Department"
                  placeholder="Pick a department"
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
              Cancel
            </Button>
            <form.AppForm>
              <form.FormButton
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                label="Create Employee"
              />
            </form.AppForm>
          </div>
        </form>
      </div>
    </main>
  )
}

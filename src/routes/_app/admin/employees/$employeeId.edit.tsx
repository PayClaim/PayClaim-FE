import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { editEmployeeForm } from '#/features/employees/forms/forms'
import { useGetAllEmployeeQuery } from '#/features/employees/queries/queries'
import { useGetAllPositionsQuery } from '#/features/positions/queries/queries'
import type { UpdateEmployeeRequest } from '#/types/employee.type'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin/employees/$employeeId/edit')({
  component: RouteComponent,
  validateSearch: (s): UpdateEmployeeRequest => {
    return {
      fullName: s.fullName as string,
      email: s.email as string,
      hireDate: s.hireDate as string,
      positionId: s.positionId as string,
      departmentId: s.departmentId as string,
      managerId: s.managerId as string,
      isActive: s.isActive as boolean,
    }
  },
})

function RouteComponent() {
  const { employeeId } = Route.useParams()
  const initialValue = Route.useSearch()
  const form = editEmployeeForm(employeeId, initialValue)

  const { data: positions } = useGetAllPositionsQuery()
  const positionOptions = positions.map((p) => {
    return { label: p.title, value: p.id }
  })

  const { data: departments } = useGetAllDepartmentsQuery()
  const departmentOptions = departments.map((d) => {
    return { label: d.name, value: d.id }
  })

  const { data: employees } = useGetAllEmployeeQuery()
  const managerOptions = employees.map((e) => {
    return { label: e.fullName, value: e.id }
  })
  return (
    <main className="bg-card max-w-200 rounded-2xl p-4 mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Edit Employee</h1>

      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className="grid grid-cols-2 gap-x-4">
            <form.AppField name="fullName">
              {(field) => <field.TextField label="Name" />}
            </form.AppField>

            <form.AppField name="email">
              {(field) => <field.TextField label="Email" />}
            </form.AppField>

            <form.AppField name="hireDate">
              {(field) => <field.DatePicker label="Hire Date" />}
            </form.AppField>

            <form.AppField name="positionId">
              {(field) => (
                <field.FormSelect
                  values={positionOptions}
                  placeholder="Pick Position"
                  label="Position"
                />
              )}
            </form.AppField>

            <form.AppField name="departmentId">
              {(field) => (
                <field.FormSelect
                  values={departmentOptions}
                  label="Department"
                  placeholder="Pick Department"
                />
              )}
            </form.AppField>

            <form.AppField name="managerId">
              {(field) => (
                <field.FormSelect
                  nullable
                  values={managerOptions}
                  label="Manager"
                />
              )}
            </form.AppField>
          </div>

          <form.AppForm>
            <form.FormButton label="Submit" />
          </form.AppForm>
        </form>
      </div>
    </main>
  )
}

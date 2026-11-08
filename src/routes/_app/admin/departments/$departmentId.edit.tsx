import { editDepartmentForm } from '#/features/departments/forms/forms'
import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import type { UpdateDepartmentRequest } from '#/types/department.type'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_app/admin/departments/$departmentId/edit',
)({
  component: RouteComponent,
  validateSearch: (s): UpdateDepartmentRequest => {
    return {
      name: s.name as string,
      parentDeptId: s.parentDeptId as string | null,
    }
  },
})

function RouteComponent() {
  const { departmentId } = Route.useParams()
  const initialValue = Route.useSearch()
  const { data: departments } = useGetAllDepartmentsQuery()

  const departmentOptions = departments
    .filter((d) => d.id !== departmentId)
    .map((d) => {
      return { label: d.name, value: d.id }
    })
  const form = editDepartmentForm(departmentId, initialValue)

  return (
    <main className="bg-card max-w-200 rounded-2xl p-4 mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Edit Department</h1>

      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.AppField name="name">
            {(field) => <field.TextField label="Name" />}
          </form.AppField>

          <form.AppField name="parentDeptId">
            {(field) => (
              <field.FormSelect
                nullable
                placeholder="Pick Department"
                values={departmentOptions}
                label="Parent Department"
              />
            )}
          </form.AppField>

          <form.AppForm>
            <form.FormButton label="Submit" />
          </form.AppForm>
        </form>
      </div>
    </main>
  )
}

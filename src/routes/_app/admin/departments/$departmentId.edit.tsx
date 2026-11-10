import { editDepartmentForm } from '#/features/departments/forms/forms'
import {
  useGetAllDepartmentsQuery,
  useGetDepartmentQuery,
} from '#/features/departments/queries/queries'
import type { DepartmentResponse } from '#/types/department.type'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_app/admin/departments/$departmentId/edit',
)({
  component: RouteComponent,
  validateSearch: (s: Record<string, unknown>) => s,
})

function RouteComponent() {
  const { departmentId } = Route.useParams()
  const { data: department, isLoading, isError } = useGetDepartmentQuery(departmentId)
  const { data: departments = [] } = useGetAllDepartmentsQuery()

  if (isLoading) {
    return (
      <main className="bg-card max-w-200 rounded-2xl p-6 mx-auto text-center text-muted-foreground">
        Loading department...
      </main>
    )
  }

  if (isError || !department) {
    return (
      <main className="bg-card max-w-200 rounded-2xl p-6 mx-auto text-center text-destructive">
        Department not found.
      </main>
    )
  }

  return (
    <EditDepartmentFormContent
      departmentId={departmentId}
      department={department}
      departments={departments}
    />
  )
}

function EditDepartmentFormContent({
  departmentId,
  department,
  departments,
}: {
  departmentId: string
  department: DepartmentResponse
  departments: DepartmentResponse[]
}) {
  const departmentOptions = departments
    .filter((d) => d.id !== departmentId)
    .map((d) => ({
      label: d.name,
      value: d.id,
    }))

  const form = editDepartmentForm(departmentId, {
    name: department.name,
    parentDeptId: department.parentDeptId ?? null,
  })

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

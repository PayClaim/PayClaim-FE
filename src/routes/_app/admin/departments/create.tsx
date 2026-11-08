import { createDepartmentForm } from '#/features/departments/forms/forms'
import { useGetAllDepartmentsQuery } from '#/features/departments/queries/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin/departments/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: departments } = useGetAllDepartmentsQuery()
  const form = createDepartmentForm()

  const departmentOptions = departments.map((d) => {
    return { label: d.name, value: d.id }
  })

  return (
    <main className="bg-card max-w-200 rounded-2xl p-4 mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">New Department</h1>

      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.AppField name="id">
            {(field) => <field.TextField label="Code" />}
          </form.AppField>

          <form.AppField name="name">
            {(field) => <field.TextField label="Name" />}
          </form.AppField>

          <form.AppField name="parentDeptId">
            {(field) => (
              <field.FormSelect
                nullable
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

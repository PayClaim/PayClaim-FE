import { useGetAllCategoriesQuery } from '#/features/benefit-categories/queries/queries'
import { createBenefitForm } from '#/features/benefits/forms/forms'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin/benefits/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: categories } = useGetAllCategoriesQuery()

  const form = createBenefitForm()

  const periodTypeOption = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Yearly', value: 'Yearly' },
    { label: 'One Time', value: 'OneTime' },
  ]

  const categoryOptions = categories.map((c) => {
    return { label: c.name, value: c.id }
  })

  return (
    <main className="bg-card max-w-200 rounded-2xl p-4 mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">New Benefit</h1>

      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className="grid grid-cols-3 gap-4">
            <form.AppField name="name">
              {(field) => <field.TextField label="Name" />}
            </form.AppField>

            <form.AppField name="periodType">
              {(field) => (
                <field.FormSelect
                  values={periodTypeOption}
                  label="Period Type"
                />
              )}
            </form.AppField>
            <form.AppField name="categoryId">
              {(field) => (
                <field.FormSelectNumber
                  values={categoryOptions}
                  label="Category"
                />
              )}
            </form.AppField>
          </div>

          <form.AppField name="description">
            {(field) => <field.TextArea label="Description" />}
          </form.AppField>

          <form.AppForm>
            <form.FormButton label="Submit" />
          </form.AppForm>
        </form>
      </div>
    </main>
  )
}

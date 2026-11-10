import { useGetAllCategoriesQuery } from '#/features/benefit-categories/queries/queries'
import { editBenefitForm } from '#/features/benefits/forms/forms'
import { useGetBenefitQuery } from '#/features/benefits/queries/queries'
import type { BenefitResponse } from '#/types/benefits.type'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/admin/benefits/$benefitId/edit')({
  component: RouteComponent,
  validateSearch: (s: Record<string, unknown>) => s,
})

function RouteComponent() {
  const { benefitId } = Route.useParams()
  const { data: benefit, isLoading, isError } = useGetBenefitQuery(benefitId)
  const { data: categories = [] } = useGetAllCategoriesQuery()

  if (isLoading) {
    return (
      <main className="bg-card max-w-200 rounded-2xl p-6 mx-auto text-center text-muted-foreground">
        Loading benefit...
      </main>
    )
  }

  if (isError || !benefit) {
    return (
      <main className="bg-card max-w-200 rounded-2xl p-6 mx-auto text-center text-destructive">
        Benefit not found.
      </main>
    )
  }

  return (
    <EditBenefitFormContent
      benefitId={benefitId}
      benefit={benefit}
      categories={categories}
    />
  )
}

function EditBenefitFormContent({
  benefitId,
  benefit,
  categories,
}: {
  benefitId: string
  benefit: BenefitResponse
  categories: any[]
}) {
  const form = editBenefitForm(benefitId, {
    name: benefit.name,
    description: benefit.description,
    periodType: benefit.periodType,
    categoryId: benefit.categoryId,
  })

  const periodTypeOption = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Yearly', value: 'Yearly' },
    { label: 'One Time', value: 'OneTime' },
  ]

  const categoryOptions = categories.map((c) => {
    return { label: c.name, value: c.id }
  })

  return (
    <main className="bg-card max-w-200 rounded-2xl p-6 mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Edit Benefit</h1>

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

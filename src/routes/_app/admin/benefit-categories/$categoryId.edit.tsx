import { editCategoryForm } from '#/features/benefit-categories/forms/forms'
import { useGetCategoryQuery } from '#/features/benefit-categories/queries/queries'
import type { BenefitCategoryResponse } from '#/types/benefitCategories'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_app/admin/benefit-categories/$categoryId/edit',
)({
  component: RouteComponent,
  validateSearch: (s: Record<string, unknown>) => s,
})

function RouteComponent() {
  const { categoryId } = Route.useParams()
  const { data: category, isLoading, isError } = useGetCategoryQuery(Number(categoryId))

  if (isLoading) {
    return (
      <main className="bg-card max-w-200 rounded-2xl p-6 mx-auto text-center text-muted-foreground">
        Loading category...
      </main>
    )
  }

  if (isError || !category) {
    return (
      <main className="bg-card max-w-200 rounded-2xl p-6 mx-auto text-center text-destructive">
        Category not found.
      </main>
    )
  }

  return (
    <EditCategoryFormContent
      categoryId={Number(categoryId)}
      category={category}
    />
  )
}

function EditCategoryFormContent({
  categoryId,
  category,
}: {
  categoryId: number
  category: BenefitCategoryResponse
}) {
  const form = editCategoryForm(categoryId, { name: category.name })

  return (
    <main className="bg-card max-w-200 rounded-2xl p-6 mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Edit Category</h1>

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

          <form.AppForm>
            <form.FormButton label="Submit" />
          </form.AppForm>
        </form>
      </div>
    </main>
  )
}

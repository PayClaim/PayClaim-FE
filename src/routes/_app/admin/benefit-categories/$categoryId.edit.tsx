import { editCategoryForm } from '#/features/benefit-categories/forms/forms'
import type { UpdateBenefitCategory } from '#/types/benefitCategories'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_app/admin/benefit-categories/$categoryId/edit',
)({
  component: RouteComponent,
  validateSearch: (s): UpdateBenefitCategory => {
    return {
      name: s.name as string,
    }
  },
})

function RouteComponent() {
  const { categoryId } = Route.useParams()
  const initialValue = Route.useSearch()
  const form = editCategoryForm(Number(categoryId), initialValue)

  return (
    <main className="bg-card max-w-200 rounded-2xl p-4 mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">New Category</h1>

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

import { useAppForm } from '#/hooks/app.form'
import type { UpdateBenefitCategory } from '#/types/benefitCategories'
import { useNavigate } from '@tanstack/react-router'
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '../queries/queries'
import { createCategorySchema, updateCategorySchema } from './schemas'

export const createCategoryForm = () => {
  const mutation = useCreateCategoryMutation()
  const navigate = useNavigate()

  return useAppForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onBlur: createCategorySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        mutation.mutate(value)
        await navigate({
          to: '/admin/benefit-categories',
        })
      } catch (err) {
        console.error(err)
      }
    },
  })
}

export const editCategoryForm = (
  id: number,
  initialValue: UpdateBenefitCategory,
) => {
  const mutation = useUpdateCategoryMutation(id)
  const navigate = useNavigate()

  return useAppForm({
    defaultValues: initialValue,
    validators: {
      onBlur: updateCategorySchema,
    },
    onSubmit: async ({ value }) => {
      try {
        mutation.mutate(value)
        await navigate({
          to: '/admin/benefit-categories',
        })
      } catch (err) {
        console.error(err)
      }
    },
  })
}

export const deleteCategoryForm = (id: number) => {
  const mutation = useDeleteCategoryMutation()
  const navigate = useNavigate()
  return useAppForm({
    defaultValues: { id: id },
    onSubmit: async ({ value }) => {
      try {
        mutation.mutate(value.id)
        await navigate({
          to: '/admin/benefit-categories',
        })
      } catch (err) {
        console.error(err)
      }
    },
  })
}

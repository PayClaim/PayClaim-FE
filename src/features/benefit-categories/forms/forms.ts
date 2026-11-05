import { useAppForm } from '#/hooks/demo.form'
import type { UpdateBenefitCategory } from '#/types/benefitCategories'
import { createCategorySchema, updateCategorySchema } from './schemas'

export const createCategoryForm = () => {
  const today = new Date()
  today.setHours(0)

  return useAppForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onBlur: createCategorySchema,
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })
}

export const editCategoryForm = (initialValue: UpdateBenefitCategory) => {
  return useAppForm({
    defaultValues: initialValue,
    validators: {
      onBlur: updateCategorySchema,
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })
}

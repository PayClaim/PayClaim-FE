import { useAppForm } from '#/hooks/demo.form'
import type { UpdateBenefitCategory } from '#/types/benefitCategories'
import type { UpdateDepartmentRequest } from '#/types/department.type'
import { createDepartmentSchema, updateDepartmentSchema } from './schemas'

export const createCategoryForm = () => {
  const today = new Date()
  today.setHours(0)

  return useAppForm({
    defaultValues: {
      id: '',
      name: '',
      parent: '',
    },
    validators: {
      onBlur: createDepartmentSchema,
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })
}

export const editCategoryForm = (initialValue: UpdateDepartmentRequest) => {
  return useAppForm({
    defaultValues: initialValue,
    validators: {
      onBlur: updateDepartmentSchema,
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })
}

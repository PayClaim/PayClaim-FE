import { useAppForm } from '#/hooks/demo.form'
import type { UpdateBenefitRequest } from '#/types/benefits.type'
import { createBenefitSchema, updateBenefitSchema } from './schemas'

export const createBenefitForm = () => {
  const today = new Date()
  today.setHours(0)

  return useAppForm({
    defaultValues: {
      name: '',
      description: '',
      periodType: '',
      categoryId: '',
      // filePath: ""
    },
    validators: {
      onBlur: createBenefitSchema,
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })
}

export const editBenefitForm = (initialValue: UpdateBenefitRequest) => {
  return useAppForm({
    defaultValues: initialValue,
    validators: {
      onBlur: updateBenefitSchema,
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })
}

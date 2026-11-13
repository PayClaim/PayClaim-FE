import { useAppForm } from '#/hooks/app.form'
import type { UpdateBenefitRequest } from '#/types/benefits.type'
import { useNavigate } from '@tanstack/react-router'
import {
  useCreateBenefitMutation,
  useDeleteBenefitMutation,
  useUpdateBenefitMutation,
} from '../queries/queries'
import { createBenefitSchema, updateBenefitSchema } from './schemas'

export const createBenefitForm = () => {
  const mutation = useCreateBenefitMutation()
  const navigate = useNavigate()

  return useAppForm({
    defaultValues: {
      name: '',
      description: '',
      periodType: '',
      categoryId: 0,
      // filePath: ""
    },
    validators: {
      onBlur: createBenefitSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        mutation.mutate(value)
        await navigate({
          to: '/admin/benefits',
        })
      } catch (e) {
        console.log(e)
      }
    },
  })
}

export const editBenefitForm = (
  id: string,
  initialValue: UpdateBenefitRequest,
) => {
  const mutation = useUpdateBenefitMutation(id)
  const navigate = useNavigate()
  return useAppForm({
    defaultValues: initialValue,
    validators: {
      onBlur: updateBenefitSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        mutation.mutate(value)
        await navigate({
          to: '/admin/benefits',
        })
      } catch (err) {
        console.log(err)
      }
    },
  })
}

export const deleteBenefitForm = (id: string) => {
  const mutation = useDeleteBenefitMutation()
  const navigate = useNavigate()
  return useAppForm({
    defaultValues: { id: id },
    onSubmit: async ({ value }) => {
      try {
        mutation.mutate(value.id)
        await navigate({
          to: '/admin/benefits',
        })
      } catch (err) {
        console.log(err)
      }
    },
  })
}

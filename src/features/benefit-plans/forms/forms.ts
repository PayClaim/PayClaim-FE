import { useAppForm } from '#/hooks/demo.form'
import { useNavigate } from '@tanstack/react-router'
import {
  useCreateBenefitPlanMutation,
  useUpdateBenefitPlanMutation,
  useDeleteBenefitPlanMutation,
} from '../queries/queries'
import { upsertBenefitPlanSchema } from './schemas'
import type { UpsertBenefitPlanRequest } from '#/types/benefitPlans.type'
import { toast } from 'sonner'

export const createBenefitPlanForm = () => {
  const mutation = useCreateBenefitPlanMutation()
  const navigate = useNavigate()

  return useAppForm({
    defaultValues: {
      departmentId: '',
      positionId: '',
      benefitId: '',
      limitAmount: 0,
    },
    validators: {
      onBlur: upsertBenefitPlanSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value)
        toast.success('Benefit plan created successfully')
        await navigate({
          to: '/admin/benefit-plans',
        })
      } catch (err: unknown) {
        const error = err as { message?: string }
        toast.error(error.message || 'Failed to create benefit plan')
      }
    },
  })
}

export const editBenefitPlanForm = (
  originalKeys: {
    departmentId: string
    benefitId: string
    positionId: string
  },
  initialValue: UpsertBenefitPlanRequest,
) => {
  const mutation = useUpdateBenefitPlanMutation(
    originalKeys.departmentId,
    originalKeys.benefitId,
    originalKeys.positionId,
  )
  const navigate = useNavigate()

  return useAppForm({
    defaultValues: initialValue,
    validators: {
      onBlur: upsertBenefitPlanSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value)
        toast.success('Benefit plan updated successfully')
        await navigate({
          to: '/admin/benefit-plans',
        })
      } catch (err: unknown) {
        const error = err as { message?: string }
        toast.error(error.message || 'Failed to update benefit plan')
      }
    },
  })
}

export const deleteBenefitPlanForm = (keys: {
  departmentId: string
  benefitId: string
  positionId: string
}) => {
  const mutation = useDeleteBenefitPlanMutation()
  const navigate = useNavigate()

  return useAppForm({
    defaultValues: keys,
    onSubmit: async ({ value }) => {
      try {
        await mutation.mutateAsync(value)
        toast.success('Benefit plan deleted successfully')
        await navigate({
          to: '/admin/benefit-plans',
        })
      } catch (err: unknown) {
        const error = err as { message?: string }
        toast.error(error.message || 'Failed to delete benefit plan')
      }
    },
  })
}

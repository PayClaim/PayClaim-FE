import { useAppForm } from '#/hooks/app.form'
import { useNavigate } from '@tanstack/react-router'
import {
  useCreateBenefitPlanMutation,
  useUpdateBenefitPlanMutation,
  useDeleteBenefitPlanMutation,
} from '../queries/queries'
import { upsertBenefitPlanSchema } from './schemas'
import type { UpsertBenefitPlanRequest } from '#/types/benefitPlans.type'
import { toast } from 'sonner'
import { getFriendlyErrorMessage } from '#/lib/error'

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
        toast.error(getFriendlyErrorMessage(err, 'Gagal membuat rencana manfaat'))
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
        toast.error(getFriendlyErrorMessage(err, 'Gagal memperbarui rencana manfaat'))
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
        toast.error(getFriendlyErrorMessage(err, 'Gagal menghapus rencana manfaat'))
      }
    },
  })
}

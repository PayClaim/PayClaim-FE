import { useAppForm } from '#/hooks/app.form'
import { toDateOnly } from '#/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import {
  useApproveClaimMutation,
  useCreateClaimMutation,
  useRejectClaimMutation,
  useUpdateClaimMutation,
} from '../queries/queries'
import { approvalClaimSchema, createClaimSchema } from './schemas'
import { toast } from 'sonner'
import type { ApprovalDecisionEnum } from '#/types/claims.type'

export const createClaimForm = () => {
  const mutation = useCreateClaimMutation()
  const navigate = useNavigate()
  const today = new Date()
  today.setHours(0)

  return useAppForm({
    defaultValues: {
      claimType: 'Benefit',
      description: '',
      transactionDate: toDateOnly(new Date(today)),
      amount: 0,
      employeeBenefitId: null as string | null,
      tripProposalId: null as string | null,
      receiptFile: null as File | null,
    },
    validators: {
      onBlur: createClaimSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData()
      formData.append('claimType', value.claimType)
      formData.append('description', value.description)
      formData.append('transactionDate', value.transactionDate)
      formData.append('amount', value.amount.toString())

      if (value.claimType === 'Benefit' && value.employeeBenefitId) {
        formData.append('employeeBenefitId', value.employeeBenefitId)
      }
      if (
        value.claimType === 'BusinessTripReimbursement' &&
        value.tripProposalId
      ) {
        formData.append('tripProposalId', value.tripProposalId)
      }
      if (value.receiptFile) {
        formData.append('receiptFile', value.receiptFile)
      }

      try {
        await mutation.mutateAsync(formData)
        toast.success('Claim submitted successfully')
        await navigate({
          to: '/claims',
        })
      } catch (err: unknown) {
        const error = err as { message?: string }
        toast.error(error.message || 'Failed to submit claim')
      }
    },
  })
}

export const editClaimForm = (
  claimId: string,
  initialValues: {
    claimType: string
    description: string
    transactionDate: string
    amount: number
    employeeBenefitId: string | null
    tripProposalId: string | null
  },
) => {
  const mutation = useUpdateClaimMutation(claimId)
  const navigate = useNavigate()

  return useAppForm({
    defaultValues: {
      ...initialValues,
      receiptFile: null as File | null,
    },
    validators: {
      onBlur: createClaimSchema,
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData()
      formData.append('claimType', value.claimType)
      formData.append('description', value.description)
      formData.append('transactionDate', value.transactionDate)
      formData.append('amount', value.amount.toString())

      if (value.claimType === 'Benefit' && value.employeeBenefitId) {
        formData.append('employeeBenefitId', value.employeeBenefitId)
      }
      if (
        value.claimType === 'BusinessTripReimbursement' &&
        value.tripProposalId
      ) {
        formData.append('tripProposalId', value.tripProposalId)
      }
      if (value.receiptFile) {
        formData.append('receiptFile', value.receiptFile)
      }

      try {
        await mutation.mutateAsync(formData)
        toast.success('Claim resubmitted successfully')
        await navigate({
          to: '/claims/$claimId',
          params: { claimId },
        })
      } catch (err: unknown) {
        const error = err as { message?: string }
        toast.error(error.message || 'Failed to resubmit claim')
      }
    },
  })
}

export const approvalForm = (id: string, decision: ApprovalDecisionEnum) => {
  console.log(id, decision)
  const approveMutation = useApproveClaimMutation(id)
  const rejectMutation = useRejectClaimMutation(id)

  let mutation = useRejectClaimMutation(id)

  switch (decision) {
    case 'Approved':
      mutation = approveMutation
      break
    case 'Rejected':
      mutation = rejectMutation
      break
  }

  return useAppForm({
    defaultValues: {
      decision: decision,
      notes: '',
    },
    // validators: { onBlur: approvalClaimSchema },
    onSubmit: async ({ value }) => {
      // try {
      //   await mutation.mutateAsync(value)
      //   toast.success('Claim has been mutate successfully.')
      // } catch (err: unknown) {
      //   const e = err as { message?: string }
      //   toast.error(e.message || 'Action failed to process.')
      // }
      console.log(value)
    },
  })
}

import { useAppForm } from '#/hooks/app.form'
import { toDateOnly } from '#/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import {
  useCreateClaimMutation,
  useUpdateClaimMutation,
} from '../queries/queries'
import { createClaimSchema } from './schemas'
import { toast } from 'sonner'
import { getFriendlyErrorMessage } from '#/lib/error'
import type { ApprovalDecisionEnum } from '#/types/claims.type'

export function applyBackendErrorToForm(
  formApi: any,
  err: unknown,
  fallbackMessage: string,
) {
  const errorMsg = getFriendlyErrorMessage(err, fallbackMessage)
  toast.error(errorMsg)

  const apiData = (err as any)?.data
  if (
    apiData?.errors &&
    typeof apiData.errors === 'object' &&
    !Array.isArray(apiData.errors)
  ) {
    let matchedAny = false
    for (const [key, val] of Object.entries(apiData.errors)) {
      const fieldKey = key.charAt(0).toLowerCase() + key.slice(1)
      const fieldMessage = Array.isArray(val) ? val.join(', ') : String(val)
      formApi.setFieldMeta(fieldKey, (prev: any) => ({
        ...prev,
        isTouched: true,
        errorMap: {
          ...prev?.errorMap,
          onSubmit: fieldMessage,
        },
      }))
      matchedAny = true
    }
    if (matchedAny) return
  }

  const lowerMsg = errorMsg.toLowerCase()
  let targetField = 'amount'

  if (
    lowerMsg.includes('quota') ||
    lowerMsg.includes('balance') ||
    lowerMsg.includes('saldo') ||
    lowerMsg.includes('amount') ||
    lowerMsg.includes('budget') ||
    lowerMsg.includes('nominal')
  ) {
    targetField = 'amount'
  } else if (
    lowerMsg.includes('date') ||
    lowerMsg.includes('period') ||
    lowerMsg.includes('tanggal') ||
    lowerMsg.includes('periode')
  ) {
    targetField = 'transactionDate'
  } else if (
    lowerMsg.includes('receipt') ||
    lowerMsg.includes('file') ||
    lowerMsg.includes('bukti') ||
    lowerMsg.includes('dokumen')
  ) {
    targetField = 'receiptFile'
  } else if (lowerMsg.includes('benefit') || lowerMsg.includes('manfaat')) {
    targetField = 'employeeBenefitId'
  } else if (lowerMsg.includes('trip') || lowerMsg.includes('perjalanan')) {
    targetField = 'tripProposalId'
  } else if (
    lowerMsg.includes('description') ||
    lowerMsg.includes('deskripsi') ||
    lowerMsg.includes('keterangan')
  ) {
    targetField = 'description'
  }

  formApi.setFieldMeta(targetField, (prev: any) => ({
    ...prev,
    isTouched: true,
    errorMap: {
      ...prev?.errorMap,
      onSubmit: errorMsg,
    },
  }))
}

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
      onSubmit: createClaimSchema,
    },
    onSubmit: async ({ value, formApi }) => {
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
        applyBackendErrorToForm(formApi, err, 'Gagal mengajukan klaim')
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
      onSubmit: createClaimSchema,
    },
    onSubmit: async ({ value, formApi }) => {
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
        applyBackendErrorToForm(formApi, err, 'Gagal mengajukan ulang klaim')
      }
    },
  })
}

export const approvalForm = (id: string, decision: ApprovalDecisionEnum) => {
  console.log(id, decision)

  return useAppForm({
    defaultValues: {
      decision: decision,
      notes: '',
    },
    onSubmit: async ({ value }) => {
      console.log(value)
    },
  })
}

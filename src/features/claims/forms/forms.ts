import { useAppForm } from '#/hooks/demo.form'
import { createClaimSchema } from './schemas'

export const createClaimForm = () => {
  const today = new Date()
  today.setHours(0)

  return useAppForm({
    defaultValues: {
      claimType: 'benefit_enum',
      description: '',
      transactionDate: new Date(today),
      amount: 0,
      employeeBenefitId: null as string | null,
      tripProposalId: null as string | null,
      // filePath: ""
    },
    validators: {
      onBlur: createClaimSchema,
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })
}

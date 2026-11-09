import { createFileRoute } from '@tanstack/react-router'
import { ButtonGroup } from '#/components/ui/button-group'
import { Button } from '#/components/ui/button'
import { useState } from 'react'
import { createClaimForm } from '#/features/claims/forms/forms'
import { useGetAllEmployeeBenefitsQuery } from '#/features/employee-benefits/queries/queries'
import { useAuth } from '#/hooks/auth.hook'

export const Route = createFileRoute('/_app/claims/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: empBenefits } = useGetAllEmployeeBenefitsQuery()
  const { user } = useAuth()

  const [currentClaimType, setClaimType] = useState('Benefit')
  const claimTypeSelect = [
    { label: 'Benefit', value: 'Benefit' },
    { label: 'Operational', value: 'OperationalReimbursement' },
    { label: 'Trip', value: 'BusinessTripReimbursement' },
  ]
  const tripSelect = [
    { label: 'Trip 1', value: 'guid_1' },
    { label: 'Trip 2', value: 'guid_2' },
    { label: 'Trip 3', value: 'guid_3' },
  ]
  const benefitSelect = empBenefits.map((b) => {
    return {
      label: `${b.benefitName} (balance: ${b.balance})`,
      value: b.employeeBenefitId,
    }
  })

  const form = createClaimForm(user.id)

  const handleClaimTypeClick = (value: string) => {
    setClaimType(value)
    form.setFieldValue('claimType', value)
    form.setFieldValue('employeeBenefitId', null)
    form.setFieldValue('tripProposalId', null)
  }

  return (
    <main className="bg-card max-w-200 rounded-2xl p-4 mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">New Claim</h1>

      <div className="flex justify-center mb-4">
        <ButtonGroup>
          {claimTypeSelect.map((t) => (
            <ClaimTypeButton
              label={t.label}
              value={t.value}
              current={currentClaimType}
              setFunc={handleClaimTypeClick}
            />
          ))}
        </ButtonGroup>
      </div>

      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="transactionDate">
              {(field) => <field.DatePicker label="Transaction Date" />}
            </form.AppField>

            <form.AppField name="amount">
              {(field) => <field.NumberField label="Amount" />}
            </form.AppField>

            {currentClaimType === 'BusinessTripReimbursement' ? (
              <form.AppField name="tripProposalId">
                {(field) => (
                  <field.FormSelect values={tripSelect} label="Trip" />
                )}
              </form.AppField>
            ) : (
              <form.AppField name="employeeBenefitId">
                {(field) => (
                  <field.FormSelect
                    placeholder="Pick benefit"
                    values={benefitSelect}
                    label="Benefit"
                  />
                )}
              </form.AppField>
            )}
            <form.AppField name="receiptFile">
              {(field) => <field.FileInput label="Receipt File" />}
            </form.AppField>
          </div>
          <form.AppField name="description">
            {(field) => <field.TextArea label="Description" rows={10} />}
          </form.AppField>

          <form.AppForm>
            <form.FormButton label="Submit" />
          </form.AppForm>
        </form>
      </div>
    </main>
  )
}

function ClaimTypeButton({
  label,
  value,
  current,
  setFunc,
}: {
  label: string
  value: string
  current: string
  setFunc: (a: string) => void
}) {
  return (
    <Button
      variant={current === value ? 'default' : 'outline'}
      onClick={() => setFunc(value)}
    >
      {label}
    </Button>
  )
}

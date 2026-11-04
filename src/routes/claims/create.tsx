import { createFileRoute } from '@tanstack/react-router'
import { ButtonGroup } from '#/components/ui/button-group'
import { Button } from '#/components/ui/button'
import { useState } from 'react'
import { createClaimForm } from '#/features/claims/forms/forms'

export const Route = createFileRoute('/claims/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const [currentClaimType, setClaimType] = useState('benefit_enum')
  const claimTypeSelect = [
    { label: 'Benefit', value: 'benefit_enum' },
    { label: 'Operational', value: 'operational_enum' },
    { label: 'Trip', value: 'trip_enum' },
  ]
  const tripSelect = [
    { label: 'Trip 1', value: 'guid_1' },
    { label: 'Trip 2', value: 'guid_2' },
    { label: 'Trip 3', value: 'guid_3' },
  ]
  const benefitSelect = [
    { label: 'Benefit 1', value: 'guid_1' },
    { label: 'Benefit 2', value: 'guid_2' },
    { label: 'Benefit 3', value: 'guid_3' },
  ]

  const form = createClaimForm()

  const handleClaimTypeClick = (value: string) => {
    setClaimType(value)
    form.setFieldValue('claimType', value)
    form.setFieldValue('employeeBenefitId', null)
    form.setFieldValue('tripProposalId', null)
  }

  return (
    <main>
      <div className="mb-8 flex justify-between">
        <h1 className="text-3xl font-bold">New Claim</h1>
      </div>

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
          <form.AppField name="description">
            {(field) => <field.TextArea label="Description" />}
          </form.AppField>

          <form.AppField name="transactionDate">
            {(field) => <field.DatePicker label="Transaction Date" />}
          </form.AppField>

          <form.AppField name="amount">
            {(field) => <field.NumberField label="Amount" />}
          </form.AppField>

          {currentClaimType === 'trip_enum' ? (
            <form.AppField name="tripProposalId">
              {(field) => <field.FormSelect values={tripSelect} label="Trip" />}
            </form.AppField>
          ) : (
            <form.AppField name="employeeBenefitId">
              {(field) => (
                <field.FormSelect values={benefitSelect} label="Benefit" />
              )}
            </form.AppField>
          )}

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

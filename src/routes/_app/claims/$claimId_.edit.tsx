import { createFileRoute } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { useState } from 'react'
import { editClaimForm } from '#/features/claims/forms/forms'
import { useGetClaimsQuery } from '#/features/claims/queries/queries'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '#/components/ui/dialog'
import { ErrorComponent, LoadingComponent } from '#/components/ErrorAndLoading'

export const Route = createFileRoute('/_app/claims/$claimId_/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { claimId } = Route.useParams()
  const { data: claim, isError, error, isFetching } = useGetClaimsQuery(claimId)

  if (!claim) return <p>Claim not found</p>

  const initialValue = {
    claimType: claim.claimType,
    transactionDate: claim.transactionDate,
    description: claim.description,
    amount: claim.amount,
    tripProposalId: claim.tripProposalId,
    employeeBenefitId: claim.employeeBenefitId,
  }

  const form = editClaimForm(claimId, initialValue)

  const [dialogOpen, setDialogOpen] = useState(false)

  const handleReview = async () => {
    await form.validateAllFields('submit')
    console.log(form.state.isValid)
    if (form.state.isValid) setDialogOpen(true)
  }

  const handleConfirm = async () => {
    await form.handleSubmit()
    setDialogOpen(false)
  }

  if (isError) return <ErrorComponent pageTitle="Revise Claim" error={error} />
  if (isFetching) return <LoadingComponent pageTitle="Revise Claim" />

  return (
    <main className="bg-card max-w-200 rounded-2xl p-6 mx-auto border border-border shadow-xs">
      <h1 className="text-3xl font-bold text-center mb-8">Revise Claim</h1>

      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleReview()
          }}
        >
          <div className="grid grid-cols-2 gap-x-4">
            <form.AppField name="transactionDate">
              {(field) => <field.DatePicker label="Receipt Date" />}
            </form.AppField>

            <form.AppField name="amount">
              {(field) => (
                <field.CurrencyField label="Amount" placeholder="0" />
              )}
            </form.AppField>

            <div className="col-span-2">
              <form.AppField name="receiptFile">
                {(field) => (
                  <field.FileInput label="Receipt File (Proof of Payment)" />
                )}
              </form.AppField>
            </div>
          </div>

          <form.AppField name="description">
            {(field) => (
              <field.TextArea
                label="Description"
                placeholder="Explain the purpose of this claim..."
                rows={5}
              />
            )}
          </form.AppField>

          <Button type="submit">Submit</Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>Submit this claim?</DialogHeader>
              <DialogDescription>Form will be submitted</DialogDescription>
              <DialogFooter>
                <DialogClose>Close</DialogClose>
                <Button
                  disabled={form.state.isSubmitting}
                  onClick={handleConfirm}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* <div className="mt-6 flex justify-end">
            <form.AppForm>
              <form.FormButton label="Submit Claim" className="bg-primary" />
            </form.AppForm>
          </div> */}
        </form>
      </div>
    </main>
  )
}

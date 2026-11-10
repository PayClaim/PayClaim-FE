
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import { createTripProposalForm } from '#/features/trip-proposals/forms/forms'
import { useGetAllEmployeeQuery } from '#/features/employees/queries/queries'
import { useAuth } from '#/hooks/auth.hook'

import type { EmployeeResponse } from '#/types/employee.type'
import type { TripProposalParticipantInput } from '#/types/tripProposals.type'

export const Route = createFileRoute('/_app/trip-proposals/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  const { data: employees = [], isLoading } = useGetAllEmployeeQuery()

  if (!user) {
    return <p>Loading user information...</p>
  }

  if (isLoading) {
    return <p>Loading employees...</p>
  }

  const currentEmployee = employees.find(
    (employee) =>
      employee.email.toLowerCase() === user.email.toLowerCase(),
  )

  if (!currentEmployee) {
    return (
      <p className="text-center text-destructive">
        Employee data could not be found for the logged-in user.
      </p>
    )
  }

  return (
    <CreateTripProposalPage
      currentEmployee={currentEmployee}
      employees={employees}
    />
  )
}

function CreateTripProposalPage({
  currentEmployee,
  employees,
}: {
  currentEmployee: EmployeeResponse
  employees: EmployeeResponse[]
}) {
  const form = createTripProposalForm(currentEmployee.id)

  const [participants, setParticipants] = useState<
    TripProposalParticipantInput[]
  >([
    {
      employeeId: currentEmployee.id,
      isPic: true,
      amount: 0,
    },
  ])

  // Setiap perubahan peserta juga memperbarui nilai form.
  const updateParticipants = (newParticipants: TripProposalParticipantInput[]) => {
    setParticipants(newParticipants)
    form.setFieldValue('participants', newParticipants)
  }

  // Menambahkan peserta baru.
  const handleAddParticipant = () => {
    updateParticipants([
      ...participants,
      {
        employeeId: '',
        isPic: false,
        amount: 0,
      },
    ])
  }

  // Mengubah EmployeeId peserta.
  const handleEmployeeChange = (index: number, employeeId: string) => {
    const updatedParticipants = participants.map((participant, i) =>
      i === index ? { ...participant, employeeId } : participant,
    )

    updateParticipants(updatedParticipants)
  }

  // Mengubah nominal peserta.
  const handleAmountChange = (index: number, amount: number) => {
    const updatedParticipants = participants.map((participant, i) =>
      i === index ? { ...participant, amount } : participant,
    )

    updateParticipants(updatedParticipants)
  }

  // Menghapus peserta tambahan.
  const handleRemoveParticipant = (index: number) => {
    const updatedParticipants = participants.filter((_, i) => i !== index)

    updateParticipants(updatedParticipants)
  }

  const totalAmount = participants.reduce(
    (total, participant) => total + participant.amount,
    0,
  )

  return (
    <main className="mx-auto max-w-200 rounded-2xl bg-card p-6">
      <h1 className="mb-8 text-center text-3xl font-bold">
        New Trip Proposal
      </h1>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
      >
        {/* Informasi perjalanan */}
        <h2 className="mb-4 text-lg font-semibold">
          Trip Information
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <form.AppField name="destination">
            {(field) => (
              <field.TextField
                label="Destination"
                placeholder="Enter destination"
              />
            )}
          </form.AppField>

          <form.AppField name="startDate">
            {(field) => (
              <field.DatePicker label="Start Date" />
            )}
          </form.AppField>

          <form.AppField name="endDate">
            {(field) => (
              <field.DatePicker label="End Date" />
            )}
          </form.AppField>
        </div>

        <form.AppField name="description">
          {(field) => (
            <field.TextArea
              label="Description"
              rows={5}
            />
          )}
        </form.AppField>

        <form.AppField name="file">
          {(field) => (
            <field.FileInput label="Proposal File" />
          )}
        </form.AppField>

        {/* Daftar peserta */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Participants
            </h2>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddParticipant}
            >
              Add Participant
            </Button>
          </div>

          <div className="space-y-4">
            {participants.map((participant, index) => {
              const availableEmployees = employees.filter(
                (employee) =>
                  !participants.some(
                    (other, otherIndex) =>
                      otherIndex !== index &&
                      other.employeeId === employee.id,
                  ),
              )

              return (
                <div
                  key={index}
                  className="grid grid-cols-1 items-end gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_1fr_auto]"
                >
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Employee
                    </label>

                    {participant.isPic ? (
                      <div className="rounded-md border border-border bg-muted p-2 text-sm">
                        {currentEmployee.fullName} (PIC)
                      </div>
                    ) : (
                      <select
                        className="h-10 w-full rounded-md border border-border bg-input px-3 text-sm"
                        value={participant.employeeId}
                        onChange={(event) =>
                          handleEmployeeChange(index, event.target.value)
                        }
                      >
                        <option value="">Select employee</option>

                        {availableEmployees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.fullName} ({employee.number})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Amount
                    </label>

                    <input
                      type="number"
                      min="0"
                      className="h-10 w-full rounded-md border border-border bg-input px-3 text-sm"
                      value={participant.amount || ''}
                      placeholder="Enter amount"
                      onChange={(event) =>
                        handleAmountChange(
                          index,
                          event.target.value === ''
                            ? 0
                            : Number(event.target.value),
                        )
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {participant.isPic ? (
                      <span className="rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                        PIC
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleRemoveParticipant(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total nominal */}
          <div className="mt-6 flex justify-between rounded-lg bg-muted p-4">
            <span className="font-semibold">Total Amount</span>

            <span className="font-bold">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(totalAmount)}
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-8">
          <form.AppForm>
            <form.FormButton label="Submit Proposal" />
          </form.AppForm>
        </div>
      </form>
    </main>
  )
}

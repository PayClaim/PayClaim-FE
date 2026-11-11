import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { CircleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from 'cn'

import { Button } from '#/components/ui/button'
import { createTripProposalForm } from '#/features/trip-proposals/forms/forms'
import { useGetAllEmployeeQuery } from '#/features/employees/queries/queries'
import { useAuth } from '#/hooks/auth.hook'

import type { EmployeeResponse } from '#/types/employee.type'
import type { TripProposalParticipantInput } from '#/types/tripProposals.type'

export const Route = createFileRoute('/_app/trip-proposals/create')({
  beforeLoad: ({ context }) => {
    if (context.isAdmin || context.isDirector) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
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

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const [accommodationAmountInput, setAccommodationAmountInput] =
    useState('')

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
  const updateParticipants = (
    newParticipants: TripProposalParticipantInput[],
  ) => {
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

  // Menghapus peserta tambahan.
  const handleRemoveParticipant = (index: number) => {
    const updatedParticipants = participants.filter((_, i) => i !== index)

    updateParticipants(updatedParticipants)
  }

  // Mengubah biaya akomodasi.
  const handleAccommodationAmountChange = (value: string) => {
    setAccommodationAmountInput(value)

    form.setFieldValue(
      'accommodationAmount',
      value === '' ? 0 : Number(value),
    )
  }

  // Validasi tampilan setelah pengguna mencoba submit.
  const isAccommodationAmountInvalid =
    hasAttemptedSubmit &&
    (!accommodationAmountInput ||
      !Number.isFinite(Number(accommodationAmountInput)) ||
      Number(accommodationAmountInput) <= 0)

  const isParticipantCountInvalid =
    hasAttemptedSubmit && participants.length < 1

  const hasEmptyParticipant =
    participants.some((participant) => !participant.employeeId)

  const isParticipantsInvalid =
    hasAttemptedSubmit &&
    (isParticipantCountInvalid || hasEmptyParticipant)

  // Validasi sebelum form benar-benar dikirim.
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    event.stopPropagation()

    setHasAttemptedSubmit(true)

    // Jalankan validasi schema dan field terlebih dahulu.
    await form.validateAllFields('submit')

    const values = form.state.values

    if (
      !values.accommodationAmount ||
      values.accommodationAmount <= 0
    ) {
      toast.error('Accommodation amount must be greater than 0.')
      return
    }

    if (participants.length < 1) {
        toast.error('At least one participant is required.')
        return
      }

    if (hasEmptyParticipant) {
      toast.error('Please select an employee for every participant.')
      return
    }

    if (!form.state.isValid) {
      toast.error('Please check the highlighted fields.')
      return
    }

    await form.handleSubmit()
  }

  return (
    <main className="mx-auto max-w-200 rounded-2xl border border-border bg-card p-6">
      <h1 className="mb-8 text-center text-3xl font-bold">
        New Trip Proposal
      </h1>

      <form onSubmit={handleSubmit}>
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

        {/* Accommodation Amount */}
          <div className="mt-5">
            <label
              htmlFor="accommodationAmount"
              className={cn(
                'mb-2 block text-sm font-semibold transition-colors',
                isAccommodationAmountInvalid
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-(--sea-ink)',
              )}
            >
              Accommodation Amount (Hotel, Ticket)
            </label>

            <input
              id="accommodationAmount"
              type="number"
              min="0.01"
              step="0.01"
              aria-invalid={isAccommodationAmountInvalid}
              className={cn(
                'h-10 w-full rounded-md border border-border bg-input px-3 text-sm transition-all',
                isAccommodationAmountInvalid &&
                  'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:bg-rose-950/20',
              )}
              value={accommodationAmountInput}
              placeholder="Enter accommodation amount"
              onChange={(event) =>
                handleAccommodationAmountChange(event.target.value)
              }
            />

            {isAccommodationAmountInvalid && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                <span>Accommodation amount must be greater than 0</span>
              </p>
            )}

            <p className="mt-2 text-xs text-muted-foreground">
              Total biaya akomodasi dan perjalanan untuk seluruh proposal,
              seperti hotel dan tiket. Bukan limit reimbursement per peserta.
            </p>
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
            <field.FileInput label="Proposal Letter (Required)" />
          )}
        </form.AppField>

        {/* Participants */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2
                className={cn(
                  'text-lg font-semibold',
                  isParticipantsInvalid &&
                    'text-rose-600 dark:text-rose-400',
                )}
              >
                Participants
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                At least one employee is required. The PIC can be the only participant.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddParticipant}
            >
              Add Participant
            </Button>
          </div>

          <div
            className={cn(
              'space-y-4 rounded-lg',
              isParticipantsInvalid &&
                'border border-rose-500 bg-rose-50/20 p-3 dark:bg-rose-950/20',
            )}
          >
            {participants.map((participant, index) => {
              const availableEmployees = employees.filter(
                (employee) =>
                  !participants.some(
                    (other, otherIndex) =>
                      otherIndex !== index &&
                      other.employeeId === employee.id,
                  ),
              )

              const isEmployeeInvalid =
                hasAttemptedSubmit &&
                !participant.isPic &&
                !participant.employeeId

              return (
                <div
                  key={index}
                  className="grid grid-cols-1 items-end gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <label
                      className={cn(
                        'mb-2 block text-sm font-semibold transition-colors',
                        isEmployeeInvalid
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-(--sea-ink)',
                      )}
                    >
                      Employee
                    </label>

                    {participant.isPic ? (
                      <div className="rounded-md border border-border bg-muted p-2 text-sm">
                        {currentEmployee.fullName} (PIC)
                      </div>
                    ) : (
                      <>
                        <select
                          aria-invalid={isEmployeeInvalid}
                          className={cn(
                            'h-10 w-full rounded-md border border-border bg-input px-3 text-sm transition-all',
                            isEmployeeInvalid &&
                              'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:bg-rose-950/20',
                          )}
                          value={participant.employeeId}
                          onChange={(event) =>
                            handleEmployeeChange(index, event.target.value)
                          }
                        >
                          <option value="">Select employee</option>

                          {availableEmployees.map((employee) => (
                            <option
                              key={employee.id}
                              value={employee.id}
                            >
                              {employee.fullName} ({employee.number})
                            </option>
                          ))}
                        </select>

                        {isEmployeeInvalid && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                            <CircleAlert className="h-3.5 w-3.5 shrink-0" />
                            <span>Please select an employee.</span>
                          </p>
                        )}
                      </>
                    )}
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

          {isParticipantCountInvalid && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
              <CircleAlert className="h-3.5 w-3.5 shrink-0" />
              <span>
                  At least one participant is required.
              </span>
            </p>
          )}
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
import { Button } from '#/components/ui/button'
import { cn } from 'cn'
import { CircleAlert } from 'lucide-react'

import { buildEmployeeGroups } from '#/features/employees/utils/employee-options'

import type { EmployeeResponse } from '#/types/employee.type'
import type { TripProposalParticipantInput } from '#/types/tripProposals.type'
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from '#/components/ui/combobox'

type Props = {
  currentEmployee: EmployeeResponse
  employees: EmployeeResponse[]
  participants: TripProposalParticipantInput[]
  hasAttemptedSubmit: boolean
  onChange: (participants: TripProposalParticipantInput[]) => void
}

export function TripProposalParticipants({
  currentEmployee,
  employees,
  participants,
  hasAttemptedSubmit,
  onChange,
}: Props) {
  const isParticipantCountInvalid =
    hasAttemptedSubmit && participants.length < 1

  const hasEmptyParticipant = participants.some(
    (participant) => !participant.employeeId,
  )

  const isParticipantsInvalid =
    hasAttemptedSubmit && (isParticipantCountInvalid || hasEmptyParticipant)

  const handleAddParticipant = () => {
    onChange([
      ...participants,
      {
        employeeId: '',
        isPic: false,
        amount: 0,
      },
    ])
  }

  const handleEmployeeChange = (index: number, employeeId: string) => {
    const updatedParticipants = participants.map((participant, i) =>
      i === index ? { ...participant, employeeId } : participant,
    )

    onChange(updatedParticipants)
  }

  const handleRemoveParticipant = (index: number) => {
    const updatedParticipants = participants.filter((_, i) => i !== index)

    onChange(updatedParticipants)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2
            className={cn(
              'text-lg font-semibold',
              isParticipantsInvalid && 'text-rose-600 dark:text-rose-400',
            )}
          >
            Participants
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            At least one employee is required. The PIC can be the only
            participant.
          </p>
        </div>

        <Button type="button" variant="outline" onClick={handleAddParticipant}>
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
          // Filter employee yang sudah ada di participants
          const availableEmployees = employees.filter(
            (employee) =>
              !participants.some(
                (other, otherIndex) =>
                  otherIndex !== index && other.employeeId === employee.id,
              ),
          )

          const isEmployeeInvalid =
            hasAttemptedSubmit && !participant.isPic && !participant.employeeId

          const employeeGroups = buildEmployeeGroups(availableEmployees)

          // Dipasang pada combobox sebagai selected value
          const allItems = employeeGroups.flatMap((g) => g.items)
          const selectedItem =
            allItems.find((i) => i.value === participant.employeeId) ?? null

          return (
            <div
              key={`${participant.employeeId || 'new'}-${index}`}
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
                    <Combobox
                      onValueChange={(selected) => {
                        console.log('selected:', selected)
                        handleEmployeeChange(index, selected?.value ?? '')
                      }}
                      value={selectedItem}
                      items={employeeGroups}
                      itemToStringLabel={(item: any) => item.label}
                      itemToStringValue={(item: any) => item.value}
                    >
                      <ComboboxInput
                        placeholder="Select a participant"
                        aria-invalid={isEmployeeInvalid}
                        className={cn(
                          'h-10 w-full rounded-md border border-border bg-input text-sm transition-all',
                          isEmployeeInvalid &&
                            'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:bg-rose-950/20',
                        )}
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>No employee found.</ComboboxEmpty>
                        <ComboboxList>
                          {(group, idx) => (
                            <ComboboxGroup
                              key={group.groupLabel}
                              items={group.items}
                            >
                              <ComboboxLabel>{group.groupLabel}</ComboboxLabel>
                              <ComboboxCollection>
                                {(item) => (
                                  <ComboboxItem key={item.value} value={item}>
                                    {item.label}
                                  </ComboboxItem>
                                )}
                              </ComboboxCollection>
                              {idx < employeeGroups.length - 1 && (
                                <ComboboxSeparator />
                              )}
                            </ComboboxGroup>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>

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
          <span>At least one participant is required.</span>
        </p>
      )}
    </div>
  )
}

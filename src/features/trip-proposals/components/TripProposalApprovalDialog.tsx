import { AlertCircle, Users } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'

import {
  formatNumericInput,
  MAX_TRIP_AMOUNT,
} from '#/features/trip-proposals/utils/tripProposalDetailUtils'

import type { ApprovalAction } from '#/types/tripProposals.type'

type TripParticipant = {
  employeeId: string
  employeeName?: string | null
  employeeNumber?: string | null
  isPic: boolean
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionType: ApprovalAction | null
  isFinanceApprovalStage: boolean
  destination: string
  currentAccommodationAmount: number
  isMutationPending: boolean

  notes: string
  onNotesChange: (notes: string) => void
  onAction: () => void | Promise<void>

  formatCurrency: (amount: number) => string

  accommodationAmountInput: string
  onAccommodationAmountChange: (amount: string) => void
  onAccommodationAmountFocus: () => void
  onAccommodationAmountBlur: () => void
  isChangingAccommodationBudget: boolean
  approvedAccommodationAmount: number
  onSaveAccommodationBudget: () => void
  onChangeAccommodationBudget: () => void
  onResetAccommodationBudget: () => void
  showAccommodationAmountError: boolean
  isAccommodationAmountLimitExceeded: boolean

  participants: TripParticipant[]
  participantAmounts: Record<string, string>
  onParticipantAmountChange: (
    employeeId: string,
    amount: string,
  ) => void
  onParticipantAmountFocus: (employeeId: string) => void
  onParticipantAmountBlur: (employeeId: string) => void
  touchedParticipantAmounts: Record<string, boolean>
  participantAmountLimitWarnings: Record<string, boolean>
  hasAttemptedFinanceApproval: boolean
  hasValidParticipantAmounts: boolean
  isSameAmountApplied: boolean
  onApplySameAmount: () => void

  hasValidAccommodationDraft: boolean
  hasValidAccommodationAmount: boolean
  projectedTotalAmount: number
  exceedsFinanceLimit: boolean
  financeLimit: number
}

export function TripProposalApprovalDialog({open, onOpenChange, actionType, isFinanceApprovalStage, destination, 
  currentAccommodationAmount, isMutationPending, notes, onNotesChange, onAction, formatCurrency, accommodationAmountInput, onAccommodationAmountChange,
  onAccommodationAmountFocus, onAccommodationAmountBlur, isChangingAccommodationBudget, approvedAccommodationAmount,onSaveAccommodationBudget,
  onChangeAccommodationBudget, onResetAccommodationBudget, showAccommodationAmountError, isAccommodationAmountLimitExceeded,
  participants, participantAmounts, onParticipantAmountChange, onParticipantAmountFocus,onParticipantAmountBlur,touchedParticipantAmounts,
  participantAmountLimitWarnings,hasAttemptedFinanceApproval, hasValidParticipantAmounts, isSameAmountApplied, onApplySameAmount,
  hasValidAccommodationDraft, hasValidAccommodationAmount, projectedTotalAmount,exceedsFinanceLimit, financeLimit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          actionType === 'Approved' && isFinanceApprovalStage
            ? 'flex h-[90dvh] max-h-[90dvh] min-h-0 flex-col overflow-hidden sm:max-w-2xl'
            : 'flex max-h-[90dvh] flex-col overflow-hidden sm:max-w-md'
        }
      >
        {/* Fixed Header */}
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {actionType === 'Approved'
              ? isFinanceApprovalStage
                ? 'Approve Trip Proposal & Set Limits'
                : 'Approve Trip Proposal'
              : actionType === 'NeedsRevision'
                ? 'Request Trip Proposal Revision'
                : 'Reject Trip Proposal'}
          </DialogTitle>

          <DialogDescription>
            {actionType === 'Approved'
              ? isFinanceApprovalStage
                ? ''
                : `Confirm approval for proposal "${destination}" (Accommodation Budget: ${formatCurrency(Number(currentAccommodationAmount || 0))}).`
              : actionType === 'NeedsRevision'
                ? 'Return this proposal to the employee with revision instructions.'
                : 'Confirm that you want to reject this trip proposal.'}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2">
          {actionType === 'Approved' && isFinanceApprovalStage && (
            <div className="space-y-5 py-2">
              {/* Accommodation Budget */}
              <div className="space-y-3 rounded-lg border border-border p-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-heading">
                    Accommodation Budget
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Total budget for accommodation, tickets, and other
                    trip arrangements.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  {isChangingAccommodationBudget ? (
                    <div className="min-w-0 flex-1">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                          Rp
                        </span>

                        <input
                          id="accommodation-budget"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={formatNumericInput(
                            accommodationAmountInput,
                          )}
                          placeholder="0"
                          onChange={(event) =>
                            onAccommodationAmountChange(
                              event.target.value,
                            )
                          }
                          onFocus={onAccommodationAmountFocus}
                          onBlur={onAccommodationAmountBlur}
                          className={`h-10 w-full rounded-md border bg-input pl-10 pr-3 text-sm ${
                            showAccommodationAmountError
                              ? 'border-destructive'
                              : 'border-border'
                          }`}
                        />
                      </div>

                      {showAccommodationAmountError && (
                        <p className="mt-1 text-xs text-destructive">
                          {isAccommodationAmountLimitExceeded
                            ? 'Maximum Accommodation Budget is Rp 100.000.000.'
                            : 'Accommodation Budget must be greater than zero.'}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="min-w-0 text-xl font-bold text-heading">
                      {formatCurrency(approvedAccommodationAmount)}
                    </p>
                  )}

                  {isChangingAccommodationBudget ? (
                    <Button
                      type="button"
                      size="sm"
                      className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={onSaveAccommodationBudget}
                    >
                      Save
                    </Button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 border-primary/40 text-primary hover:bg-primary/10"
                        onClick={onChangeAccommodationBudget}
                      >
                        Change Budget
                      </Button>

                      {approvedAccommodationAmount !==
                        currentAccommodationAmount && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={onResetAccommodationBudget}
                        >
                          Reset Budget
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {!isChangingAccommodationBudget &&
                  approvedAccommodationAmount !==
                    currentAccommodationAmount && (
                    <p className="text-xs text-muted-foreground">
                      Budget updated for this approval. You can reset it
                      to the original amount at any time.
                    </p>
                  )}

                {!isChangingAccommodationBudget &&
                  showAccommodationAmountError && (
                    <p className="text-xs text-destructive">
                      Accommodation Budget must be greater than zero and
                      cannot exceed Rp 100.000.000. Click Change Budget
                      to enter a valid amount.
                    </p>
                  )}

                {isChangingAccommodationBudget && (
                  <p className="text-xs text-muted-foreground">
                    Enter the new budget and click Save to apply it to
                    this approval.
                  </p>
                )}
              </div>

              {/* Reimbursement Limit per Employee */}
              <div className="min-w-0 space-y-3">
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-heading">
                      Reimbursement Limit per Employee
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Set the total reimbursement limit for each
                      participant for the entire trip.
                    </p>
                  </div>

                  <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Users className="h-5 w-5" />
                    {participants.length} Participants
                  </span>
                </div>

                {participants.map((participant, index) => {
                  const amount =
                    participantAmounts[participant.employeeId] ?? '0'

                  const numericAmount = Number(amount)

                  const isInvalid =
                    amount.trim() === '' ||
                    !Number.isFinite(numericAmount) ||
                    numericAmount <= 0

                  const showAmountLimitWarning =
                    numericAmount > MAX_TRIP_AMOUNT ||
                    Boolean(
                      participantAmountLimitWarnings[
                        participant.employeeId
                      ],
                    )

                  const showAmountError =
                    showAmountLimitWarning ||
                    (
                      (
                        touchedParticipantAmounts[
                          participant.employeeId
                        ] ||
                        hasAttemptedFinanceApproval
                      ) &&
                      isInvalid
                    )

                  const amountErrorMessage =
                    showAmountLimitWarning
                      ? 'Maximum reimbursement limit is Rp 100.000.000.'
                      : 'Amount must be greater than zero.'

                  return (
                    <div
                      key={participant.employeeId}
                      className="grid min-w-0 grid-cols-1 gap-3 rounded-lg border border-border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,300px)] sm:items-center"
                    >
                      {/* Participant Information */}
                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold">
                          {participant.employeeName ||
                            participant.employeeNumber ||
                            participant.employeeId}
                        </p>

                        {participant.employeeNumber && (
                          <p className="text-xs text-muted-foreground">
                            {participant.employeeNumber}
                          </p>
                        )}

                        {participant.isPic && (
                          <span className="mt-1 inline-block rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            PIC
                          </span>
                        )}
                      </div>

                      {/* Participant Amount Input */}
                      <div className="min-w-0">
                        <Label
                          htmlFor={`amount-${participant.employeeId}`}
                          className="sr-only"
                        >
                          Reimbursement limit for{' '}
                          {participant.employeeName || 'participant'}
                        </Label>

                        {index === 0 ? (
                          <div className="flex min-w-0 items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                  Rp
                                </span>

                                <input
                                  id={`amount-${participant.employeeId}`}
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={formatNumericInput(amount)}
                                  placeholder="0"
                                  onChange={(event) =>
                                    onParticipantAmountChange(
                                      participant.employeeId,
                                      event.target.value,
                                    )
                                  }
                                  onFocus={() =>
                                    onParticipantAmountFocus(
                                      participant.employeeId,
                                    )
                                  }
                                  onBlur={() =>
                                    onParticipantAmountBlur(
                                      participant.employeeId,
                                    )
                                  }
                                  className={`h-10 w-full rounded-md border bg-input pl-10 pr-3 text-sm ${
                                    showAmountError
                                      ? 'border-destructive'
                                      : 'border-border'
                                  }`}
                                />
                              </div>

                              {showAmountError && (
                                <p className="mt-1 text-xs text-destructive">
                                  {amountErrorMessage}
                                </p>
                              )}
                            </div>

                            {participants.length > 1 &&
                              !isInvalid &&
                              !showAmountLimitWarning &&
                              !isSameAmountApplied && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="mt-0.5 h-10 shrink-0 border-primary/30 px-3 text-xs font-semibold text-primary hover:bg-primary/10"
                                  onClick={onApplySameAmount}
                                >
                                  Apply to all
                                </Button>
                              )}
                          </div>
                        ) : (
                          <>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                Rp
                              </span>

                              <input
                                id={`amount-${participant.employeeId}`}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={formatNumericInput(amount)}
                                placeholder="0"
                                onChange={(event) =>
                                  onParticipantAmountChange(
                                    participant.employeeId,
                                    event.target.value,
                                  )
                                }
                                onFocus={() =>
                                  onParticipantAmountFocus(
                                    participant.employeeId,
                                  )
                                }
                                onBlur={() =>
                                  onParticipantAmountBlur(
                                    participant.employeeId,
                                  )
                                }
                                className={`h-10 w-full rounded-md border bg-input pl-10 pr-3 text-sm ${
                                  showAmountError
                                    ? 'border-destructive'
                                    : 'border-border'
                                }`}
                              />
                            </div>

                            {showAmountError && (
                              <p className="mt-1 text-xs text-destructive">
                                {amountErrorMessage}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Total Proposal Budget */}
              <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 p-4">
                <p className="min-w-0 text-base font-semibold text-heading">
                  Total Proposal Budget
                </p>

                <p className="shrink-0 text-lg font-bold text-heading">
                  {(
                    isChangingAccommodationBudget
                      ? hasValidAccommodationDraft
                      : hasValidAccommodationAmount
                  )
                    ? formatCurrency(projectedTotalAmount)
                    : '-'}
                </p>
              </div>

              {/* Finance Approval Limit Warning */}
              {exceedsFinanceLimit && (
                <div className="flex min-w-0 gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold">
                      Finance Approval Limit Exceeded
                    </p>

                    <p className="text-xs leading-relaxed">
                      The projected proposal total is{' '}
                      <strong>
                        {formatCurrency(projectedTotalAmount)}
                      </strong>
                      , exceeding the Finance approval limit of{' '}
                      <strong>{formatCurrency(financeLimit)}</strong>.
                      This proposal will be automatically forwarded to
                      the Finance Manager when you confirm.
                    </p>
                  </div>
                </div>
              )}

              {/* Participant Validation Warning */}
              {hasAttemptedFinanceApproval &&
                !hasValidParticipantAmounts && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Please enter a valid reimbursement limit greater
                    than zero and not exceeding Rp 100.000.000 for every
                    participant before approving.
                  </p>
                )}
            </div>
          )}

          {/* Approval Notes */}
          <div className="space-y-2 py-2">
            <Label htmlFor="trip-approval-notes">
              {actionType === 'Rejected' ||
              actionType === 'NeedsRevision'
                ? 'Reason / Instructions (Required)'
                : 'Approval Notes (Optional)'}
            </Label>

            <Textarea
              id="trip-approval-notes"
              placeholder={
                actionType === 'Rejected'
                  ? 'Write the reason for rejecting this proposal...'
                  : actionType === 'NeedsRevision'
                    ? 'Describe what needs to be corrected...'
                    : 'Add optional approval notes...'
              }
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              maxLength={500}
              rows={4}
            />

            <p className="text-right text-xs text-muted-foreground">
              {notes.length}/500 characters
            </p>
          </div>
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="shrink-0 gap-2 border-t border-border pt-4 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>

          <Button
            type="button"
            disabled={
              isMutationPending ||
              (
                (actionType === 'Rejected' ||
                  actionType === 'NeedsRevision') &&
                !notes.trim()
              )
            }
            className={
              actionType === 'Rejected'
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : actionType === 'NeedsRevision'
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }
            onClick={onAction}
          >
            {isMutationPending
              ? 'Processing...'
              : actionType === 'Approved'
                ? 'Confirm Approval'
                : actionType === 'NeedsRevision'
                  ? 'Request Revision'
                  : 'Confirm Rejection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
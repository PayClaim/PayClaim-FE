import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Users,
  XCircle,
} from 'lucide-react'

import { getCurrentUser } from '#/features/auth/queries/queries'

import {
  useApproveTripProposalMutation,
  useGetProposalByIdQuery,
  useRejectTripProposalMutation,
} from '#/features/trip-proposals/queries/queries'

function normalizeStatus(status: string) {
  return status.replace(/[\s_-]/g, '').toLowerCase()
}

function getStatusLabel(status: string) {
  const normalizedStatus = normalizeStatus(status)

  switch (normalizedStatus) {
    case 'underreview':
      return 'Under Review'
    case 'financemanagerreview':
      return 'Finance Manager Review'
    case 'needsrevision':
      return 'Needs Revision'
    default:
      return status
  }
}

function getStatusStyle(status: string) {
  const normalizedStatus = normalizeStatus(status)

  switch (normalizedStatus) {
    case 'submitted':
    case 'underreview':
    case 'financemanagerreview':
      return 'bg-amber-100 text-amber-700'

    case 'approved':
    case 'completed':
      return 'bg-green-100 text-green-700'

    case 'needsrevision':
      return 'bg-orange-100 text-orange-700'

    case 'rejected':
    case 'cancelled':
      return 'bg-red-100 text-red-700'

    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

type TripProposalApprovalWorkspaceProps = {
  proposalId: string
}

export function TripProposalApprovalWorkspace({
  proposalId,
}: TripProposalApprovalWorkspaceProps) {
  const navigate = useNavigate()

  const { data: proposal, isLoading, isError, error } =
    useGetProposalByIdQuery(proposalId)

const { data: currentUser } = useQuery(getCurrentUser())

  const approveMutation = useApproveTripProposalMutation(proposalId)
  const rejectMutation = useRejectTripProposalMutation(proposalId)

  const [notes, setNotes] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const userRoles = (currentUser?.roles ?? []).map((role: string) =>
    normalizeStatus(role),
  )

  const isAdmin = userRoles.includes('admin')
  const isManager = userRoles.includes('manager')
  const isFinance = userRoles.includes('finance')
  const isFinanceManager = userRoles.includes('financemanager')

  const status = proposal ? normalizeStatus(proposal.status) : ''

  const isPendingStatus = [
    'submitted',
    'underreview',
    'financemanagerreview',
  ].includes(status)

  const canTakeAction =
    (isAdmin && isPendingStatus) ||
    (isManager && status === 'submitted') ||
    (isFinance && status === 'underreview') ||
    (isFinanceManager && status === 'financemanagerreview')

  const isMutationPending =
    approveMutation.isPending || rejectMutation.isPending

  const handleApprove = async () => {
    setActionError(null)

    try {
      await approveMutation.mutateAsync({
        decision: 'Approved',
        notes: notes.trim() || undefined,
      })

      setNotes('')
    } catch (error) {
      setActionError(getErrorMessage(error))
    }
  }

  const handleReject = async () => {
    setActionError(null)

    try {
      await rejectMutation.mutateAsync({
        decision: 'Rejected',
        notes: notes.trim() || undefined,
      })

      setNotes('')
    } catch (error) {
      setActionError(getErrorMessage(error))
    }
  }

  const handleRequestRevision = async () => {
    setActionError(null)

    try {
      await rejectMutation.mutateAsync({
        decision: 'NeedsRevision',
        notes: notes.trim() || undefined,
      })

      setNotes('')
    } catch (error) {
      setActionError(getErrorMessage(error))
    }
  }

  if (isLoading) {
    return (
      <div className="p-10 text-center text-sm text-gray-500">
        Loading trip proposal...
      </div>
    )
  }

  if (isError || !proposal) {
    return (
      <div className="space-y-4 p-6">
        <button
          type="button"
          onClick={() =>
            navigate({ to: '/approvals/trip-proposals' })
          }
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Approval Trip Proposals
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {getErrorMessage(error)}
        </div>
      </div>
    )
  }

  const pic = proposal.participants.find(
    (participant) => participant.isPic,
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <button
        type="button"
        onClick={() =>
          navigate({ to: '/approvals/trip-proposals' })
        }
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to Approval Trip Proposals
      </button>

      {/* Proposal Header */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm text-gray-500">
              Proposal #{proposal.id.slice(0, 8).toUpperCase()}
            </p>

            <h1 className="mt-2 text-2xl font-semibold text-gray-900">
              Business Trip to {proposal.destination}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Submitted {formatDateTime(proposal.submittedAt)}
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-medium ${getStatusStyle(
              proposal.status,
            )}`}
          >
            {getStatusLabel(proposal.status)}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 border-t pt-5 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays size={16} />
              Start Date
            </div>
            <p className="mt-2 font-medium text-gray-900">
              {formatDate(proposal.startDate)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CalendarDays size={16} />
              End Date
            </div>
            <p className="mt-2 font-medium text-gray-900">
              {formatDate(proposal.endDate)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={16} />
              Total Estimated Amount
            </div>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              {formatCurrency(proposal.totalAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Trip Information */}
          <section className="rounded-xl border bg-white p-6">
            <h2 className="font-semibold text-gray-900">
              Trip Information
            </h2>

            <div className="mt-4">
              <p className="text-sm text-gray-500">Description</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {proposal.description || '-'}
              </p>
            </div>
          </section>

          {/* Participants */}
          <section className="overflow-hidden rounded-xl border bg-white">
            <div className="flex items-center gap-2 border-b px-6 py-5">
              <Users size={18} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">
                Participants ({proposal.participants.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Employee</th>
                    <th className="px-6 py-3 font-medium">Employee Number</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 text-right font-medium">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {proposal.participants.map((participant) => (
                    <tr
                      key={participant.employeeId}
                      className="border-t"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {participant.employeeName || '-'}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {participant.employeeNumber || '-'}
                      </td>

                      <td className="px-6 py-4">
                        {participant.isPic ? (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            PIC
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Participant
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right text-sm text-gray-700">
                        {formatCurrency(participant.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pic && (
              <div className="border-t bg-gray-50 px-6 py-3 text-sm text-gray-600">
                PIC: <span className="font-medium">{pic.employeeName}</span>
              </div>
            )}
          </section>

          {/* Approval History */}
          <section className="rounded-xl border bg-white p-6">
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900">
                Approval History
              </h2>
            </div>

            {proposal.approvalHistory.length === 0 ? (
              <p className="mt-5 text-sm text-gray-500">
                No approval history available.
              </p>
            ) : (
              <div className="mt-5 space-y-5">
                {[...proposal.approvalHistory]
                  .sort((a, b) => a.approvalLevel - b.approvalLevel)
                  .map((history) => (
                    <div
                      key={history.id}
                      className="flex gap-3"
                    >
                      <div className="mt-1">
                        {history.decision === 'Approved' ? (
                          <CheckCircle2
                            size={20}
                            className="text-green-600"
                          />
                        ) : (
                          <XCircle
                            size={20}
                            className="text-red-500"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium text-gray-900">
                            {history.approverName}
                          </p>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              history.decision === 'Approved'
                                ? 'bg-green-100 text-green-700'
                                : history.decision === 'NeedsRevision'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {history.decision === 'NeedsRevision'
                              ? 'Needs Revision'
                              : history.decision}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          Approval Level {history.approvalLevel}
                          {' · '}
                          {formatDateTime(history.decidedAt)}
                        </p>

                        {history.notes && (
                          <p className="mt-2 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                            {history.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Content */}
        <div className="space-y-6">
          {/* Approval Action */}
          <section className="rounded-xl border bg-white p-6">
            <h2 className="font-semibold text-gray-900">
              Approval Action
            </h2>

            {canTakeAction ? (
              <>
                <p className="mt-2 text-sm text-gray-500">
                  Review the proposal before making your decision.
                </p>

                <div className="mt-5 space-y-2">
                  <label
                    htmlFor="approval-notes"
                    className="text-sm font-medium text-gray-700"
                  >
                    Notes
                  </label>

                  <textarea
                    id="approval-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Write your comments here..."
                    className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="text-right text-xs text-gray-400">
                    {notes.length}/500 characters
                  </p>
                </div>

                {actionError && (
                  <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {actionError}
                  </div>
                )}

                <div className="mt-5 space-y-2">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isMutationPending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 size={17} />
                    {approveMutation.isPending
                      ? 'Approving...'
                      : 'Approve Proposal'}
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestRevision}
                    disabled={isMutationPending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-orange-300 bg-white px-4 py-3 text-sm font-medium text-orange-700 transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FileText size={17} />
                    Request Revision
                  </button>

                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isMutationPending}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <XCircle size={17} />
                    Reject Proposal
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-800">
                  No action available
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {isPendingStatus
                    ? 'This proposal is waiting for the next authorized approval role.'
                    : 'This proposal is no longer waiting for approval.'}
                </p>
              </div>
            )}
          </section>

          {/* Attachment */}
          <section className="rounded-xl border bg-white p-6">
            <h2 className="font-semibold text-gray-900">
              Proposal Attachment
            </h2>

            <div className="mt-4 flex items-center gap-3 rounded-lg border bg-gray-50 p-4">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                <FileText size={22} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  Proposal Document
                </p>

                <p className="mt-1 truncate text-xs text-gray-500">
                  {proposal.filePath || 'No attachment'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'

import type { TripProposal } from '#/types/tripProposals.type'

import {
  getSubmittedAtTime,
  normalizeTripProposalStatus,
} from '#/features/trip-proposals/utils/tripProposalUtils'

// =====================================================
// TYPES
// =====================================================

export type ProposalTab =
  | 'ALL'
  | 'WAITING'
  | 'APPROVED'
  | 'COMPLETED'
  | 'REVISION_OR_REJECTED'

export type TripProposalMetrics = {
  totalCount: number
  totalAmount: number
  waitingCount: number
  waitingAmount: number
  approvedCompletedCount: number
  approvedCompletedAmount: number
}

// =====================================================
// STATUS CONSTANTS
// =====================================================

const WAITING_STATUSES = [
  'submitted',
  'underreview',
  'financemanagerreview',
  'pending',
]

const REVISION_OR_REJECTED_STATUSES = [
  'needsrevision',
  'rejected',
  'cancelled',
]

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getProposalPriority(status: string): number {
  const normalized = normalizeTripProposalStatus(status)

  if (normalized === 'needsrevision') {
    return 0
  }

  if (WAITING_STATUSES.includes(normalized)) {
    return 1
  }

  if (normalized === 'approved') {
    return 2
  }

  if (normalized === 'completed') {
    return 3
  }

  if (['rejected', 'cancelled'].includes(normalized)) {
    return 4
  }

  return 5
}

// =====================================================
// CUSTOM HOOK
// =====================================================

export function useMyTripProposals(proposals: TripProposal[]) {
  // =====================================================
  // SEARCH & TAB STATES
  // =====================================================

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<ProposalTab>('ALL')

  // =====================================================
  // KPI CALCULATIONS
  // =====================================================

  const metrics = useMemo<TripProposalMetrics>(() => {
    const totalAmount = proposals.reduce(
      (sum, proposal) =>
        sum + (proposal.totalAmount || 0),
      0,
    )

    const waitingProposals = proposals.filter((proposal) =>
      WAITING_STATUSES.includes(
        normalizeTripProposalStatus(proposal.status),
      ),
    )

    const waitingAmount = waitingProposals.reduce(
      (sum, proposal) =>
        sum + (proposal.totalAmount || 0),
      0,
    )

    const approvedCompletedProposals = proposals.filter((proposal) =>
      ['approved', 'completed'].includes(
        normalizeTripProposalStatus(proposal.status),
      ),
    )

    const approvedCompletedAmount =
      approvedCompletedProposals.reduce(
        (sum, proposal) =>
          sum + (proposal.totalAmount || 0),
        0,
      )

    return {
      totalCount: proposals.length,
      totalAmount,
      waitingCount: waitingProposals.length,
      waitingAmount,
      approvedCompletedCount: approvedCompletedProposals.length,
      approvedCompletedAmount,
    }
  }, [proposals])

  // =====================================================
  // FILTER PROPOSALS
  // =====================================================

  const filteredProposals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return proposals.filter((proposal) => {
      const status = normalizeTripProposalStatus(proposal.status)

      // Filter berdasarkan tab.
      if (activeTab === 'WAITING') {
        if (!WAITING_STATUSES.includes(status)) {
          return false
        }
      }

      if (activeTab === 'APPROVED') {
        if (status !== 'approved') {
          return false
        }
      }

      if (activeTab === 'COMPLETED') {
        if (status !== 'completed') {
          return false
        }
      }

      if (activeTab === 'REVISION_OR_REJECTED') {
        if (!REVISION_OR_REJECTED_STATUSES.includes(status)) {
          return false
        }
      }

      // Filter berdasarkan destination, PIC, atau proposal ID.
      if (query) {
        const destination = (proposal.destination || '').toLowerCase()
        const picName = (proposal.picName || '').toLowerCase()
        const proposalId = (proposal.id || '').toLowerCase()

        const matchesSearch =
          destination.includes(query) ||
          picName.includes(query) ||
          proposalId.includes(query)

        if (!matchesSearch) {
          return false
        }
      }

      return true
    })
  }, [proposals, activeTab, searchQuery])

  // =====================================================
  // SORT PROPOSALS
  // =====================================================

  const sortedProposals = useMemo(() => {
    return [...filteredProposals].sort((a, b) => {
      const priorityDifference =
        getProposalPriority(a.status) -
        getProposalPriority(b.status)

      // Urutkan berdasarkan prioritas status.
      if (priorityDifference !== 0) {
        return priorityDifference
      }

      // Status yang sama diurutkan berdasarkan SubmittedAt terbaru.
      return (
        getSubmittedAtTime(b.submittedAt) -
        getSubmittedAtTime(a.submittedAt)
      )
    })
  }, [filteredProposals])

  // =====================================================
  // RETURN
  // =====================================================

  return {
    searchQuery,
    setSearchQuery,

    activeTab,
    setActiveTab,

    metrics,

    filteredProposals,
    sortedProposals,
  }
}

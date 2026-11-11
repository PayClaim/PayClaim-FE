import type { useGetClaimsQuery } from '#/features/claims/queries/queries'

// Jika kamu sudah punya tipe Claim sendiri, ganti dengan import tipe tersebut.
export type Claim = NonNullable<ReturnType<typeof useGetClaimsQuery>['data']>
export type ApprovalRecord = NonNullable<Claim['approvalHistory']>[number]

export type ActionType = 'Approved' | 'Rejected' | 'NeedsRevision' | 'Pay'

export interface ReceiptInfo {
  hasFile: boolean
  url: string
  fileName: string | null
  isImage: boolean
  isPdf: boolean
}

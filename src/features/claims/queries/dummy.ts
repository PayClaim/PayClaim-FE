
import type { ClaimResponse } from '#/types/claims.type'

export const data: ClaimResponse[] = [
  {
    id: '6e2b8c1a-5d4b-4f9e-bc2a-1a8c3d7e5f01',
    claimType: 'Benefit',
    description:
      'Klaim rawat jalan pemeriksaan gigi tahunan di Klinik Utama Dental Care',
    transactionDate: '2026-10-15T09:30:00Z',
    amount: 750000,
    submittedAt: '2026-10-16T14:22:10Z',
    status: 'Approved',
    employeeId: 'EMP-08912',
    employeeName: 'Budi Santoso',
    benefitName: 'Tunjangan Kesehatan Gigi',
    tripProposalDescription: null,
    filePath: '/uploads/claims/receipt-dental-budi.pdf',
  },
  {
    id: '3f9c8d2b-6e5a-4b7c-ad1a-2b9c4d8e6f02',
    claimType: 'BusinessTripReimbursement',
    description:
      'Reimbursement tiket pesawat dan taksi untuk kunjungan klien ke Surabaya',
    transactionDate: '2026-10-20T06:00:00Z',
    amount: 2450000,
    submittedAt: '2026-10-22T08:11:45Z',
    status: 'Submitted',
    employeeId: 'EMP-04231',
    employeeName: 'Siti Rahmawati',
    benefitName: null,
    tripProposalDescription:
      'Kunjungan Lapangan & Negosiasi Kontrak PT Maju Bersama',
    filePath: '/uploads/claims/flight-ticket-siti.pdf',
  },
  {
    id: '1a8b7c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    claimType: 'Benefit',
    description: 'Klaim penggantian biaya keanggotaan (membership) gym bulanan',
    transactionDate: '2026-10-01T10:00:00Z',
    amount: 450000,
    submittedAt: '2026-10-02T11:05:00Z',
    status: 'Approved',
    employeeId: 'EMP-09114',
    employeeName: 'Rian Hidayat',
    benefitName: 'Program Kebugaran Karyawan',
    tripProposalDescription: null,
    filePath: null,
  },
  {
    id: '9f8e7d6c-5b4a-3c2b-1a0f-9e8d7c6b5a4b',
    claimType: 'OperationalReimbursement',
    description:
      'Pembelian token listrik dan ATK darurat untuk kebutuhan ruang kerja cabang',
    transactionDate: '2026-10-28T16:45:00Z',
    amount: 320000,
    submittedAt: '2026-10-29T09:00:00Z',
    status: 'Rejected',
    employeeId: 'EMP-07552',
    employeeName: 'Dewi Lestari',
    benefitName: null,
    tripProposalDescription: null,
    filePath: '/uploads/claims/receipt-atk-dewi.jpg',
  },
  {
    id: '5d4c3b2a-1e0f-9a8b-7c6d-5e4f3a2b1c0d',
    claimType: 'BusinessTripReimbursement',
    description:
      'Akomodasi hotel selama 3 malam untuk menghadiri Annual Tech Conference',
    transactionDate: '2026-10-10T14:00:00Z',
    amount: 3150000,
    submittedAt: '2026-10-13T17:34:20Z',
    status: 'UnderReview',
    employeeId: 'EMP-02198',
    employeeName: 'Kevin Wijaya',
    benefitName: null,
    tripProposalDescription:
      'Delegasi Konferensi Teknologi Tahunan Internasional',
    filePath: null,
  },
]

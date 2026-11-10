import type { BenefitResponse } from '#/types/benefits.type'

export const data: BenefitResponse[] = [
  {
    id: 'ben-001',
    name: 'Tunjangan Kesehatan',
    description:
      'Asuransi kesehatan untuk karyawan dan keluarga inti, mencakup rawat jalan dan rawat inap.',
    periodType: 'YEARLY',
    categoryId: 1,
    categoryName: 'Kesehatan',
  },
  {
    id: 'ben-002',
    name: 'Tunjangan Transportasi',
    description: 'Penggantian biaya transportasi harian ke kantor.',
    periodType: 'MONTHLY',
    categoryId: 2,
    categoryName: 'Operasional',
  },
  {
    id: 'ben-003',
    name: 'Tunjangan Makan',
    description: 'Uang makan harian untuk setiap hari kerja.',
    periodType: 'DAILY',
    categoryId: 2,
    categoryName: 'Operasional',
  },
  {
    id: 'ben-004',
    name: 'Bonus Kinerja',
    description: 'Bonus berdasarkan pencapaian target kinerja per kuartal.',
    periodType: 'QUARTERLY',
    categoryId: 3,
    categoryName: 'Kompensasi',
  },
  {
    id: 'ben-005',
    name: 'Tunjangan Pendidikan',
    description:
      'Subsidi biaya pelatihan, sertifikasi, atau kursus untuk pengembangan karier.',
    periodType: 'YEARLY',
    categoryId: 4,
    categoryName: 'Pengembangan Diri',
  },
]

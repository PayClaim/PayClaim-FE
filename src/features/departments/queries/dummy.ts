import type { DepartmentResponse } from '#/types/department.type'

export const data: DepartmentResponse[] = [
  {
    id: 'dept-001',
    name: 'Teknologi Informasi',
  },
  {
    id: 'dept-002',
    name: 'Pengembangan Perangkat Lunak',
    parentDeptId: 'dept-001',
    parentDeptName: 'Teknologi Informasi',
  },
  {
    id: 'dept-003',
    name: 'Infrastruktur & Keamanan',
    parentDeptId: 'dept-001',
    parentDeptName: 'Teknologi Informasi',
  },
  {
    id: 'dept-004',
    name: 'Sumber Daya Manusia',
  },
  {
    id: 'dept-005',
    name: 'Rekrutmen & Pengembangan Talenta',
    parentDeptId: 'dept-004',
    parentDeptName: 'Sumber Daya Manusia',
  },
]

export interface EmployeeResponse {
  id: string
  number: string
  fullName: string
  email: string
  hireDate: string
  isActive: boolean
  positionId: string
  positionTitle: string
  departmentId: string
  departmentName: string
  managerId: string | null
  managerName: string | null
}

export interface CreateEmployeeRequest {
  fullName: string
  email: string
  hireDate: string
  positionId: string
  departmentId: string
  managerId: string | null
}

export interface UpdateEmployeeRequest {
  fullName: string
  email: string
  hireDate: string
  positionId: string
  departmentId: string
  managerId: string | null
  isActive: boolean
}

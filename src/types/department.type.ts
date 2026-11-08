export interface DepartmentResponse {
  id: string
  name: string
  parentDeptId: string | null
  parentDeptName?: string | null
}
export interface UpdateDepartmentRequest {
  name: string
  parentDeptId: string | null
}

export interface CreateDepartmentRequest {
  id: string
  name: string
  parentDeptId: string | null
}

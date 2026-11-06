export interface DepartmentResponse {
  id: string
  name: string
  parentDeptId?: string
  parentDeptName?: string
}
export interface UpdateDepartmentRequest {
  name: string
  parentDeptId?: string
}

export interface 

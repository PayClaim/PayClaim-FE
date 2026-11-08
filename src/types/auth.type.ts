export interface LoginBody {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  statusCode: number
  message: string
  data: {
    token: string
    tokenType: string
    expiresAt: string
    user: UserProfile
  }
  errors: null
}

export interface UserProfile {
  accountId: string
  employeeId: string
  employeeNumber: string
  username: string
  fullName: string
  email: string
  departmentId: string
  departmentName?: string
  positionId: string
  positionTitle?: string
  managerId?: string
  managerName?: string
  roles: string[]
}

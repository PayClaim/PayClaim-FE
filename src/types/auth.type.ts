export interface LoginBody {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  tokenType: string
  expiresAt: Date
  user: UserProfile
}

interface UserProfile {
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

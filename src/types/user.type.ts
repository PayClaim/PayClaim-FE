export interface User {
  id: string
  username: string
  role: 'Admin' | 'Employee' | 'Finance'
  email: string
}

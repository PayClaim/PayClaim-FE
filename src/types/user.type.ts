export interface User {
  id: string
  username: string
  role: 'Admin' | 'Employee' | 'Finance' | 'FinanceManager'
  email: string
}

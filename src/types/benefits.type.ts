export interface EmployeeBenefitsResponse {
  employeeBenefitId: string
  benefitId: string
  benefitName: string
  categoryName: string
  periodType: string
  balance: number
  startDate: Date
  endDate: Date
  isActive: boolean
}

interface EmployeeBenefitId {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
  claimType: 'Benefit'
  description: 'string'
  transactionDate: '2026-11-08'
  amount: 0
  submittedAt: '2026-11-08T10:36:50.734Z'
  status: 'Submitted'
  employeeId: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
  employeeName: 'string'
  benefitName: 'string'
  tripProposalDescription: 'string'
  filePath: 'string'
}
export interface BenefitResponse {
  id: string
  name: string
  description: string
  periodType: string // enum
  categoryId: number
  categoryName: string
}

export interface UpdateBenefitRequest {
  name: string
  description: string
  periodType: string
  categoryId: number
}

export interface CreateBenefitRequest {
  name: string
  description: string
  periodType: string
  categoryId: number
}
/*
    public Guid EmployeeBenefitId { get; set; }

    public Guid BenefitId { get; set; }

    public string BenefitName { get; set; } = string.Empty;

    public string CategoryName { get; set; } = string.Empty;

    public BenefitPeriodType PeriodType { get; set; }

    public decimal Balance { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public bool IsActive { get; set; }
*/

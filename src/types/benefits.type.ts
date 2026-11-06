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

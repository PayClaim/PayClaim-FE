export type TripProposal = {
  id: string
  destination: string
  startDate: string
  endDate: string
  totalAmount: number
  submittedAt: string
  status: string
  picName: string | null
  participantCount: number
  filePath: string | null
}

export enum TripProposalStatus {
  Submitted = 'Submitted',
  UnderReview = 'Under Review',
  NeedsRevision = 'Needs Revision',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  FinanceManagerReview = 'Review by Finance Manager',
}

export interface TripProposalParticipantInput {
  employeeId: string
  isPic: boolean
  amount: number
}

export interface CreateTripProposalFormValues {
  destination: string
  startDate: string
  endDate: string
  description: string
  participants: TripProposalParticipantInput[]
  file: File | null
}

/*
    public Guid Id { get; set; }

    public string Destination { get; set; } = string.Empty;

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime SubmittedAt { get; set; }

    public TripProposalStatus Status { get; set; }

    public string? PicName { get; set; }

    public int ParticipantCount { get; set; }

    public string? FilePath { get; set; }

    Submitted = 1,
    UnderReview = 2,
    NeedsRevision = 3,
    Approved = 4,
    Rejected = 5,
    Completed = 6,
    Cancelled = 7

    */

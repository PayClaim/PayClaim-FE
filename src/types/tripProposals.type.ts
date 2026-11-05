export interface TripProposal {
  id: string
  destination: string
  startDate: Date
  endDate: Date
  totalAmount: number
  submittedAt: Date
  status: string
  picName?: string
  participantCount: number
  filePath?: string
}

export type TripProposalStatus =
  | 'Submitted'
  | 'UnderReview'
  | 'NeedsRevision'
  | 'Approved'
  | 'Rejected'
  | 'Completed'
  | 'Cancelled'

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

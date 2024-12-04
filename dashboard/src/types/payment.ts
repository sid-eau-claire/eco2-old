export type PaymentPeriod = {
  id: string;
  payPeriodDate: string;
  totalCommissionDeposited: number;
  totalPostMarkupRevenue: number;
  totalPersonalAmount: number;
  totalAgencyAmount: number;
  totalGenerationAmount: number;
  commissionLogId: string[];
  paymentIds: string[];
  commissionLogIds: string[];
}

export type  Payment  = {
  id: number;
  paymentPeriodId: string;
  totalEscrow: number;
  netDeposit: number;
  profileId: any;
  totalPersonalAmount: number | null;
  totalAgencyAmount: number | null;
  totalGenrationAmount: number | null;
  calculation: JSON | null;
  statementLog: StatementLog[];
}

export type StatementLog = {
  source: string,
  logId: string,
  generation: number,
  levelPercentage: number,
  commission: number,
  fieldRevenue: number,
  level: string
}

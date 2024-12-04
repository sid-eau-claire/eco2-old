export interface NewCase {
  writingAgentId: string;
  splitAgents: SplitAgent[];
  appInfo: AppInfo;
  applicants: Applicant[];
  appInsProducts: AppInsProduct[];
  appInvProducts: AppInvProduct[];
  compliance: Compliance;
  applicationDocuments: File[];
  illustrationDocuments: File[];
  caseType: string;
  status: string;
  totalEstFieldRevenue: number;
  totalAnnualPremium: number;
  totalCoverageFaceAmount: number;
  appAffiliateProduct: AppAffiliateProduct[];
  totalAnnualAUM: number;
  estSettledDays: number;
  monthlyBillingPremium: number;
  settledDate: string;
}

export interface SplitAgent {
  // Add properties based on your schema
}

export interface AppInfo {
  carrierId: string;
  appNumber: string;
  policyAcountNumber: string;
  provinceId: string;
  type: string;
}

export interface Applicant {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  isInsuredAnnuitant: boolean;
  isOwner: boolean;
  smoker: boolean;
  email: string;
  phone: string;
}

export interface AppInsProduct {
  productId: string;
  coverageFaceAmount: number;
  annualPremium: number;
  estFieldRevenue: number;
  targetPremium: number;
  applicantIndex: number;
}

export interface AppInvProduct {
  registrationType: string;
  categoryId: string;
  frequency: string;
  lumpSumDeposit: number;
  feeTypeId: string;
  estFieldRevenue: number;
  recurringDeposit: number;
  annualAUM: number;
}

export interface Compliance {
  analysis: boolean;
  reason: boolean;
  disclosure: boolean;
  QA: QA[];
}

export interface QA {
  // Add properties based on your schema
}

export interface AppAffiliateProduct {
  // Add properties based on your schema
}

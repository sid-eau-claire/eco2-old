import { z } from 'zod';

export const zCommissionLogSchema = z.object({
  carrier: z.string(),
  carrierId: z.string(),
  statementDate: z.date().nullable().optional(),
  statementAmount: z.number().nullable().optional(),
  bankDepositStatus: z.string().nullable().optional(),
  depositDate: z.date().nullable().optional(),
  deposit: z.number().nullable().optional(),
  payrollStatus: z.string().nullable().optional(),
  fieldPayDate: z.date().nullable().optional(),
  originalStatement: z.string().nullable().optional(),
  statementPeriodStartDate: z.date().optional(),
  statementPeriodEndDate: z.date().optional(),
  totalCommissionDeposited: z.number().nullable().optional(),
  totalPostMarkupRevenue: z.number().nullable().optional(),
});

export type CommissionLog = z.infer<typeof zCommissionLogSchema>;

// export type CommissionLogEntry = {
//   line: number; // Sequence number
//   carrier: string; // Carrier name
//   writingAgent: string; // Name of the writing agent
//   writingAgentPercentage: number; // Percentage of the writing agent (as a decimal, e.g., 0.40 for 40%)
//   splitAgent1: string; // Name of the first split agent
//   splitAgent1Percentage: number; // Percentage of the first split agent (as a decimal)
//   splitAgent2: string; // Name of the second split agent
//   splitAgent2Percentage: number; // Percentage of the second split agent (as a decimal)
//   splitAgent3: string; // Name of the third split agent
//   splitAgent3Percentage: number; // Percentage of the third split agent (as a decimal)
//   clientName: string; // Client's name
//   policyAccountFund: string; // Policy or account fund number
//   transactionDate: Date; // Date of the transaction
//   productCategory: string; // Category of the product
//   productDetails: string; // Details of the product
//   bonus: boolean; // Bonus amount (as a decimal)
//   bonusMarkup: number; // Bonus markup (as a decimal)
//   receivedRevenue: number; // Revenue received (as a decimal)
//   postMarkupRevenue: number; // Revenue after markup (as a decimal)
// }

export type CommissionLogEntry = {
  commissionLogId: string; // ID of the commission log
  line: number; // Sequence number
  carrier: string; // Carrier name
  carrierId: string; // Carrier ID
  writingAgent: string; // Name of the writing agent
  writingAgentId: string; // Writing agent ID
  writingAgentPercentage: number; // Percentage of the writing agent (as a decimal, e.g., 0.40 for 40%)
  splitAgent1: string; // Name of the first split agent
  splitAgent1Id: string; // First split agent ID
  splitAgent1Percentage: number; // Percentage of the first split agent (as a decimal)
  splitAgent2: string; // Name of the second split agent
  splitAgent2Id: string; // Second split agent ID
  splitAgent2Percentage: number; // Percentage of the second split agent (as a decimal)
  splitAgent3: string; // Name of the third split agent
  splitAgent3Id: string; // Third split agent ID
  splitAgent3Percentage: number; // Percentage of the third split agent (as a decimal)
  clientName: string; // Client's name
  policyAccountFund: string; // Policy or account fund number
  transactionDate: Date; // Date of the transaction
  productCategory: string; // Category of the product
  productDetails: string; // Details of the product
  bonus: boolean; // Bonus amount (as a decimal)
  bonusMarkup: number; // Bonus markup (as a decimal)
  receivedRevenue: number; // Revenue received (as a decimal)
  postMarkupRevenue: number; // Revenue after markup (as a decimal)
}

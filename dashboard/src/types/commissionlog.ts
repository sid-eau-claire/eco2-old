import { z } from 'zod';

export const zCarrierIdSchema = z.object({
  id: z.string().optional(),
  carrierName: z.string().optional(),
});
export const zCommissionLogSchema = z.object({
  // id: z.string().nullable().optional(),
  id: z.number().optional(),
  carrier: z.string().optional(),
  carrierId: zCarrierIdSchema,
  statementDate: z.string().optional(),
  statementAmount: z.number().optional(),
  bankDepositStatus: z.string().optional(),
  depositDate: z.string().optional(),
  deposit: z.number().optional(),
  payrollStatus: z.string().optional(),
  fieldPayDate: z.string().optional(),
  originalStatement: z.any().optional(),
  statementPeriodStartDate: z.string().optional(),
  statementPeriodEndDate: z.string().optional(),
  totalCommissionDeposited: z.number().optional(),
  totalPostMarkupRevenue: z.number().optional(),
});

// export const zCommissionLogSchema = z.object({
//   carrier: z.string(),
//   carrierId: z.string(),
//   statementDate: z.string().nullable().optional().refine(val => !val || !isNaN(Date.parse(val)), {
//     message: "Invalid date format",
//   }).transform(val => val ? new Date(val) : null),
//   statementAmount: z.number().nullable().optional(),
//   bankDepositStatus: z.string().nullable().optional(),
//   depositDate: z.string().nullable().optional().refine(val => !val || !isNaN(Date.parse(val)), {
//     message: "Invalid date format",
//   }).transform(val => val ? new Date(val) : null),
//   deposit: z.string().nullable().optional().transform(val => val ? parseFloat(val) : null),
//   payrollStatus: z.string().nullable().optional(),
//   fieldPayDate: z.string().nullable().optional().refine(val => !val || !isNaN(Date.parse(val)), {
//     message: "Invalid date format",
//   }).transform(val => val ? new Date(val) : null),
//   originalStatement: z.string().nullable().optional(),
//   statementPeriodStartDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
//     message: "Invalid date format",
//   }).transform(val => val ? new Date(val) : undefined),
//   statementPeriodEndDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), {
//     message: "Invalid date format",
//   }).transform(val => val ? new Date(val) : undefined),
//   totalCommissionDeposited: z.number().nullable().optional(),
//   totalPostMarkupRevenue: z.number().nullable().optional(),
// });



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

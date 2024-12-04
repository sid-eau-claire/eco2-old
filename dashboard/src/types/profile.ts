import { z } from 'zod';

const ownerSchema = z.object({
  id: z.string(),
  username: z.string().optional(),
  email: z.string(),
  provider: z.string().optional(),
  confirmed: z.boolean().optional(),
  blocked: z.boolean().optional(),
});

const bankingInformationSchema = z.object({
  id: z.string().optional(),
  institutionNumber: z.string().optional().nullable(),
  transitNumber: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
});

const beneficiarySchema = z.object({
  id: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional().nullable(),
  homePhone: z.string().optional().nullable(),
  mobilePhone: z.string().optional().nullable(),
});

const provinceSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  shortName: z.string().optional(),
  provinceCode: z.string().optional(),
  countryId: z.number().optional(),

});

const addressSchema = z.object({
  id: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),  
  countryId: z.number().optional(),
  provinceId: provinceSchema,
}).optional();


const rankIdSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  rankValue: z.number().optional(),
  rankCode: z.string().optional().optional(),
  fastTrackProductionRequirement: z.number().optional(),
  totalLifeTimeProductionRequirement: z.number().optional(),
  category: z.number().optional(),
  commissionCollectionMode: z.number().optional(),
});

const subscriptionSettingSchema = z.object({
  id: z.string().optional(),
  stripeCustomerId: z.string().optional().nullable(),
  cardBrand: z.string().optional().nullable(),
  // cardLastFour: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val), 'Must be a number'),
  cardLastFour: z.string().optional().nullable(),
  stripeSubscriptionPlanId: z.string().optional().nullable(),
});

export const zProfileSchema = z.object({
  id: z.string(),
  referralCode: z.string().optional(),
  status: z.string().optional(), // You might want to use z.enum(['completed', ...]) for specific statuses
  creditScore: z.number().optional(),
  advisorDuration: z.number().optional(),
  rank: z.string().optional(),
  firstName: z.string().min(1, 'First name must be inputted'),
  lastName: z.string(),
  middleName: z.string().nullable(),
  nickName: z.string().nullable(),
  dateOfBirth: z.string(), // Consider z.date() for Date objects
  settings: z.any().nullable(), // Specify structure or keep as any if it varies
  step: z.any().nullable(), // Specify structure or keep as any if it varies
  previousCompany: z.string().optional(),
  mobilePhone: z.string().optional(),
  homePhone: z.string().optional().nullable() ,
  officePhone: z.string().optional().nullable(), 
  fundCode: z.string().optional(),
  emailNotificationsEnabled: z.boolean().optional(),
  recruitedById: z.string().nullable().optional(),
  receiveAdminNotifications: z.number().optional(),
  payPeriodPayoutThreshold: z.number().nullable().optional(),
  deactivatedAt: z.string().nullable().optional(),
  rootSplitFraction: z.number().nullable().optional(),
  commissionOverrideFraction: z.number().nullable().optional(),
  isContracted: z.number().optional(),
  contractedAt: z.string().nullable().optional(),
  licenseStatusId: z.number().nullable().optional(),
  organizationUnit: z.string().nullable().optional(),
  contractTerminatedAt: z.string().nullable().optional(),
  oldId: z.string().optional(),
  oldProfileImageId: z.string().nullable().optional(),
  oldBeneficiaryId: z.string().nullable().optional(),
  owner: ownerSchema.optional(),
  homeAddress: addressSchema.optional(),
  mailAddress: addressSchema.optional(),
  profileImage: z.any().nullable().optional(), // Consider a more specific schema if structure is known
  invitations: z.array(z.any()).optional(), // Consider a more specific schema if structure is known
  bankingInformation: bankingInformationSchema.optional().nullable(), // Updated to use bankingInformationSchema
  rankId: z.string().optional().nullable(),
  beneficiary: beneficiarySchema.optional().nullable(),
  subscriptionSetting: subscriptionSettingSchema.optional(),
  examResults: z.any().nullable().optional(), // Consider a more specific schema if structure is known
  currentLicense: z.any().nullable().optional(), // Consider a more specific schema if structure is known
  eoLicense: z.any().nullable().optional(), // Consider a more specific schema if structure is known
  externalAccount: z.array(z.any()).optional(), // Consider a more specific schema if structure is known
});

// Export or use schema as needed
export type ProfileSchema = z.infer<typeof zProfileSchema>;

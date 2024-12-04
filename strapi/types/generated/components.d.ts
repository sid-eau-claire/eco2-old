import type { Schema, Attribute } from '@strapi/strapi';

export interface AccountExternalAccount extends Schema.Component {
  collectionName: 'components_account_external_accounts';
  info: {
    displayName: 'externalAccount';
    icon: 'user';
  };
  attributes: {
    externalCode: Attribute.String;
    account: Attribute.String;
  };
}

export interface InformationActivity extends Schema.Component {
  collectionName: 'components_information_activities';
  info: {
    displayName: 'activity';
    icon: 'book';
    description: '';
  };
  attributes: {
    type: Attribute.Enumeration<
      ['Call', 'Meeting', 'Task', 'Deadline', 'Email', 'Lunch']
    >;
    subject: Attribute.String;
    startDate: Attribute.DateTime;
    endDate: Attribute.DateTime;
    priority: Attribute.Enumeration<['Low', 'Medium', 'High']>;
    location: Attribute.String;
    videoCallLink: Attribute.String;
    description: Attribute.Text;
    status: Attribute.Enumeration<['Free', 'Busy', 'Out of Office']>;
    notes: Attribute.Text;
    participants: Attribute.JSON;
    createTime: Attribute.DateTime;
  };
}

export interface InformationAddress extends Schema.Component {
  collectionName: 'components_information_addresses';
  info: {
    displayName: 'address';
    description: '';
  };
  attributes: {
    address: Attribute.String;
    city: Attribute.String;
    provinceId: Attribute.Relation<
      'information.address',
      'oneToOne',
      'api::province.province'
    >;
    postalCode: Attribute.String;
    countryId: Attribute.String & Attribute.DefaultTo<'2'>;
  };
}

export interface InformationAdministrative extends Schema.Component {
  collectionName: 'components_information_administratives';
  info: {
    displayName: 'administrative';
    icon: 'alien';
    description: '';
  };
  attributes: {
    fundCode: Attribute.String;
    escrow: Attribute.Boolean & Attribute.Required & Attribute.DefaultTo<false>;
    escrowHoldPercent: Attribute.Decimal;
    payPeriodPayoutThreshold: Attribute.Decimal & Attribute.DefaultTo<50>;
    blockCommission: Attribute.Boolean & Attribute.DefaultTo<false>;
    blockLogin: Attribute.Boolean & Attribute.DefaultTo<false>;
    deactivate: Attribute.Boolean & Attribute.DefaultTo<false>;
    overrideCommission: Attribute.Boolean & Attribute.DefaultTo<false>;
    CommissionOverrideFraction: Attribute.Decimal;
    Notes: Attribute.String & Attribute.DefaultTo<' '>;
    deactivatedAt: Attribute.Date;
    escrowPersonal: Attribute.Boolean;
    escrowAgency: Attribute.Boolean;
    escrowGeneration: Attribute.Boolean;
    escrowPersonalPercentage: Attribute.Decimal;
    escrowAgencyPercentage: Attribute.Decimal;
    escrowGenerationPercentage: Attribute.Decimal;
  };
}

export interface InformationAdvisorRevenue extends Schema.Component {
  collectionName: 'components_information_advisor_revenues';
  info: {
    displayName: 'advisorRevenue';
    icon: 'crop';
    description: '';
  };
  attributes: {
    accountId: Attribute.Relation<
      'information.advisor-revenue',
      'oneToOne',
      'api::account.account'
    >;
    fieldRevenue: Attribute.Decimal;
    FLAgentIds: Attribute.Relation<
      'information.advisor-revenue',
      'oneToMany',
      'api::account.account'
    >;
    TRXIds: Attribute.Relation<
      'information.advisor-revenue',
      'oneToMany',
      'api::accounttransaction.accounttransaction'
    >;
    teamFieldRevenue: Attribute.Decimal;
  };
}

export interface InformationAffiliateProduct extends Schema.Component {
  collectionName: 'components_information_affiliate_products';
  info: {
    displayName: 'affiliateProduct';
    icon: 'cog';
  };
  attributes: {
    referralType: Attribute.Enumeration<
      [
        'Legal Services',
        'Wills & Power of Attorney',
        'Mortgages',
        'Debt Consolidation',
        'Home & Auto',
        'Commercial & General Liability',
        'Family & Corp Mediation',
        'Accounting & Bookkeeping',
        'Foreign Exchange',
        'Pet Insurance'
      ]
    >;
    affiliateVendor: Attribute.Enumeration<['Sheldon Brow']>;
    numberOfApplicants: Attribute.Integer;
  };
}

export interface InformationAnnouncement extends Schema.Component {
  collectionName: 'components_information_announcements';
  info: {
    displayName: 'announcement';
  };
  attributes: {
    title: Attribute.String;
    images: Attribute.Media;
    description: Attribute.RichText &
      Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          output: 'HTML';
          preset: 'standard';
        }
      >;
  };
}

export interface InformationAppInfo extends Schema.Component {
  collectionName: 'components_information_app_infos';
  info: {
    displayName: 'appInfo';
    description: '';
  };
  attributes: {
    carrierId: Attribute.Relation<
      'information.app-info',
      'oneToOne',
      'api::carrier.carrier'
    >;
    appNumber: Attribute.String;
    policyAccountNumber: Attribute.String;
    provinceId: Attribute.Relation<
      'information.app-info',
      'oneToOne',
      'api::province.province'
    >;
    type: Attribute.Enumeration<
      ['Electronic', 'First Piece of Business (FPB)', 'Paper']
    >;
  };
}

export interface InformationAppInvProduct extends Schema.Component {
  collectionName: 'components_information_app_inv_products';
  info: {
    displayName: 'appInvProduct';
    description: '';
  };
  attributes: {
    registrationType: Attribute.Enumeration<
      [
        'RRSP',
        'RRSP - Spousal',
        'TFSA',
        'RESP',
        'LIRA/PENSIONS',
        'RDSP',
        'Non-Registered',
        'FHSA'
      ]
    >;
    categoryId: Attribute.Relation<
      'information.app-inv-product',
      'oneToOne',
      'api::fundcategorytype.fundcategorytype'
    >;
    frequency: Attribute.Enumeration<
      ['Weekly', 'Bi-Weekly', 'Twice a month', 'Monthly', 'Quarterly']
    >;
    lumpSumDeposit: Attribute.Decimal;
    feeTypeId: Attribute.Relation<
      'information.app-inv-product',
      'oneToOne',
      'api::investmentfeetype.investmentfeetype'
    >;
    estFieldRevenue: Attribute.Decimal;
    recurringDeposit: Attribute.Decimal;
    annualAUM: Attribute.Decimal;
    managementFeePercent: Attribute.Decimal;
  };
}

export interface InformationAppProduct extends Schema.Component {
  collectionName: 'components_information_app_products';
  info: {
    displayName: 'appInsProduct';
    description: '';
  };
  attributes: {
    productId: Attribute.Relation<
      'information.app-product',
      'oneToOne',
      'api::product.product'
    >;
    coverageFaceAmount: Attribute.Decimal;
    annualPremium: Attribute.Decimal;
    estFieldRevenue: Attribute.Decimal;
    targetPremium: Attribute.Decimal;
    applicantIndex: Attribute.Decimal;
    productCategory: Attribute.Relation<
      'information.app-product',
      'oneToOne',
      'api::productcategory.productcategory'
    >;
  };
}

export interface InformationAppRole extends Schema.Component {
  collectionName: 'components_information_app_roles';
  info: {
    displayName: 'appRole';
    icon: 'bold';
    description: '';
  };
  attributes: {
    name: Attribute.Enumeration<
      ['commissionEdit', 'commissionRun', 'payrollEdit', 'newcaseEdit']
    >;
  };
}

export interface InformationApplicant extends Schema.Component {
  collectionName: 'components_information_applicants';
  info: {
    displayName: 'applicant';
    description: '';
  };
  attributes: {
    firstName: Attribute.String;
    lastName: Attribute.String;
    dateOfBirth: Attribute.Date;
    gender: Attribute.Enumeration<['male', 'female', 'notprovided']> &
      Attribute.DefaultTo<'notprovided'>;
    isInsuredAnnuitant: Attribute.Boolean;
    isOwner: Attribute.Boolean;
    smoker: Attribute.Boolean;
    email: Attribute.Email;
    phone: Attribute.String;
    clientId: Attribute.Relation<
      'information.applicant',
      'oneToOne',
      'api::client.client'
    >;
  };
}

export interface InformationBankingInformation extends Schema.Component {
  collectionName: 'components_information_banking_informations';
  info: {
    displayName: 'bankingInformation';
  };
  attributes: {
    accountNumber: Attribute.String;
    transitNumber: Attribute.String;
    institutionNumber: Attribute.String;
  };
}

export interface InformationBeneficiary extends Schema.Component {
  collectionName: 'components_information_beneficiaries';
  info: {
    displayName: 'beneficiary';
    icon: 'cloud';
    description: '';
  };
  attributes: {
    firstName: Attribute.String;
    lastName: Attribute.String;
    homePhone: Attribute.String;
    address: Attribute.Component<'information.address'>;
    relationshipId: Attribute.Relation<
      'information.beneficiary',
      'oneToOne',
      'api::relationship.relationship'
    >;
  };
}

export interface InformationCompilanceInv extends Schema.Component {
  collectionName: 'components_information_compilance_invs';
  info: {
    displayName: 'compilanceInv';
  };
  attributes: {};
}

export interface InformationComplianceIns extends Schema.Component {
  collectionName: 'components_information_compliance_ins';
  info: {
    displayName: 'complianceIns';
  };
  attributes: {
    question: Attribute.String;
    answer: Attribute.String;
  };
}

export interface InformationCompliance extends Schema.Component {
  collectionName: 'components_information_compliances';
  info: {
    displayName: 'compliance';
    description: '';
  };
  attributes: {
    analysis: Attribute.Boolean;
    reason: Attribute.Boolean;
    disclosure: Attribute.Boolean;
    QA: Attribute.Component<'information.qa', true>;
  };
}

export interface InformationDocument extends Schema.Component {
  collectionName: 'components_information_documents';
  info: {
    displayName: 'document';
    description: '';
  };
  attributes: {
    documentType: Attribute.Enumeration<
      ['Form', 'Marketing documents', 'Guides', 'Advertising tools', 'Tools']
    >;
    category: Attribute.Enumeration<
      [
        'Application/Instructions \u2013 Savings',
        'Application \u2013 Insurance'
      ]
    >;
    title: Attribute.String;
    htmlLink: Attribute.String;
    document: Attribute.Media;
    productType: Attribute.Component<'information.type', true>;
  };
}

export interface InformationEvents extends Schema.Component {
  collectionName: 'components_information_events';
  info: {
    displayName: 'events';
  };
  attributes: {
    title: Attribute.String;
    description: Attribute.RichText &
      Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          output: 'HTML';
          preset: 'standard';
        }
      >;
    startDateTime: Attribute.DateTime;
    endDateTime: Attribute.DateTime;
  };
}

export interface InformationFile extends Schema.Component {
  collectionName: 'components_information_files';
  info: {
    displayName: 'file';
    description: '';
  };
  attributes: {
    attachments: Attribute.Media;
    createTime: Attribute.DateTime;
  };
}

export interface InformationItems extends Schema.Component {
  collectionName: 'components_information_items';
  info: {
    displayName: 'items';
  };
  attributes: {
    title: Attribute.String;
    completed: Attribute.Boolean & Attribute.DefaultTo<false>;
  };
}

export interface InformationLicenseContracting extends Schema.Component {
  collectionName: 'components_information_license_contractings';
  info: {
    displayName: 'licenseContracting';
    icon: 'clock';
    description: '';
  };
  attributes: {
    subscriberStatus: Attribute.Enumeration<
      [
        'Licensed (Pending Contracting)',
        'Licensed & Contracted',
        'Non-Licensed',
        'Terminated'
      ]
    >;
    contracted: Attribute.Boolean;
    dateContracted: Attribute.Date;
    licenses: Attribute.Component<'information.license', true>;
    contractTerminatedAt: Attribute.Date;
  };
}

export interface InformationLicense extends Schema.Component {
  collectionName: 'components_information_licenses';
  info: {
    displayName: 'license';
    icon: 'connector';
    description: '';
  };
  attributes: {
    licenseType: Attribute.Enumeration<
      ['Errors & Omissions Insurance', 'Life Insurance', 'Accident & Sickness']
    >;
    licenseNumber: Attribute.String;
    expiryDate: Attribute.Date;
    provinceId: Attribute.Relation<
      'information.license',
      'oneToOne',
      'api::province.province'
    >;
    licenseDocuments: Attribute.Media;
  };
}

export interface InformationNote extends Schema.Component {
  collectionName: 'components_information_notes';
  info: {
    displayName: 'note';
    description: '';
  };
  attributes: {
    createTime: Attribute.DateTime;
    content: Attribute.Text;
  };
}

export interface InformationOpportunity extends Schema.Component {
  collectionName: 'components_information_opportunities';
  info: {
    displayName: 'opportunity';
    icon: 'archive';
  };
  attributes: {
    opportunityName: Attribute.String;
    isHealthInsurance: Attribute.Boolean;
    isLifeInsurance: Attribute.Boolean;
  };
}

export interface InformationProductItem extends Schema.Component {
  collectionName: 'components_information_product_items';
  info: {
    displayName: 'ProductItem';
  };
  attributes: {};
}

export interface InformationProduct extends Schema.Component {
  collectionName: 'components_information_products';
  info: {
    displayName: 'product';
    description: '';
  };
  attributes: {
    description: Attribute.RichText &
      Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          output: 'HTML';
          preset: 'standard';
        }
      >;
    photo: Attribute.Media;
    title: Attribute.String;
    productType: Attribute.Component<'information.type'>;
  };
}

export interface InformationQa extends Schema.Component {
  collectionName: 'components_information_qas';
  info: {
    displayName: 'QA';
    description: '';
  };
  attributes: {
    question: Attribute.Text;
    answer: Attribute.Text;
  };
}

export interface InformationRankHistory extends Schema.Component {
  collectionName: 'components_information_rank_histories';
  info: {
    displayName: 'rankHistory';
  };
  attributes: {
    previousRank: Attribute.Integer;
    newRank: Attribute.Integer;
    isPromoted: Attribute.Boolean;
    effectiveDate: Attribute.Date;
  };
}

export interface InformationRankOverride extends Schema.Component {
  collectionName: 'components_information_rank_overrides';
  info: {
    displayName: 'rankOverride';
    icon: 'crop';
  };
  attributes: {
    rankId: Attribute.Relation<
      'information.rank-override',
      'oneToOne',
      'api::rank.rank'
    >;
    override: Attribute.Decimal;
  };
}

export interface InformationRoles extends Schema.Component {
  collectionName: 'components_information_roles';
  info: {
    displayName: 'roles';
    icon: 'cog';
    description: '';
  };
  attributes: {
    role: Attribute.Enumeration<
      ['Advisor', 'Poweruser', 'Superuser', 'InternalStaff']
    >;
  };
}

export interface InformationSettings extends Schema.Component {
  collectionName: 'components_information_settings';
  info: {
    displayName: 'settings';
    icon: 'attachment';
    description: '';
  };
  attributes: {
    description: Attribute.String;
    value: Attribute.Decimal;
    level: Attribute.Integer;
    name: Attribute.String;
  };
}

export interface InformationSplitingAgent extends Schema.Component {
  collectionName: 'components_information_spliting_agents';
  info: {
    displayName: 'splitingAgent';
  };
  attributes: {
    profileId: Attribute.Relation<
      'information.spliting-agent',
      'oneToOne',
      'api::profile.profile'
    >;
    splitingPercentage: Attribute.Decimal;
  };
}

export interface InformationStatementLog extends Schema.Component {
  collectionName: 'components_information_statement_logs';
  info: {
    displayName: 'statementLog';
    icon: 'crown';
    description: '';
  };
  attributes: {
    source: Attribute.Enumeration<['Personal', 'Agency', 'Generational']>;
    logId: Attribute.Relation<
      'information.statement-log',
      'oneToOne',
      'api::commissionlogentry.commissionlogentry'
    >;
    generation: Attribute.Decimal;
    levelPercentage: Attribute.Decimal;
    commission: Attribute.Decimal;
    level: Attribute.String;
    fieldRevenue: Attribute.Decimal;
    escrow: Attribute.Decimal;
    calculation: Attribute.Text;
    teamFieldRevenue: Attribute.Decimal;
  };
}

export interface InformationSubscriptionSettings extends Schema.Component {
  collectionName: 'components_information_subscription_settings';
  info: {
    displayName: 'subscriptionSettings';
    description: '';
  };
  attributes: {
    stripeCustomer: Attribute.String;
    cardBrand: Attribute.String;
    cardLastFour: Attribute.String;
    planId: Attribute.Relation<
      'information.subscription-settings',
      'oneToOne',
      'api::subscriptionplan.subscriptionplan'
    >;
    pPlanId: Attribute.Relation<
      'information.subscription-settings',
      'oneToOne',
      'api::subscriptionplan.subscriptionplan'
    >;
    stripeSubscriptionPlanId: Attribute.String;
  };
}

export interface InformationTraining extends Schema.Component {
  collectionName: 'components_information_trainings';
  info: {
    displayName: 'training';
    icon: 'brush';
    description: '';
  };
  attributes: {
    topic: Attribute.String;
    link: Attribute.String;
    productType: Attribute.Component<'information.type'>;
    description: Attribute.RichText &
      Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          output: 'HTML';
          preset: 'standard';
        }
      >;
  };
}

export interface InformationType extends Schema.Component {
  collectionName: 'components_information_types';
  info: {
    displayName: 'ProductType';
    icon: 'cloud';
    description: '';
  };
  attributes: {
    name: Attribute.Enumeration<
      [
        'All',
        'Critical Illness',
        'Disability',
        'Term Insurance',
        'Universal Life',
        'Whole Life',
        'Travel'
      ]
    >;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'account.external-account': AccountExternalAccount;
      'information.activity': InformationActivity;
      'information.address': InformationAddress;
      'information.administrative': InformationAdministrative;
      'information.advisor-revenue': InformationAdvisorRevenue;
      'information.affiliate-product': InformationAffiliateProduct;
      'information.announcement': InformationAnnouncement;
      'information.app-info': InformationAppInfo;
      'information.app-inv-product': InformationAppInvProduct;
      'information.app-product': InformationAppProduct;
      'information.app-role': InformationAppRole;
      'information.applicant': InformationApplicant;
      'information.banking-information': InformationBankingInformation;
      'information.beneficiary': InformationBeneficiary;
      'information.compilance-inv': InformationCompilanceInv;
      'information.compliance-ins': InformationComplianceIns;
      'information.compliance': InformationCompliance;
      'information.document': InformationDocument;
      'information.events': InformationEvents;
      'information.file': InformationFile;
      'information.items': InformationItems;
      'information.license-contracting': InformationLicenseContracting;
      'information.license': InformationLicense;
      'information.note': InformationNote;
      'information.opportunity': InformationOpportunity;
      'information.product-item': InformationProductItem;
      'information.product': InformationProduct;
      'information.qa': InformationQa;
      'information.rank-history': InformationRankHistory;
      'information.rank-override': InformationRankOverride;
      'information.roles': InformationRoles;
      'information.settings': InformationSettings;
      'information.spliting-agent': InformationSplitingAgent;
      'information.statement-log': InformationStatementLog;
      'information.subscription-settings': InformationSubscriptionSettings;
      'information.training': InformationTraining;
      'information.type': InformationType;
    }
  }
}

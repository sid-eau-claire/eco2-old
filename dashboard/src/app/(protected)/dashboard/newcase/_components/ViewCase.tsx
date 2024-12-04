import React from 'react';
import { RowContainer } from '@/components/Containers';

// Simulating the input props type using the detailed structure you provided
type InsuranceCase = {
  id: number;
  caseType: string;
  status: string;
  appInfo: {
    id: number;
    appNumber: string;
    type: string;
    carrierId: {
      id: number;
      carrierName: string;
    };
  };
  appInsProducts: Array<{
    id: number;
    coverageFaceAmount: number;
    annualPremium: number;
    estFieldRevenue: number;
    targetPremium: number;
    applicantIndex: number;
    productId: {
      id: number;
      name: string;
      userAdded: boolean;
      FYC: number;
      overrideCarrierBonus: any;
    };
  }>;
  appInvProducts: Array<any>; // Detailed types can be added similar to appInsProducts
  applicants: Array<{
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    isInsuredAnnuitant: boolean;
    isOwner: boolean;
    smoker: boolean | null;
  }>;
  writingAgentId: {
    id: number;
    firstName: string;
    lastName: string;
  };
};

interface CaseSummaryProps {
  insuranceCase: InsuranceCase;
}

const ViewCase: React.FC<CaseSummaryProps> = ({ insuranceCase }) => {
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Case Summary</h2>

      <RowContainer className="mb-4">
        <div className="font-medium text-gray-600">Case Type:</div>
        <div className="text-gray-800">{insuranceCase.caseType}</div>
      </RowContainer>

      <RowContainer className="mb-4">
        <div className="font-medium text-gray-600">Applicants:</div>
        {insuranceCase.applicants.map((applicant, index) => (
          <div key={index} className="text-gray-800">
            {applicant.firstName} {applicant.lastName} - {applicant.gender}, DOB: {applicant.dateOfBirth}
          </div>
        ))}
      </RowContainer>

      <RowContainer className="mb-4">
        <div className="font-medium text-gray-600">Insurance Products:</div>
        {insuranceCase.appInsProducts.map((product, index) => (
          <div key={index} className="text-gray-800">
            Product ID: {product.productId.id}, Coverage: {product.coverageFaceAmount}, Annual Premium: {product.annualPremium}
          </div>
        ))}
      </RowContainer>

      <RowContainer className="mb-4">
        <div className="font-medium text-gray-600">Carrier Information:</div>
        <div className="text-gray-800">
          Carrier Name: {insuranceCase.appInfo.carrierId.carrierName}, Application Number: {insuranceCase.appInfo.appNumber}
        </div>
      </RowContainer>

      <RowContainer className="mb-4">
        <div className="font-medium text-gray-600">Writing Agent:</div>
        <div className="text-gray-800">
          {insuranceCase.writingAgentId.firstName} {insuranceCase.writingAgentId.lastName}
        </div>
      </RowContainer>

      {/* <button
        className="mt-4 w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Close
      </button> */}
    </div>
  );
};

export default ViewCase;

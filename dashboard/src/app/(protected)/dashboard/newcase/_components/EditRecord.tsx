'use client'
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PanelContainer } from '@/components/Containers';
import { getNewCase, updateNewCase } from './../_actions/newcase';
import TypeAgent from './../../mybusiness/newcase/_components/TypeAgent';
import CarrierApplicant from '../../mybusiness/newcase/_components/CarrierApplicant';
import Product from '../../mybusiness/newcase/_components/Product';
import ComplianceDocumentation from '../../mybusiness/newcase/_components/ComplianceDocumentation';
import { MessageBox } from '@/components/Popup';
import { LoadingButtonNP } from '@/components/Button';

const EditRecord = ({selectedRecord, setSelectedRecord, isEditable, columnMode}: {selectedRecord: any, setSelectedRecord: any, isEditable?: boolean,  columnMode?: boolean}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSteps, setSelectedSteps] = useState([true, false, false, false, false]);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [heading, setHeading] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const form = useForm<any>();
  const { watch, setValue, getValues, handleSubmit } = form;
  const formData = watch();

  useEffect(() => {
    const fetchNewCase = async () => {
      setIsLoading(true);
      try {
        const response = await getNewCase(selectedRecord.id);
        const data = response.data[0];

        // Create a single object to hold all form values
        const formValues: any = {
          isSplitAgent: data.splitAgents.length > 1,
          id: data.id.toString(),
          writingAgentId: data.writingAgentId?.id.toString(),
          caseType: data.caseType,
          'appInfo.carrierId': data.appInfo.carrierId?.id.toString(),
          'appInfo.appNumber': data.appInfo.appNumber,
          'appInfo.policyAccountNumber': data.appInfo.policyAccountNumber,
          'appInfo.provinceId': data.appInfo.provinceId?.id.toString(),
          'appInfo.type': data.appInfo.type,
          monthlyBillingPremium: data.monthlyBillingPremium?.toString(),
          status: data.status,
          totalEstFieldRevenue: data.totalEstFieldRevenue?.toString(),
          'compliance.analysis': data.compliance.analysis,
          'compliance.disclosure': data.compliance.disclosure,
          'compliance.reason': data.compliance.reason,
          'compliance.QA': data.compliance.QA,
          estSettledDays: data.estSettledDays?.toString(),
          oldApplicationDocuments: data.applicationDocuments,
          oldIllustrationDocuments: data.illustrationDocuments,
        };

        // Set split agents
        data.splitAgents.forEach((agent:any, index: number) => {
          formValues[`loadSplitAgents[${index}].profileId`] = agent?.profileId?.id.toString();
          formValues[`loadSplitAgents[${index}].referralCode`] = agent?.profileId?.referralCode;
          formValues[`loadSplitAgents[${index}].splitingPercentage`] = agent.splitingPercentage.toString();
          formValues[`LoadSplitAgents[${index}].found`] = "Found";
        });

        // Set applicants
        data.applicants.forEach((applicant:any, index:number) => {
          formValues[`applicants[${index}].id`] = applicant.id.toString();
          formValues[`applicants[${index}].firstName`] = applicant.firstName;
          formValues[`applicants[${index}].lastName`] = applicant.lastName;
          formValues[`applicants[${index}].dateOfBirth`] = applicant.dateOfBirth;
          formValues[`applicants[${index}].gender`] = applicant.gender.toLowerCase();
          formValues[`applicants[${index}].isOwner`] = applicant.isOwner;
          formValues[`applicants[${index}].isInsured`] = applicant.isInsured;
          formValues[`applicants[${index}].smoker`] = applicant.smoker;
          formValues[`applicants[${index}].clientId`] = applicant.clientId.id.toString();
        });

        // Set insurance products
        data.appInsProducts.forEach((product:any, index:number) => {
          formValues[`appInsProducts[${index}].fieldIndex`] = index.toString();
          formValues[`appInsProducts[${index}].productId`] = product.productId?.id.toString();
          formValues[`appInsProducts[${index}].productCategory`] = product.productCategory?.id.toString();
          formValues[`appInsProducts[${index}].coverageFaceAmount`] = product.coverageFaceAmount.toString();
          formValues[`appInsProducts[${index}].annualPremium`] = product.annualPremium.toString();
          formValues[`appInsProducts[${index}].estFieldRevenue`] = product.estFieldRevenue.toString();
          if (product.targetPremium) {
            formValues[`appInsProducts[${index}].targetPremium`] = product.targetPremium.toString();
          }
        });

        // Set investment products
        data.appInvProducts.forEach((product:any, index:number) => {
          formValues[`appInvProducts[${index}].fieldIndex`] = index.toString();
          formValues[`appInvProducts[${index}].categoryId`] = product.categoryId?.id.toString();
          formValues[`appInvProducts[${index}].feeTypeId`] = product.feeTypeId?.id.toString();
          formValues[`appInvProducts[${index}].isLumpSum`] = product?.lumpSumDeposit > 0;
          formValues[`appInvProducts[${index}].isRecurring`] = product?.recurringDeposit > 0;
          if (product.lumpSumDeposit) {
            formValues[`appInvProducts[${index}].lumpSumDeposit`] = product.lumpSumDeposit.toString();
          }
          if (product.recurringDeposit) {
            formValues[`appInvProducts[${index}].recurringDeposit`] = product.recurringDeposit.toString();
          }
        });

        // Set all form values at once
        Object.keys(formValues).forEach(key => {
          setValue(key, formValues[key]);
        });

        console.log('formData', formData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching new case:', error);
        setIsLoading(false);
      }
    };

    fetchNewCase();
  }, [selectedRecord, setValue]);

  const onSubmit = async (formData: any) => {
    const newCaseData = new FormData();
    if (formData?.splitAgents?.length > 0) {
      formData.writingAgentId = formData.splitAgents[0].profileId;
    } 

    // Calculate totalAnnualPremium for appInsProducts
    let totalAnnualPremium = 0;
    formData.appInsProducts?.forEach((product: any) => {
      totalAnnualPremium += parseFloat(product.annualPremium || 0);
    });
    //Override it if Universal Life with rider
    if (formData?.monthlyBillingPremium && Number(formData?.monthlyBillingPremium) > 0) {
      totalAnnualPremium = Number(formData?.monthlyBillingPremium) * 12;
    }

    // Calculate totalCoverageFaceAmount/Deposit for appInsProducts and appInvProducts
    let totalCoverageFaceAmount = 0;
    let totalAnnualAUM = 0;
    formData.appInsProducts?.forEach((product: any) => {
      totalCoverageFaceAmount += parseFloat(product.coverageFaceAmount || 0);
    });
    formData.appInvProducts?.forEach((product: any) => {
      totalCoverageFaceAmount += parseFloat(product.deposit || 0);
      totalAnnualAUM += parseFloat(product.annualAUM || 0);
    });

    // Calculate totalEstFieldRevenue for appInsProducts and appInvProducts
    let totalEstFieldRevenue = 0;
    formData.appInsProducts?.forEach((product: any) => {
      totalEstFieldRevenue += parseFloat(product.estFieldRevenue || 0);
    });
    formData.appInvProducts?.forEach((product: any) => {
      totalEstFieldRevenue += parseFloat(product.estFieldRevenue || 0);
    });

    const applicationDocuments = getValues('applicationDocuments')
    const illustrationDocuments = getValues('illustrationDocuments')
    const formDataWithoutFiles = { ...formData, status: 'Pending Review', totalEstFieldRevenue, totalAnnualPremium, totalCoverageFaceAmount};
    delete formDataWithoutFiles.applicationDocuments;
    delete formDataWithoutFiles.illustrationDocuments;
    applicationDocuments?.forEach((file: any) => {
      newCaseData.append(`files.applicationDocuments`, file, file.name);
    });
    illustrationDocuments?.forEach((file: any) => {
      newCaseData.append(`files.illustrationDocuments`, file, file.name);
    });
    newCaseData.append('data', JSON.stringify(formDataWithoutFiles));

    const response = await updateNewCase(selectedRecord.id, newCaseData);
    if (response.status !== 200) {
      setHeading('Error');
      setMessage('An error occurred while trying to update the new case');
      setShowMessageBox(true);
      console.log(response);
      console.log('err');
    } else {
      setHeading('Success');
      setMessage('New case updated successfully');
      setShowMessageBox(true);
      setTimeout(() => {
        setSelectedRecord(null);
      }, 3000);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }
  console.log('formData', formData);
  return (
    <>
      <h3 className="absolute top-[0.8rem] left-[0.8rem] text-xl font-bold">Edit business case</h3>
      <form onSubmit={handleSubmit(onSubmit)} className='relative'>
        <PanelContainer header='Product type and agency' collapse={true}>
          <TypeAgent form={form} currentStep={1} setCurrentStep={setCurrentStep} markComplete={() => console.log('markcomplete')} setSelectedSteps={setSelectedSteps} isEditable={isEditable} columnMode={false}/>
        </PanelContainer>
        <PanelContainer header='Carrier and Applicant' className='mt-4'>
        {formData?.writingAgentId && (
          // <p>hello</p>
          <CarrierApplicant form={form} currentStep={2} setCurrentStep={setCurrentStep} markComplete={() => console.log('markcomplete')} isEditable={isEditable} advisor={formData.writingAgentId}/>
        )}
        </PanelContainer>
        <PanelContainer header='Product' className='mt-4'>
          {((formData?.appInsProducts?.length > 0 )|| formData?.appInvProducts?.length > 0 ) && (
            <Product form={form} currentStep={3} setCurrentStep={setCurrentStep} markComplete={() => console.log('markcomplete')} setSelectedSteps={setSelectedSteps} setStepCompletion={() => {console.log('setStepCompletion')}} isEditable={isEditable}/>
          )}
        </PanelContainer>
        <PanelContainer header="Compliance and Documentation" className='mt-4'>
          <ComplianceDocumentation form={form} currentStep={2} setCurrentStep={setCurrentStep} markComplete={() => console.log('markcomplete')} isEditable={isEditable}/>
        </PanelContainer>
        {isEditable && (
          <PanelContainer header="Review and Submit">
            <div className="flex justify-start items-center space-x-4">
              <LoadingButtonNP className='bg-success w-[10rem]'
                loadingText='Saving...'
                type="submit"
              >
                Save
              </LoadingButtonNP>
              <LoadingButtonNP className='bg-warning w-[10rem]'
                onClick={() => {setSelectedRecord(null)}}
                loadingText='Cancelling...'
              >
                Cancel
              </LoadingButtonNP>
            </div>
          </PanelContainer>
        )}
      </form>
      {showMessageBox && (
        <MessageBox
          heading={heading}
          message={message}
          close={() => setShowMessageBox(false)}
        />
      )}      
    </>
  );
};

export default EditRecord;
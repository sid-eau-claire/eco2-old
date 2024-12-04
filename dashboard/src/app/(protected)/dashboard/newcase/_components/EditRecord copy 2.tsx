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
  const form = useForm();
  const {watch, setValue, getValues, handleSubmit} = form;
  const formData = watch();

  useEffect(() => {
    const fetchNewCase = async () => {
      setIsLoading(true);
      try {
        const response = await getNewCase(selectedRecord.id);
        const data = response.data[0];
        
        // Set form values
        setValue('isSplitAgent', data.splitAgents.length > 1);
        setValue('id', data.id.toString());
        setValue('writingAgentId', data.writingAgentId?.id.toString());
        setValue('caseType', data.caseType);
        setValue('appInfo.carrierId', data.appInfo.carrierId?.id.toString());
        
        // Set split agents
        data.splitAgents.forEach((agent:any, index: number) => {
          setValue(`loadSplitAgents[${index}].profileId`, agent?.profileId?.id.toString());
          setValue(`loadSplitAgents[${index}].referralCode`, agent?.profileId?.referralCode);
          setValue(`loadSplitAgents[${index}].splitingPercentage`, agent.splitingPercentage.toString());
          setValue(`LoadSplitAgents[${index}].found`, "Found");
        });

        // Set application info
        setValue('appInfo.appNumber', data.appInfo.appNumber);
        setValue('appInfo.policyAccountNumber', data.appInfo.policyAccountNumber);
        setValue('appInfo.provinceId', data.appInfo.provinceId?.id.toString());
        setValue('appInfo.type', data.appInfo.type);

        // Set applicants
        data.applicants.forEach((applicant:any, index:number) => {
          setValue(`applicants[${index}].id`, applicant.id.toString());
          setValue(`applicants[${index}].firstName`, applicant.firstName);
          setValue(`applicants[${index}].lastName`, applicant.lastName);
          setValue(`applicants[${index}].dateOfBirth`, applicant.dateOfBirth);
          setValue(`applicants[${index}].gender`, applicant.gender.toLowerCase());
          setValue(`applicants[${index}].isOwner`, applicant.isOwner);
          setValue(`applicants[${index}].isInsured`, applicant.isInsured);
          setValue(`applicants[${index}].smoker`, applicant.smoker);
          setValue(`applicants[${index}].clientId`, applicant.clientId.id.toString());
        });

        // Set insurance products
        data.appInsProducts.forEach((product:any, index:number) => {
          setValue(`appInsProducts[${index}].fieldIndex`, index.toString());
          setValue(`appInsProducts[${index}].productId`, product.productId?.id.toString());
          setValue(`appInsProducts[${index}].productCategory`, product.productCategory?.id.toString());
          setValue(`appInsProducts[${index}].coverageFaceAmount`, product.coverageFaceAmount.toString());
          setValue(`appInsProducts[${index}].annualPremium`, product.annualPremium.toString());
          setValue(`appInsProducts[${index}].estFieldRevenue`, product.estFieldRevenue.toString());
          if (product.targetPremium) {
            setValue(`appInsProducts[${index}].targetPremium`, product.targetPremium.toString());
          }
        });

        // Set investment products
        data.appInvProducts.forEach((product:any, index:number) => {
          setValue(`appInvProducts[${index}].fieldIndex`, index.toString());
          setValue(`appInvProducts[${index}].categoryId`, product.categoryId?.id.toString());
          setValue(`appInvProducts[${index}].feeTypeId`, product.feeTypeId?.id.toString());
          setValue(`appInvProducts[${index}].isLumpSum`, product?.lumpSumDeposit > 0);
          setValue(`appInvProducts[${index}].isRecurring`, product?.recurringDeposit > 0);
          if (product.lumpSumDeposit) {
            setValue(`appInvProducts[${index}].lumpSumDeposit`, product.lumpSumDeposit.toString());
          }
          if (product.recurringDeposit) {
            setValue(`appInvProducts[${index}].recurringDeposit`, product.recurringDeposit.toString());
          }
        });

        // Set other form fields
        setValue('monthlyBillingPremium', data.monthlyBillingPremium?.toString());
        setValue('status', data.status);
        setValue('totalEstFieldRevenue', data.totalEstFieldRevenue?.toString());
        setValue('compliance.analysis', data.compliance.analysis);
        setValue('compliance.disclosure', data.compliance.disclosure);
        setValue('compliance.reason', data.compliance.reason);
        setValue('compliance.QA', data.compliance.QA);
        setValue('estSettledDays', data.estSettledDays?.toString());
        setValue('oldApplicationDocuments', data.applicationDocuments);
        setValue('oldIllustrationDocuments', data.illustrationDocuments);

        // setTimeout(() => {setIsLoading(false)}, 3000);
        console.log('formData', formData)
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
    formData.appInsProducts?.forEach((product: any, index: number) => {
      totalCoverageFaceAmount += parseFloat(product.coverageFaceAmount || 0);
    });
    formData.appInvProducts?.forEach((product: any, index: number) => {
      totalCoverageFaceAmount += parseFloat(product.deposit || 0);
      totalAnnualAUM += parseFloat(product.annualAUM || 0);
      // totalAnnualAUM += parseFloat(product.lumsump || 0);
    });
    
    // Calculate totalEstFieldRevenue for appInsProducts and appInvProducts
    let totalEstFieldRevenue = 0;
    formData.appInsProducts?.forEach((product: any) => {
      totalEstFieldRevenue += parseFloat(product.estFieldRevenue || 0);
    });
    formData.appInvProducts?.forEach((product: any) => {
      totalEstFieldRevenue += parseFloat(product.estFieldRevenue || 0);
    });

    // // Calculate totalEstFieldRevenue for appInvProducts
    // formData.appInvProducts?.forEach((product: any) => {
    //   totalEstFieldRevenue += parseFloat(product.deposit || 0);
    // });

    const applicationDocuments = getValues('applicationDocuments')
    const illustrationDocuments = getValues('illustrationDocuments')
    const formDataWithoutFiles = { ...formData, status: 'Pending Review',totalEstFieldRevenue, totalAnnualPremium, totalCoverageFaceAmount};
    delete formDataWithoutFiles.applicationDocuments;
    delete formDataWithoutFiles.illustrationDocuments;
    applicationDocuments?.forEach((file: any, index: number) => {
      newCaseData.append(`files.applicationDocuments`, file, file.name);
    });
    illustrationDocuments?.forEach((file: any, index: number) => {
      newCaseData.append(`files.illustrationDocuments`, file, file.name);
    });
    newCaseData.append('data', JSON.stringify({
      ...formDataWithoutFiles,
    }))

    // const response = await createNewCase(newCaseData);
    const response = await updateNewCase(selectedRecord.id, newCaseData);
    // const response = await updateNewCase(selectedRecord.id, formData);
    // console.log(response)
    if (response.status != 200) {
      setHeading('Error');
      setMessage('An error occurred while trying to update the new case');
      setShowMessageBox(true);
      console.log(response)
      console.log('err')
    } else {
      setHeading('Success');
      setMessage('New case updated successfully');
      setShowMessageBox(true);
      setTimeout(() => {
        setSelectedRecord(null)
      }, 3000)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }
  // console.log('formData', formData)
  return (
    <>
      <h3 className="absolute top-[0.8rem] left-[0.8rem] text-xl font-bold">Edit business case</h3>
      <form onSubmit={handleSubmit(onSubmit)} className='relative'>
        <PanelContainer header='Product type and agency' collapse={true}>
          <TypeAgent form={form} currentStep={1} setCurrentStep={setCurrentStep} markComplete={() => console.log('markcomplete')} setSelectedSteps={setSelectedSteps} isEditable={isEditable} columnMode={false}/>
        </PanelContainer>
        <PanelContainer header='Carrier and Applicant' className='mt-4'>
        {formData?.writingAgentId && (
          <CarrierApplicant form={form} currentStep={2} setCurrentStep={setCurrentStep} markComplete={() => console.log('markcomplete')} isEditable={isEditable} advisor={formData.writingAgentId}/>
        )}
        </PanelContainer>
        <PanelContainer header='Product' className='mt-4'>
          {(formData?.appInsProducts?.length > 0 || formData?.appInvProducts?.length > 0 ) && (
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
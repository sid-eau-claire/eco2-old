'use client'
import React, { useEffect, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Input, CInput, Select, Switch } from '@/components/Input';
import { ColContainer, RowContainer } from '@/components/Containers';
import {  motion } from 'framer-motion';
import { RoundButton, LoadingButtonNP } from '@/components/Button';
import { getNewCase } from './../_actions/newcase';
import { PanelContainer } from '@/components/Containers';
import {accessWithAuth} from '@/lib/isAuth';
import TypeAgent from './TypeAgent';
import CarrierApplicant from './CarrierApplicant';
import Product from './Product';
import ComplianceDocumentation from './ComplianceDocumentation';
import { MessageBox } from '@/components/Popup';
import { findChanges} from '@/lib/updateRecord'

const EditRecord = ({selectedRecord, setSelectedRecord, isEditable, columnMode}: {selectedRecord: any, setSelectedRecord: any, isEditable?: boolean,  columnMode?: boolean}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [selectedSteps, setSelectedSteps] = React.useState([true, false, false, false, false]);
  const [showMessageBox, setShowMessageBox] = React.useState(false); 
  const [heading, setHeading] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [oldDate, setOldDate] = React.useState<any>(null);
  const form = useForm();
  const {watch, setValue, getValues,  handleSubmit} = form;
  const formData = watch();
  const [type, setType] = React.useState('');
  const [isSplitAgent, setIsSplitAgent] = React.useState(0);  
  
  useEffect(() => {
    const fetchNewCase = async () => {
      const response = await getNewCase(selectedRecord.id);
      console.log('Response:', response);
      const formData = response.data[0];
      if (formData.splitAgents.length > 1) {
        setValue('isSplitAgent', true)
      } else {
        setValue('isSplitAgent', false)
      }
      setValue('id', formData.id);
      setValue('writingAgentId', formData.writingAgentId?.id);
      setValue('caseType', formData.caseType);
      setValue('appInfo.carrierId', formData.appInfo.carrierId?.id);
      formData.splitAgents.map((agent: any, index: number) => {
        setValue(`loadSplitAgents[${index}].profileId`, agent?.profileId?.id);
        setValue(`loadSplitAgents[${index}].referralCode`, agent?.profileId?.referralCode);
        setValue(`loadSplitAgents[${index}].splitingPercentage`, agent.splitingPercentage);
        setValue(`LoadSplitAgents[${index}].found`, "Found");
        // setValue(`splitAgents[${index}].found`, true);
      })
      setValue('appInfo.appNumber', formData.appInfo.appNumber);
      setValue('appInfo.policyAccountNumber', formData.appInfo.policyAccountNumber);
      setValue('appInfo.provinceId', formData.appInfo.provinceId?.id);
      setValue('appInfo.type', formData.appInfo.type);
      setValue('applicants', formData.applicants);
      setValue('appInsProducts', formData.appInsProducts);
      formData.appInsProducts.map((product: any, index: number) => {
        setValue(`appInsProducts[${index}].fieldIndex`, index);
        setValue(`appInsProducts[${index}].productId`, product.productId?.id);
        setValue(`appInsProducts[${index}].productCategory`, product.productCategory?.id);
      })
      setValue('appInvProducts', formData.appInvProducts);
      formData.appInvProducts.map((product: any, index: number) => {
        setValue(`appInvProducts[${index}].fieldIndex`, index);
        setValue(`appInvProducts[${index}].categoryId`, product.categoryId?.id);
        setValue(`appInvProducts[${index}].feeTypeId`, product.feeTypeId?.id);
        if (product?.lumpSumDeposit > 0) {
          setValue(`appInvProducts[${index}].isLumpSum`, true);
        }
        if (product?.recurringDeposit > 0) {
          setValue(`appInvProducts[${index}].isRecurring`, true);
        }        
      })
      setValue('monthlyBillingPremium', formData.monthlyBillingPremium);
      setValue('status', formData.status);
      setValue('totalEstFieldRevenue', formData.totalEstFieldRevenue);
      setValue('compliance.analysis', formData.compliance.analysis);
      setValue('compliance.disclosure', formData.compliance.disclosure);
      setValue('compliance.reason', formData.compliance.reason);
      setValue('compliance.QA', formData.compliance.QA);
      setValue('estSettledDays', formData.estSettledDays);
      setValue('oldApplicationDocuments', formData.applicationDocuments);
      setValue('oldIllustrationDocuments', formData.illustrationDocuments);
      setOldDate(formData);
    };
    fetchNewCase();
  }, [selectedRecord, setValue]);

  // console.log('formData', formData);

  // const onSubmit = async (formData: any) => {
  //   const response = await updateNewCase(selectedRecord.id, formData);
  //   console.log('Response:', response);
  //   setSelectedRecord(null);
  // }

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

  }
  // console.log('EditRecord is called')
  return (
    <>
      <h3 className="absolute top-[0.8rem] left-[0.8rem] text-xl font-bold">Edit business case</h3>
      <form onSubmit={handleSubmit(onSubmit)} className='relative'>
        <PanelContainer header='Product type and agency' collapse={true}>
          <TypeAgent form={form} currentStep={1} setCurrentStep={setCurrentStep} markComplete={()=>console.log('markcomplete')}  setSelectedSteps={setSelectedSteps} isEditable={isEditable} columnMode={false}/>
        </PanelContainer>
        <PanelContainer header='Carrier and Applicant' className='mt-4'>
          {formData?.writingAgentId && (
            <CarrierApplicant form={form} currentStep={2} setCurrentStep={setCurrentStep} markComplete={()=>console.log('markcomplete')} isEditable={isEditable} advisor={formData.writingAgentId}/>
          )}
        </PanelContainer>
        <PanelContainer header='Product' className='mt-4'>
          {(formData?.appInsProducts?.length > 0 || formData?.appInvProducts?.length > 0 ) && (
            <Product form={form} currentStep={3} setCurrentStep={setCurrentStep} markComplete={()=>console.log('markcomplete')}  setSelectedSteps={setSelectedSteps} setStepCompletion={()=>{console.log('setStepCompletion')}} isEditable={isEditable}/>
          )}
        </PanelContainer>
        <PanelContainer header="Compliance and Documentation" className='mt-4'>
          <ComplianceDocumentation form={form} currentStep={2} setCurrentStep={setCurrentStep} markComplete={()=>console.log('markcomplete')} isEditable={isEditable}/>
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
        {/* {isEditable && (
          <div className='absolute top-0 left-0 right-0 bottom-0 bg-transparent z-9'></div>
        )} */}
      </form>
      {showMessageBox && (
        <MessageBox
          heading={heading}
          message={message}
          close={()=>setShowMessageBox(false)}
        />
      )}      
    </>
  )
}

export default EditRecord

'use client'
// Import components
import React, { useEffect } from 'react';
import { Step, StepContainer } from '@/components/Steps';
import { PageContainer } from '@/components/Containers';
import {useForm} from 'react-hook-form';
import TypeAgent from './TypeAgent';
// import Carrier from './Carrier';
// import Applicant from './Applicant';
import InsuranceProduct from './InsuranceProduct'
import Product from './Product';
// import Compliance from './Compliance';
// import Documentation from './Documentation';
import Summary from './Summary';
import { RoundButton } from '@/components/Button';
import { RxReset } from "react-icons/rx";
import {createNewCase} from './../_actions/newcase';
import { MessageBox } from '@/components/Popup';
// import { set } from 'zod';
import {currencyToNumber} from '@/lib/format';
import CarrierApplicant from './CarrierApplicant';
import ComplianceDocumentation from './ComplianceDocumentation'

export default function AddRecord({setShowAddRecord, advisor}: {setShowAddRecord: any, advisor: string}) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [showMessageBox, setShowMessageBox] = React.useState(false); 
  const [heading, setHeading] = React.useState('');
  const [message, setMessage] = React.useState('');
  const form = useForm();
  const { register, handleSubmit, watch, setValue, formState: {errors, isSubmitting}, reset, getValues} =  form
  const formData = getValues();
  const [filteredSteps, setFilteredSteps] = React.useState<any>([]);
  
  const Steps = [
    { title: 'Case Info.', content: TypeAgent },
    { title: 'Provider & Applicant', content: CarrierApplicant },
    // { title: 'Provider', content: Carrier },
    // { title: 'Applicant', content: Applicant },
    { title: 'Product', content: Product },
    // { title: 'Compliance', content: Compliance },
    // { title: 'Doc.', content: Documentation},
    { title: 'Compliance & Doc.', content: ComplianceDocumentation},
    { title: 'Summary', content: Summary },
  ];
  
  // const [selectedSteps, setSelectedSteps] = React.useState([false, false])  ;
  const [selectedSteps, setSelectedSteps] = React.useState(Steps.map((step, index) => true))  ;
  const [stepCompletion, setStepCompletion] = React.useState(Steps.map((step, index) => false)); 
  
  const markStepComplete = (index: number, value: boolean) => {
    console.log('index', index)
    console.log('value', value)
    const newCompletion = [...stepCompletion];
    newCompletion[index] = value;
    setStepCompletion(newCompletion);
  }

  useEffect(() => {
    setFilteredSteps(Steps.filter((step, index) => selectedSteps[index]));
  }, [selectedSteps]);

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

    // include splitAgents into formDataWithoutFiles if splitAgents.length == 0, whne include the item should be {profileId: writingAgentId, splitPercentage: 100}
    if (formData?.splitAgents?.length === 0) {
      formDataWithoutFiles.splitAgents = [{profileId: formData.writingAgentId, splitingPercentage: 100}]
    }
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
    const response = await createNewCase(newCaseData);
    console.log(response)
    if (response.status != 200) {
      setHeading('Error');
      setMessage('An error occurred while trying to create the new case');
      setShowMessageBox(true);
      console.log(response)
      console.log('err')
    } else {
      setHeading('Success');
      setMessage('New case created successfully');
      setShowMessageBox(true);
      setTimeout(() => {
        setShowAddRecord(false)
      }, 1000)
    }
  }
  // console.log(accessWithAuth())
  // console.log('selectedSteps', selectedSteps)
  // console.log('stepCompletion', stepCompletion)
  // console.log('filteredSteps', filteredSteps) 
  console.log('formData', formData) 
  return (
    // <PageContainer pageName="New Business Cases">
    <>
      <form className='relative' onSubmit={handleSubmit(onSubmit)} >
        <div className='absolute top-0 right-0 '>
          <RoundButton
            className='bg-transparent text-warning'
            icon={RxReset}
            type="button"
            hint="Reset the form"
            // onClick={() => {reset(); setCurrentStep(0); setStepCompletion([false, false, false, false, false, false])}}
            onClick={() => {setShowAddRecord(false)}}
          />
        </div>
        {filteredSteps && filteredSteps.length > 0 && (
          <StepContainer currentStep={currentStep} setCurrentStep={setCurrentStep} className="" stepCompletion={stepCompletion}>
            {filteredSteps.map((step: any, index: number) => (
              <Step key={index} stepNumber={index + 1} name={step.title}>
                {React.createElement(step.content, {
                  form, 
                  currentStep, 
                  setCurrentStep,
                  markComplete: (index: number, value: any) => markStepComplete(index, value), // Pass function to mark as complete
                  setSelectedSteps,
                  isEditable: true,
                  advisor
                } as { form: any; currentStep: number; setCurrentStep: any; markComplete: any ; setSelectedSteps: any; advisor: string})}
              </Step>
            ))}
          </StepContainer>
        )}
      </form>
      {showMessageBox && (
        <MessageBox
          heading={heading}
          message={message}
          close={()=>setShowMessageBox(false)}
        />
      )}
    </>
    // </PageContainer>
  );
}

import React from 'react'
import InsuranceProduct from './InsuranceProduct'
import InvestmentProduct from './InvestmentProduct'
import AffiliateProduct from './AffiliateProduct'
const Product =   ({ form, currentStep, setCurrentStep, markComplete,  setSelectedSteps, setStepCompletion, isEditable  }: { form: any, currentStep: number, setCurrentStep: any, markComplete: any,  setSelectedSteps: any,setStepCompletion: any, isEditable?: boolean  }) => {
  const { register, control, setValue, watch, formState: { errors, isSubmitting }, reset } = form;
  const formData = watch();
  // console.log(formData)
  // console.log('currentStep', currentStep)
  return (
    <>
      {formData?.caseType == 'Insurance' && <InsuranceProduct form={form} currentStep={currentStep} setCurrentStep={setCurrentStep} markComplete={markComplete} isEditable={isEditable} />}
      {formData?.caseType == 'Investment' && <InvestmentProduct form={form} currentStep={currentStep} setCurrentStep={setCurrentStep} markComplete={markComplete} isEditable={isEditable} />}
      {formData?.caseType == 'Affiliate' && <AffiliateProduct form={form} currentStep={currentStep} setCurrentStep={setCurrentStep} markComplete={markComplete}  isEditable={isEditable}/>}
    </>
  )
}

export default Product
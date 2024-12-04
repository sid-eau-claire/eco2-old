import React from 'react'
import GenericInsuranceProduct from './Carriers/GenericInsuranceProduct'
import BenevaInsuranceProduct from './Carriers/BenevaInsuranceProduct'
const InsuranceProduct =   ({ form, currentStep, setCurrentStep, markComplete, isEditable }: { form: any, currentStep: number, setCurrentStep: any, markComplete: any, isEditable?: boolean }) => {
  const {getValues, watch} = form
  const formData = watch()
  return (
    <>
      {(formData?.appInfo?.carrierName == "Beneva" ) ? (
        <BenevaInsuranceProduct  form={form} currentStep={currentStep} setCurrentStep={setCurrentStep} markComplete={markComplete} isEditable={isEditable} />
      ):(
        <GenericInsuranceProduct  form={form} currentStep={currentStep} setCurrentStep={setCurrentStep} markComplete={markComplete} isEditable={isEditable} />
      )}
    </>
  )
}

export default InsuranceProduct
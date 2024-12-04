'use client'
import React, { useEffect, useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Input, CInput, Select, Switch } from '@/components/Input';
import { ColContainer, RowContainer } from '@/components/Containers';
import {  motion } from 'framer-motion';
import { RoundButton, LoadingButtonNP } from '@/components/Button';
import { PanelContainer } from '@/components/Containers';
import {accessWithAuth} from '@/lib/isAuth';
import TypeAgent from './TypeAgent';
import CarrierApplicant from './CarrierApplicant';
import Product from './Product';
import ComplianceDocumentation from './ComplianceDocumentation';
import { MessageBox } from '@/components/Popup';
import {useRouter} from 'next/navigation';

const CaseSummary =   ({ form, currentStep, setCurrentStep, markComplete, isEditable }: { form: any, currentStep: number, setCurrentStep: any, markComplete: any, isEditable?: boolean }) => {
  const { getValues, handleSubmit } = form;
  const formData = getValues();
  const router = useRouter();

  // const [currentStep, setCurrentStep] = React.useState(0);
  const [selectedSteps, setSelectedSteps] = React.useState([true, false, false, false, false]);
  const [showMessageBox, setShowMessageBox] = React.useState(false); 
  const [heading, setHeading] = React.useState('');
  const [message, setMessage] = React.useState('');  
  // const form = useForm();
  // const {watch, setValue, getValues,  handleSubmit} = form;
  // const formData = watch();
  const [type, setType] = React.useState('');
  const [isSplitAgent, setIsSplitAgent] = React.useState(0);  


  console.log('formData', formData);



  return (
    <>
      <h3 className="absolute top-[0.8rem] left-[0.8rem] text-xl font-bold">Edit business case</h3>
      <div className='relative'>
        <PanelContainer header='Product type and agency' collapse={true}>
          <TypeAgent form={form} currentStep={1} setCurrentStep={setCurrentStep} markComplete={()=>console.log('markcomplete')}  setSelectedSteps={setSelectedSteps} isEditable={isEditable} columnMode={false}/>
        </PanelContainer>
        <PanelContainer header='Carrier and Applicant' className='mt-4'>
          <CarrierApplicant form={form} currentStep={2} setCurrentStep={setCurrentStep} markComplete={()=>console.log('markcomplete')} isEditable={isEditable} advisor="1"/>
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
                Submit
              </LoadingButtonNP>
              <LoadingButtonNP className='bg-warning w-[10rem]'
                // onClick={() => {setSelectedRecord(null)}}
                onClick={() => {router.push('/dashboard/mybusiness/newcase')}}
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
      </div>
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

export default CaseSummary

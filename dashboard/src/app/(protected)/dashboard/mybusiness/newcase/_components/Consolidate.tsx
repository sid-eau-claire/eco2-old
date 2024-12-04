// Import components
import React, { useEffect, useState } from 'react';
import { Step, StepContainer } from '@/components/Steps';
import { useForm, FormProvider } from 'react-hook-form';
import TypeAgent from './TypeAgent';
import CarrierApplicant from './CarrierApplicant';
import Product from './Product';
import ComplianceDocumentation from './ComplianceDocumentation';
import Summary from './Summary';
import { RoundButton } from '@/components/Button';
import { RxReset } from "react-icons/rx";
import { createNewCase } from './../_actions/newcase';
import { MessageBox } from '@/components/Popup';
import { currencyToNumber } from '@/lib/format';

// Define the Step interface
interface Step {
  title: string;
  content: React.ComponentType<any>;
}

// Define the form data type
interface FormData {
  [key: string]: any;
}

export default function SomePage({ setShowAddRecord }: { setShowAddRecord: any }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [heading, setHeading] = useState('');
  const [message, setMessage] = useState('');
  const formMethods = useForm<FormData>();
  const { handleSubmit, getValues, setValue, watch, reset, formState: { errors, isSubmitting } } = formMethods;
  const formData = getValues();
  const [filteredSteps, setFilteredSteps] = useState<Step[]>([]);

  const Steps: Step[] = [
    { title: 'Case Info.', content: TypeAgent },
    { title: 'Provider & Applicant', content: CarrierApplicant },
    { title: 'Product', content: Product },
    { title: 'Compliance & Doc.', content: ComplianceDocumentation },
    { title: 'Summary', content: Summary },
  ];

  const [selectedSteps, setSelectedSteps] = useState(Steps.map(() => true));
  const [stepCompletion, setStepCompletion] = useState(Steps.map(() => false));

  const markStepComplete = (index: number, value: boolean) => {
    const newCompletion = [...stepCompletion];
    newCompletion[index] = value;
    setStepCompletion(newCompletion);
  };

  useEffect(() => {
    setFilteredSteps(Steps.filter((_, index) => selectedSteps[index]));
  }, [selectedSteps]);

  const onSubmit = async (formData: FormData) => {
    const newCaseData = new FormData();
    if (formData.splitAgents?.length > 0) {
      formData.writingAgentId = formData.splitAgents[0].profileId;
    }

    // Calculate totalAnnualPremium for appInsProducts
    let totalAnnualPremium = 0;
    formData.appInsProducts?.forEach((product: any) => {
      totalAnnualPremium += parseFloat(product.annualPremium || 0);
    });

    // Override it if Universal Life with rider
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

    const applicationDocuments = getValues('applicationDocuments');
    const illustrationDocuments = getValues('illustrationDocuments');
    const formDataWithoutFiles = { ...formData, status: 'Pending Review', totalEstFieldRevenue, totalAnnualPremium, totalCoverageFaceAmount };
    // delete formDataWithoutFiles.applicationDocuments;
    // delete formDataWithoutFiles.illustrationDocuments;
    applicationDocuments?.forEach((file: any) => {
      newCaseData.append('files.applicationDocuments', file, file.name);
    });
    illustrationDocuments?.forEach((file: any) => {
      newCaseData.append('files.illustrationDocuments', file, file.name);
    });
    newCaseData.append('data', JSON.stringify(formDataWithoutFiles));

    const response = await createNewCase(newCaseData);
    if (response.status !== 200) {
      setHeading('Error');
      setMessage('An error occurred while trying to create the new case');
      setShowMessageBox(true);
    } else {
      setHeading('Success');
      setMessage('New case created successfully');
      setShowMessageBox(true);
      setTimeout(() => {
        setShowAddRecord(false);
      }, 1000);
    }
  };

  return (
    <>
      <FormProvider {...formMethods}>
        <form className="relative" onSubmit={handleSubmit(onSubmit)}>
          <div className="absolute top-0 right-0">
            <RoundButton
              className="bg-transparent text-warning"
              icon={RxReset}
              type="button"
              hint="Reset the form"
              onClick={() => { setShowAddRecord(false); }}
            />
          </div>
          {filteredSteps.length > 0 && (
            <StepContainer currentStep={currentStep} setCurrentStep={setCurrentStep} stepCompletion={stepCompletion}>
              {filteredSteps.map((step, index) => (
                <Step key={index} stepNumber={index + 1} name={step.title}>
                  {React.createElement(step.content, {
                    form: formMethods,
                    currentStep,
                    setCurrentStep,
                    markComplete: (value: boolean) => markStepComplete(index, value),
                    setSelectedSteps,
                  })}
                </Step>
              ))}
            </StepContainer>
          )}
        </form>
      </FormProvider>
      {showMessageBox && (
        <MessageBox
          heading={heading}
          message={message}
          close={() => setShowMessageBox(false)}
        />
      )}
    </>
  );
}

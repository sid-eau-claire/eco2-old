'use client'
import React, { useEffect, useRef } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Input, Select, Switch } from '@/components/Input';
import { ColContainer, RowContainer } from '@/components/Containers';
import { motion } from 'framer-motion';
import { FilesInput } from '@/components/Input';
import { ImageGallery } from '@/components/Image';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const DocumentUploadForm = ({ form, currentStep, setCurrentStep, markComplete, isEditable }: { form: any, currentStep: number, setCurrentStep: any, markComplete: any, isEditable?: boolean }) => {
  const { register, control, setValue, watch, formState: { errors, isSubmitting }, reset } = form;
  const completionRef = useRef(false);
  const docFormData = watch(['applicationDocuments', 'illustrationDocuments']);
  const [isComplianceComplete, setIsComplianceComplete] = React.useState(false);
  const [isDocumentUploadComplete, setIsDocumentUploadComplete] = React.useState(false);
  const [duplicateAlert, setDuplicateAlert] = React.useState<string | null>(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'compliance.QA'
  });

  const formData = watch();

  const checkForDuplicates = (newFiles: File[], existingFiles: File[]) => {
    const duplicates = newFiles.filter(newFile => 
      existingFiles.some(existingFile => 
        existingFile.name === newFile.name && existingFile.size === newFile.size
      )
    );
    return duplicates;
  };

  const handleFileUpload = (files: File[], fieldName: string) => {
    // Get the most up-to-date form data
    const currentFormData = watch();
    
    // Combine all existing files from both fields
    const allExistingFiles = [
      ...(currentFormData.applicationDocuments || []),
      ...(currentFormData.illustrationDocuments || [])
    ];
  
    const duplicates = checkForDuplicates(files, allExistingFiles);
    
    console.log('All existing files:', allExistingFiles);
    console.log('New files:', files);
    console.log('Duplicates:', duplicates);
    
    if (duplicates.length > 0) {
      console.log('Duplicates found:', duplicates);
      setDuplicateAlert(`Duplicate file(s) detected: ${duplicates.map(f => f.name).join(', ')}`);
      // Remove duplicates from the files array
      const uniqueFiles = files.filter(file => !duplicates.includes(file));
      setValue(fieldName, [...(currentFormData[fieldName] || []), ...uniqueFiles]);
    } else {
      setValue(fieldName, [...(currentFormData[fieldName] || []), ...files]);
    }
  };

  useEffect(() => {
    if (docFormData.applicationDocuments?.length > 0 && docFormData.illustrationDocuments?.length > 0) {
      markComplete(currentStep, true);
    }
  }, [docFormData, markComplete]);

  useEffect(() => {
    setIsComplianceComplete(formData?.compliance?.analysis && formData?.compliance?.reason && formData?.compliance?.disclosure && formData?.compliance?.QA.every((qa: any) => qa.answer != ''));
    const isComplete = isComplianceComplete && isDocumentUploadComplete;
    if (isComplete && !completionRef.current && !duplicateAlert) { 
      completionRef.current = true;
      markComplete(currentStep, true);
    } else if (!isComplete && completionRef.current) {
      completionRef.current = false;
      markComplete(currentStep, false);
    } 
  }, [formData, isComplianceComplete, isDocumentUploadComplete]);  

  useEffect(() => {
    const questions = [
      "What is the purpose of this insurance sale?",
      "How was the coverage determined or calculated?"
    ];
    questions.forEach((question, index) => {
      setValue(`compliance.QA[${fields.length + index}].question`, question);
    });
  }, [fields.length, setValue]);

  return (
    <ColContainer cols="1:1:1:1" className='min-w-[25rem]'>
      {duplicateAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{duplicateAlert}</AlertDescription>
        </Alert>
      )}
      <ColContainer cols="3:3:3:1" className='min-w-[25rem]'>
        <RowContainer className='col-span-1'>
          <h3 className="text-lg font-semibold mb-4">Confirm compliances</h3>
          <Switch
            label="Analysis Completed?"
            name="compliance.analysis"
            isChecked={formData?.compliance?.analysis}
            register={register}
            isEditable={isEditable}
          />
          <Switch
            label="Reason Documented?"
            name="compliance.reason"
            isChecked={formData?.compliance?.reason}
            register={register}
            isEditable={isEditable}
          />
          <Switch
            label="Disclosure Provided?"
            name="compliance.disclosure"
            isChecked={formData?.compliance?.disclosure}
            register={register}
            isEditable={isEditable}
          />
        </RowContainer>
        {formData?.compliance?.analysis && formData?.compliance?.reason && formData?.compliance?.disclosure && (
          <RowContainer className='col-span-2'>
            <h3 className="text-lg font-semibold mb-4">QA Questions</h3>
            {formData?.caseType == 'Insurance' && (
              <>
                <div className="flex flex-col space-y-2 bg-transparent">
                  <Input
                    label="Question"
                    name={`compliance.QA[0].question`}
                    type="text"
                    register={register}
                    required={true}
                    errors={errors}
                    defaultValue="What is the purpose of this insurance sale?"
                    isEditable={isEditable}
                    focus={false}
                  />
                  <Input
                    label="Answer"
                    name={`compliance.QA[0].answer`}
                    type="text"
                    register={register}
                    required={true}
                    errors={errors}
                    isEditable={isEditable}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Input
                    label="Question"
                    name={`compliance.QA[1].question`}
                    type="text"
                    register={register}
                    required={true}
                    errors={errors}
                    defaultValue="How was the coverage determined or calculated?"
                    isEditable={isEditable}
                    focus={false}
                  />
                  <Input
                    label="Answer"
                    name={`compliance.QA[1].answer`}
                    type="text"
                    register={register}
                    required={true}
                    errors={errors}
                    isEditable={isEditable}
                  />
                </div>
              </>
            )}
            {formData?.caseType == 'Investment' && (
              <>
                <Input
                  label="Question"
                  name={`compliance.QA[0].question`}
                  type="hidden"
                  register={register}
                  required={true}
                  errors={errors}
                  defaultValue="What is the purpose of this insurance sale?"
                  isEditable={isEditable}
                />
                <Select
                  label="Investment Objective Tolerance"
                  name={`compliance.QA[0].answer`}
                  register={register}
                  required={true}
                  errors={errors}
                  isEditable={isEditable}
                  defaultValue="Select Objective"
                  options={[
                    { id: 'Growth', name: 'Growth' },
                    { id: 'Income', name: 'Income' }
                  ]}
                />
                <Input
                  label="Question"
                  name={`compliance.QA[1].question`}
                  type="hidden"
                  register={register}
                  required={true}
                  errors={errors}
                  defaultValue="How was the coverage determined or calculated?"
                  isEditable={isEditable}
                />              
                <Select
                  label="Investment Risk Tolerance"
                  name={`compliance.QA[1].answer`}
                  register={register}
                  required={true}
                  errors={errors}
                  isEditable={isEditable}
                  defaultValue="Select Risk Tolerance"
                  options={[
                    { id: 'High', name: 'High' },
                    { id: 'Medium', name: 'Medium' },
                    { id: 'Low', name: 'Low' }
                  ]}
                />
              </>
            )}          
          </RowContainer>
        )}
      </ColContainer>
      {isComplianceComplete && (
        <RowContainer className="grid grid-cols-2 mt-2 space-x-4">
          <div>
            <FilesInput
              label="Application Documents"
              name="applicationDocuments"
              setValue={(name, files) => handleFileUpload(files, name)}
              defaultValue={docFormData.applicationDocuments} 
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              multiple={true}
              errors={errors}
              required={false}
              isEditable={isEditable}
            />
            {formData?.oldApplicationDocuments && (
              <ImageGallery images={formData?.oldApplicationDocuments}/>
            )}
          </div>
          <div>
            {(formData?.caseType == 'Insurance' || formData?.caseType == 'Investment') && (
              <>
                <FilesInput
                  label="Illustration Documents"
                  name="illustrationDocuments"
                  setValue={(name, files) => handleFileUpload(files, name)}
                  defaultValue={docFormData.illustrationDocuments} 
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                  multiple={true}
                  errors={errors}
                  required={false}
                  isEditable={isEditable}
                />
                {formData?.oldIllustrationDocuments && (
                  <ImageGallery images={formData?.oldIllustrationDocuments}/>
                )}              
              </>
            )}
          </div>
        </RowContainer>
      )}
      {isEditable && (
        <RowContainer>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            className='bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
            onClick={() => markComplete(currentStep, true)}
          >
            Upload Documents
          </motion.button>
        </RowContainer>
      )}
    </ColContainer>
  );
};

export default DocumentUploadForm;
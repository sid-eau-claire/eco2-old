'use client'
import React, {useState} from 'react';
import { useForm } from 'react-hook-form';
import { Input, FileInput } from '@/components/Input'; // Assuming FileInput is your file upload component
import LoadingButton from '@/components/Button/LoadingButton';
import { CarrierType } from '@/types/carrier';
import { motion } from 'framer-motion';
interface ContractingFormProps {
    proofs: Array<{ type: string; proof: string }>;
    questions: Array<{ type: string; question: string }>;
}

const ContractingForm = ({ carrier }: {carrier: CarrierType}) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [formData, setFormData] = useState<ContractingFormProps>(carrier?.contracting);
  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <motion.div className='flex flex-col justify-center items-center mx-4 my-8'
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, type: 'spring', bounce: 0.45 }}    
    >
      {/* <h3 className="text-2xl font-bold text-center mb-4">Contracting</h3> */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-whiten p-4 ">
        <div className="space-y-2">
          {formData?.questions?.map((question, index) => (
            <div key={index} className="flex flex-col">
              {/* <label className="text-gray-700">{question.question}</label> */}
              <Input
                label={question.question}
                type="checkbox"
                name={`question_${index}`}
                register={register}
                errors={errors[`question_${index}`]}
                // Assuming Input can handle type="checkbox" and adapts accordingly
              />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {formData?.proofs?.map((proof, index) => (
            <div key={index} className="flex flex-col">
              {/* <label className="text-gray-700">{proof.proof}</label> */}
              <FileInput
                label={proof.proof}
                name={`proof_${index}`}
                register={register}
                errors={errors[`proof_${index}`]}
              />
            </div>
          ))}
        </div>

        <LoadingButton  className="mt-4 px-8 py-2 bg-primary/80 text-whiten  rounded hover:bg-blue-700"
          onClick={handleSubmit(onSubmit)}
        >
          Submit
        </LoadingButton>
      </form>
    </motion.div>
  );
};

export default ContractingForm;

'use client'
import React from 'react';
import { ProfileSchema } from "@/types/profile";
import { z } from 'zod';
import { Input} from '@/components/Input';
import {PanelContainer} from '@/components/Containers';

// Assuming bankingInformationSchema is imported or defined here
const bankingInformationSchema = z.object({
  id: z.string(),
  institutionNumber: z.string().optional().nullable(),
  transitNumber: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
});

type BankingInformationType = z.infer<typeof bankingInformationSchema>;

const BankingInformation = ({ formData,  active, isEditable, handleToggle, form }: { formData: ProfileSchema,  active: boolean, isEditable: boolean, handleToggle: any, form:any }) => {
  const { register, formState: { errors } } = form;
  const header = 'Banking Information';

  return (
    <PanelContainer header={header} defaultActive={active} collapse={false} className=''>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        <input type="hidden" name="bankingInformation.id" {...register("bankingInformation.id")} value={formData.bankingInformation?.id} />
        <Input
          label="Account Number"
          name="bankingInformation.accountNumber"
          register={register} // Assuming 'register' is from useForm() hook of react-hook-form
          placeholder="Enter account no"
          isEditable={isEditable}
          errors={errors.bankingInformation?.accountNumber}
        />

        <Input
          label="Institution Number"
          name="bankingInformation.institutionNumber"
          register={register} // Assuming 'register' is from useForm() hook of react-hook-form
          placeholder="Enter institution no"
          isEditable={isEditable}
          errors={errors.bankingInformation?.institutionNumber}
        />

        <Input
          label="Transit Number"
          name="bankingInformation.transitNumber"
          register={register} // Assuming 'register' is from useForm() hook of react-hook-form
          placeholder="Enter transit no"
          isEditable={isEditable}
          errors={errors.bankingInformation?.transitNumber}
        />
      </div>
    </PanelContainer>
  );
};

export default BankingInformation;
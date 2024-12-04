'use client'
import React from 'react';
import { ProfileSchema } from "@/types/profile";
import { Input} from '@/components/Input';
import {PanelContainer} from '@/components/Containers';


const BeneficiaryInfo = ({ formData, active, isEditable, handleToggle, form }: { formData: ProfileSchema,  active: boolean, isEditable: boolean, handleToggle: any, form:any }) => {
  const { register, formState: { errors } } = form;
  const header = 'Beneficiary Information';

  return (
    <PanelContainer header={header} defaultActive={active} collapse={false} className=''>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        {/* Beneficiary's First Name */}
        <input type="hidden" name="beneficiary.id" {...register("beneficiary.id")} value={formData.beneficiary?.id} />
        <Input
          label="First Name"
          name="beneficiary.firstName"
          register={register}
          placeholder="Enter first name"
          isEditable={isEditable}
          errors={errors.beneficiary?.firstName}
          type="text"
        />

        {/* Beneficiary's Last Name */}
        <Input
          label="Last Name"
          name="beneficiary.lastName"
          register={register}
          placeholder="Enter last name"
          isEditable={isEditable}
          errors={errors.beneficiary?.lastName}
          type="text"
        />

        {/* Beneficiary's Home Phone */}
        <Input
          label="Home Phone"
          name="beneficiary.homePhone"
          register={register}
          placeholder="Enter home phone"
          isEditable={isEditable}
          errors={errors.beneficiary?.homePhone}
          type="tel"
          form={form}
        />

        {/* Beneficiary's Mobile Phone */}
        <Input
          label="Mobile Phone"
          name="beneficiary.mobilePhone"
          register={register}
          placeholder="Enter mobile phone"
          isEditable={isEditable}
          errors={errors.beneficiary?.mobilePhone}
          type="tel"
          form={form}
        />
      </div>
      {errors.beneficiaryId && <p className="text-danger text-sm text-right">{errors.beneficiaryId.message}</p>}
    </PanelContainer>
  );
};

export default BeneficiaryInfo;

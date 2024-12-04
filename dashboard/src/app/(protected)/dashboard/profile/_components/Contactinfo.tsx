'use client'
import React, {useEffect} from 'react';
import { useState } from 'react';
import { ProfileSchema } from "@/types/profile";
import { normalize } from '@/lib/format';
import { Input, Select} from '@/components/Input';
import {PanelContainer} from '@/components/Containers'
import { fetchProvinces} from '@/lib/strapi';

type Province = {
  id: number,
  name: string,
}

const ContactInfo = ({ formData,  active, isEditable, handleToggle, form }: { formData: ProfileSchema, active: boolean, isEditable: boolean, handleToggle: any, form:any }) => {
  const { register, formState: { errors } } = form;
  const header = 'Contact Information';
  
  const [provinces, setProvinces] = useState<Province[]>([]);
  useEffect(() => {
  fetchProvinces().then(provinces => {setProvinces(provinces.data) });
  }, []);
  // console.log(provinces)
  // console.log(formData)
  return (
    <PanelContainer header={header} defaultActive={active} collapse={false} className=''>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        {/* Conditional rendering based on field presence in formData */}
        {'mobilePhone' in formData && (
          <Input
            label="Mobile Phone"
            name="mobilePhone"
            register={register} // Assuming register is a function from react-hook-form
            placeholder="Enter mobile phone"
            isEditable={isEditable}
            errors={errors.mobilePhone}
            type="tel"
            form={form}
          />
        )}

        {'homePhone' in formData && (
          <Input
            label="Home Phone"
            name="homePhone"
            register={register}
            placeholder="Enter home phone"
            isEditable={isEditable}
            errors={errors.homePhone}
            type="tel"
            form={form}
          />
        )}

        {'officePhone' in formData && (
          <Input
            label="Office Phone"
            name="officePhone"
            register={register}
            placeholder="Enter office phone"
            isEditable={isEditable}
            errors={errors.officePhone}
            type="tel"
            form={form}
          />
        )}
        <div className="mb-3.5">
        </div>
        {formData?.homeAddress && 'id' in formData?.homeAddress && (
          <input type="hidden" name="homeAddress.id" {...register("homeAddress.id")} value={formData.homeAddress?.id} />
        )}
        {formData?.homeAddress && 'provinceId' in formData?.homeAddress && (
          <Select
            label="Home Province"
            name="homeAddress.provinceId.id"
            register={register}
            value={formData.homeAddress.provinceId.id}
            options={provinces && provinces as {id: number, name: string}[]}
            isEditable={isEditable}
            errors={errors.homeAddress}
          />
        )}
        {formData?.homeAddress && 'city' in formData?.homeAddress && (
          <Input
            label="Home City"
            name="homeAddress.city"
            register={register}
            placeholder="Enter home city"
            isEditable={isEditable}
            errors={errors.homeAddress?.city}
          />
        )}          
        {formData?.homeAddress && 'address' in formData?.homeAddress && (
          <Input
            label="Home Address"
            name="homeAddress.address"
            register={register}
            placeholder="Enter home address"
            isEditable={isEditable}
            errors={errors.homeAddress?.address}
          />
        )}
        {formData?.mailAddress && 'id' in formData?.mailAddress && (
          <input type="hidden" name="homeAddress.id" {...register("mailAddress.id")} value={formData.mailAddress?.id} />
        )}
        {formData?.mailAddress && 'provinceId' in formData?.mailAddress && (
          <Select
            label="Mail Province"
            name="mailAddress.provinceId.id"
            value={formData.mailAddress.provinceId.id}
            options={provinces && provinces as {id: number, name: string}[]}
            register={register}
            isEditable={isEditable}
            errors={errors.mailAddress?.provinceId}
          />
        )}
        {formData?.mailAddress && 'city' in formData?.mailAddress && (
          <Input
            label="Mail City"
            name="mailAddress.city"
            register={register}
            placeholder="Enter mail city"
            isEditable={isEditable}
            errors={errors.mailAddress?.city}
          />
        )}
        {formData?.mailAddress && 'address' in formData?.mailAddress  && (
          <Input
            label="Mail Address"
            name="mailAddress.address"
            register={register}
            placeholder="Enter mail address"
            isEditable={isEditable}
            errors={errors.mailAddress?.address}
          />
        )}
        {formData?.homeAddress && 'postalCode' in formData?.homeAddress && (
          <Input
            label="Home Postal Code"
            name="homeAddress.postalCode"
            register={register}
            placeholder="Enter home postal code"
            isEditable={isEditable}
            errors={errors.homeAddress?.postalCode}
          />
        )}
        {formData?.mailAddress && 'postalCode' in formData?.mailAddress && (
          <Input
            label="Mail Postal Code"
            name="mailAddress.postalCode"
            register={register}
            placeholder="Enter mail postal code"
            isEditable={isEditable}
            errors={errors.mailAddress?.postalCode}
          />
        )}
      </div>
    </PanelContainer>
  );
};

export default ContactInfo;

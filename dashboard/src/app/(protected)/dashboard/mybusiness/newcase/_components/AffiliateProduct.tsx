'use client';
import React, {useEffect, useRef} from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Input, Select } from '@/components/Input';
import { ColContainer, RowContainer } from '@/components/Containers';
import { RoundButton } from '@/components/Button';
import { MdAddCircle } from "react-icons/md";
import { IoCloseCircle } from "react-icons/io5";

const AffiliateProduct =   ({ form, currentStep, setCurrentStep, markComplete, isEditable }: { form: any, currentStep: number, setCurrentStep: any, markComplete: any, isEditable?: boolean  }) => {
  const { register, control, setValue, watch, getValues, formState: { errors, isSubmitting }, reset, trigger } = form;
  const formData = watch();
  const completionRef = useRef(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'appAffiliateProducts'
  });

  React.useEffect(() => {
    if (fields.length == 0) {
      handleAddProduct();
    }
  }, [append, fields.length]);

  const handleAddProduct = () => {
    append({
      referralType: '',
      affiliateVendor: '',
      numberOfApplicants: 1
    });
  };
  useEffect(() => {
    if (formData?.appAffiliateProducts?.length > 0) {
      const allFieldsFilled = formData?.appAffiliateProducts.every((field: any) => 
        field.affiliateVendor !== '' &&
        field.numberOfApplicants > 0 &&
        field.referralType !== ''
      );
      console.log('allFieldsFilled', allFieldsFilled)
      console.log('completionRef.current', completionRef.current)
      if (allFieldsFilled && !completionRef.current) {
        completionRef.current = true;
        markComplete(currentStep, true);
      } else if (!allFieldsFilled && completionRef.current) {
        completionRef.current = false;
        markComplete(currentStep, false);
      }
    }
  // }, [fields.map((field:any, index:number ) => getValues(`appInsProducts[${index}]`))]);
  }, [formData]);
  // console.log('formData', formData)
  return (
    <ColContainer cols="1:1:1:1">
      {fields.map((field, index) => (
        <RowContainer key={field.id} className='relative'>
          <div className='absolute top-[-1.5rem] right-[-1.5rem]'>
            <RoundButton
              icon={IoCloseCircle}
              className="bg-transparent text-danger p-2 rounded-md"
              onClick={() => remove(index)}
              hint="Remove this product"
            />
          </div>
          <div className='flex flex-row justify-start items-center space-x-8'>
            <Select
              label="Affiliate Vendor"
              name={`appAffiliateProducts[${index}].affiliateVendor`}
              register={register}
              options={[{ name: "Select Vendor", id: "" },  {name: "Sheldon Brow", id: "Sheldon Brow" }]}
              required={true}
            />
            <Select
              label="Referral Type"
              name={`appAffiliateProducts[${index}].referralType`}
              register={register}
              options={[
                "Legal Services", "Wills & Power of Attorney", "Mortgages", "Debt Consolidation",
                "Home & Auto", "Commercial & General Liability", "Family & Corp Mediation",
                "Accounting & Bookkeeping", "Foreign Exchange", "Pet Insurance"
              ].map(option => ({ name: option, id: option }))}
              required={true}
            />
            <Input
              label="Number Of Applicants"
              name={`appAffiliateProducts[${index}].numberOfApplicants`}
              type="number"
              register={register}
              required={true}
            />
          </div>
        </RowContainer>
      ))}
      <RoundButton
        icon={MdAddCircle}
        className="bg-transparent text-primary px-4 py-2 rounded-md"
        onClick={handleAddProduct}
        hint="Add another product"
      />
    </ColContainer>
  );
};

export default AffiliateProduct;

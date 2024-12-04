'use client'
import React from 'react';
import { ProfileSchema } from "@/types/profile";
import { number } from 'zod';
import { Input, Select} from '@/components/Input';
import {PanelContainer} from '@/components/Containers';

const SubscriptionSettings = ({ formData,active, isEditable, handleToggle, form }: { formData: ProfileSchema, active: boolean, isEditable: boolean, handleToggle: any, form:any }) => {
  const { register, formState: { errors } } = form;
  const header = 'Subscription Settings';

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   const nameParts = name.split('.');

  //   if (nameParts.length === 2) {
  //     const [parentKey, childKey] = nameParts;
  //     setFormData((prevFormData: ProfileSchema) => ({
  //       ...prevFormData,
  //       [parentKey]: {
  //         ...prevFormData[parentKey as keyof typeof prevFormData],
  //         [childKey]: value,
  //       },
  //     }));
  //   } else {
  //     setFormData({ ...formData, [name]: value });
  //   }
  // };
  return (
    <PanelContainer header={header} defaultActive={active} collapse={false} className=''>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        {/* Subscription Settings Fields */}
        {formData?.subscriptionSetting && 'id' in formData?.subscriptionSetting && (
          // <input type="hidden" name="subscriptionSetting.id" ref={register} defaultValue={formData.subscriptionSetting?.id} />
          <input type="hidden" name="subscriptionSetting.id" {...register("subscriptionSetting.id")} value={formData.subscriptionSetting?.id} />
        )}
        {formData?.subscriptionSetting && 'stripeCustomerId' in formData?.subscriptionSetting && (
          <Input
            label="Stripe Customer ID"
            name="subscriptionSetting.stripeCustomerId"
            register={register}
            // defaultValue={formData.subscriptionSetting?.stripeCustomerId || ''}
            // onChange={handleChange}
            placeholder="Stripe Customer ID"
            isEditable={isEditable}
            errors={errors.subscriptionSetting?.stripeCustomerId}
          />
        )}

        {formData?.subscriptionSetting && 'cardBrand' in formData?.subscriptionSetting && (
          <Input
            label="Card Brand"
            name="subscriptionSetting.cardBrand"
            register={register}
            // defaultValue={formData.subscriptionSetting?.cardBrand || ''}
            // onChange={handleChange}
            placeholder="Card Brand"
            isEditable={isEditable}
            errors={errors.subscriptionSetting?.cardBrand}
          />
        )}

        {formData?.subscriptionSetting && 'cardLastFour' in formData?.subscriptionSetting && (
          <Input
            label="Card Last Four Digits"
            name="subscriptionSetting.cardLastFour"
            register={register}
            // defaultValue={formData.subscriptionSetting?.cardLastFour || ''}
            // onChange={handleChange}
            placeholder="Last Four Digits"
            isEditable={isEditable}
            errors={errors.subscriptionSetting?.cardLastFour}
            type="tel"
          />
        )}

        {/* {formData?.subscriptionSetting && 'stripeSubscriptionPlanId' in formData?.subscriptionSetting && (
          <Input
            label="Stripe Subscription Plan ID"
            name="subscriptionSetting.stripeSubscriptionPlanId"
            register={register}
            // defaultValue={formData.subscriptionSetting?.stripeSubscriptionPlanId || ''}
            // onChange={handleChange}
            placeholder="Stripe Subscription Plan ID"
            isEditable={isEditable}
            errors={errors.subscriptionSetting?.stripeSubscriptionPlanId}
          />
        )} */}
      </div>
    </PanelContainer>
  );
};

export default SubscriptionSettings;


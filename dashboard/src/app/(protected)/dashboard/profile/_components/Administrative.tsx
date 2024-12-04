'use client'
import React from 'react';
import { z } from 'zod';
import { Input, Switch} from '@/components/Input';
import {PanelContainer, ColContainer} from '@/components/Containers';
import { isMe} from '@/lib/isAuth';
import { PopupComponent } from '@/components/Popup';
import Network from './Network'
import {LoadingButtonNP} from '@/components/Button';

// Schema for administrative information
const administrativeSchema = z.object({
  id: z.number(),
  fundCode: z.string().nullable(),
  escrow: z.boolean(),
  escrowHoldPercent: z.number().nullable(),
  minimumPayoutRequired: z.number(),
  blockCommission: z.boolean(),
  blockLogin: z.boolean(),
  deactivate: z.boolean(),
  overrideCommission: z.boolean(),
  CommissionOverrideFraction: z.number().nullable(),
  Notes: z.string().nullable(),
  deactivateDate: z.string().nullable(),
});

type AdministrativeType = z.infer<typeof administrativeSchema>;

const Administrative = ({
  formData,
  // setFormData,
  active,
  isEditable,
  form,
  handleToggle
}: {
  formData: any,
  // setFormData: any,
  active: boolean,
  isEditable: boolean,
  form:any
  handleToggle: any
}) => {
  const { register, formState: { errors } } = form;
  const header = 'Administrative Information';
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [isShowNetworkPopup, setIsShowNetworkPopup] = React.useState<boolean>(false);
  React.useEffect(() => {
    isMe(['Superuser']).then((res) => setIsAdmin(res))
  }, [])


  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value, type, checked } = e.target;
  //   setFormData((prevFormData: any) => ({
  //     ...prevFormData,
  //     administrative: {
  //       ...prevFormData.administrative,
  //       [name]: type === 'checkbox' ? checked : value, 
  //     },
  //   }));
  // };

  return (
    <>
      {isAdmin && (
        <PanelContainer header={header} defaultActive={active} collapse={true} className=''>
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2"> */}
          <ColContainer cols='2:2:2:1' className='items-center'>
            <Input
              label="Fund Code"
              name="administrative.fundCode"
              register={register}
              // defaultValue={formData.administrative?.fundCode || ''}
              // onChange={handleChange}
              placeholder="Enter Fund Code"
              isEditable={isEditable}
              errors={errors.administrative?.fundCode}
            />
            <Input
              label="Min. Payout Required"
              name="administrative.payPeriodPayoutThreshold"
              type="number"
              register={register}
              // defaultValue={formData.administrative?.minimumPayoutRequired || ''}
              // onChange={handleChange}
              placeholder="Enter Minimum Payout Required"
              isEditable={isEditable}
              errors={errors.administrative?.minimumPayoutRequired}
            />
            {/* <div className='flex col-span-2 flex-row justify-between items-center'> */}
              <Switch
                label="Escrow Personal"
                name="administrative.escrowPersonal"
                // type="string"
                register={register}
                isChecked={formData.administrative?.escrowPersonal || false}
                // defaultChecked={formData.administrative?.escrowPersonal || false}
                // onChange={handleChange}
                isEditable={isEditable}
              />
              <Input
                label="Escrow Personal %"
                name="administrative.escrowPersonalPercentage"
                // type="number"
                register={register}
                // defaultValue={formData.administrative?.escrowPersonalPercentage || ''}
                // onChange={handleChange}
                placeholder="Enter Escrow Hold Percent"
                isEditable={isEditable}
                errors={errors.administrative?.escrowPersonalPercentage}
              />
              <Switch
                label="Escrow Agency"
                name="administrative.escrowAgency"
                // type="string"
                register={register}
                isChecked={formData.administrative?.escrowAgency || false}
                // defaultChecked={formData.administrative?.escrowAgency || false}
                // onChange={handleChange}
                isEditable={isEditable}
              />
              <Input
                label="Escrow Agency %"
                name="administrative.escrowAgencyPercentage"
                type="number"
                register={register}
                // defaultValue={formData.administrative?.escrowAgencyPercentage || ''}
                // onChange={handleChange}
                placeholder="Enter Escrow Hold Percent"
                isEditable={isEditable}
                errors={errors.administrative?.escrowAgencyPercentage}
              />
              <Switch
                label="Escrow Generation"
                name="administrative.escrowGeneration"
                // type="string"
                register={register}
                isChecked={formData.administrative?.escrowGeneration || false}
                // defaultChecked={formData.administrative?.escrowGeneration || false}
                // onChange={handleChange}
                isEditable={isEditable}
              />                
              <Input
                label="Escrow Generation %"
                name="administrative.escrowGenerationPercentage"
                type="number"
                register={register}
                // defaultValue={formData.administrative?.escrowGenerationPercentage || ''}
                // onChange={handleChange}
                placeholder="Enter Escrow Hold Percentage"
                isEditable={isEditable}
                errors={errors.administrative?.escrowGenerationPercent}
              />              
            {/* </div> */}
            <Switch
              label="Block Commission"
              name="administrative.blockCommission"
              // type="string"
              register={register}
              isChecked={formData.administrative?.blockCommission || false}
              // defaultChecked={formData.administrative?.blockCommission || false}
              // onChange={handleChange}
              isEditable={isEditable}
            />
            <Switch
              label="Block Login"
              name="administrative.blockLogin"
              // type="string"
              register={register}
              isChecked={formData.administrative?.blockLogin || false}
              // defaultChecked={formData.administrative?.blockLogin || false}
              // onChange={handleChange}
              isEditable={isEditable}
            />
            <Switch
              label="Deactivate"
              name="administrative.deactivate"
              // type="string"
              register={register}
              isChecked={formData.administrative?.deactivate || false}
              // defaultChecked={formData.administrative?.deactivate || false}
              // onChange={handleChange}
              isEditable={isEditable}
            />
            <Switch
              label="Override Commission"
              name="administrative.overrideCommission"
              // type="string"
              register={register}
              isChecked={formData.administrative?.overrideCommission || false}
              // defaultChecked={formData.administrative?.overrideCommission || false}
              // onChange={handleChange}
              isEditable={isEditable}
            />
            <Input
              label="Commission Override Percent"
              name="administrative.CommissionOverrideFraction"
              type="number"
              register={register}
              // defaultValue={formData.administrative?.CommissionOverrideFraction || ''}
              // onChange={handleChange}
              placeholder="Enter Commission Override Percent"
              isEditable={isEditable}
              errors={errors.administrative?.CommissionOverrideFraction}
            />
            <Input
              label="Notes"
              name="administrative.Notes"
              register={register}
              // defaultValue={formData.administrative?.Notes || ''}
              // onChange={handleChange}
              placeholder="Enter Notes"
              isEditable={isEditable}
              errors={errors.administrative?.Notes}
            />
            <Input
              label="Deactivate Date"
              name="administrative.deactivateDate"
              type="date"
              register={register}
              // defaultValue={formData.administrative?.deactivateDate || ''}
              // onChange={handleChange}
              placeholder="Enter Deactivate Date"
              isEditable={isEditable}
              errors={errors.administrative?.deactivateDate}
            />
            <LoadingButtonNP
              type="button"
              className="bg-primary text-white p-2 rounded-md mt-4"
              onClick={() => {setIsShowNetworkPopup(true)}}
            >
              Assign Nework
            </LoadingButtonNP>
          </ColContainer>
          {isShowNetworkPopup && (
            <PopupComponent
              isVisible={isShowNetworkPopup}
              onClose={() => setIsShowNetworkPopup(false)}
            >
              <Network profileId={formData?.id}/>
            </PopupComponent>
          
          )}
        </PanelContainer>
      )}
    </> 
  );
};

export default Administrative

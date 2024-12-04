'use client'
import React from 'react';
import { useState, useEffect } from 'react';
import { ProfileSchema } from "@/types/profile";
import { normalize } from '@/lib/format';
import { Input, Select} from '@/components/Input';
import {PanelContainer} from '@/components/Containers';
import { fetchRanks} from '@/lib/strapi';
import { isMe } from '@/lib/isAuth'
import { set } from 'zod';

const Basicinfo = ({ formData,  active, isEditable, handleToggle, form }: { formData: ProfileSchema, active: boolean, isEditable: boolean, handleToggle: any, form:any }) => {
  const { register, formState: { errors } } = form;
  const header = 'Basic Information';
  const [ranks, setRanks] = useState<object[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  useEffect(() => {
    isMe(['Superuser']).then((res) => setIsAdmin(res))
  }, [])
  useEffect(() => {
    fetchRanks().then(ranks => setRanks(ranks.data)); // Call the fetchRanks function, then set the state with the fetched data
  }, []);
  // console.log(formData)
  // console.log(ranks)
  return (
    <PanelContainer header={header} defaultActive={active} collapse={false} className=''>
      <div className={`duration-200 ease-in-out ${active ? 'block' : 'hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          {'firstName' in formData && (
            <Input
              label="First Name"
              name="firstName"
              register={register} // Function from react-hook-form or similar library
              placeholder="Enter first name"
              isEditable={isEditable}
              required
              errors={errors}
            />
          )}
          { 'lastName' in formData && (
            <Input
              label="Last Name"
              name="lastName"
              register={register}
              placeholder="Enter last name"
              isEditable={isEditable}
              required
              errors={errors}
              type="text"
            />
          )}
          { 'middleName' in formData && (
            <Input
              label="Middle Name"
              name="middleName"
              register={register}
              placeholder="Enter middle name"
              isEditable={isEditable}
              errors={errors}
              type="text"
            />
          )}
          { 'nickName' in formData && (
            <Input
              label="Nick Name"
              name="nickName"
              register={register}
              placeholder="Enter nick name"
              isEditable={isEditable}
              errors={errors}
              type="text"
            />
          )}
          { 'dateOfBirth' in formData && (
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              register={register}
              isEditable={isEditable}
              errors={errors}
              type="date" // Notice the type is 'date' for this input
            />
          )}
          {'rankId' in formData && (
            <Select
              label="Rank"
              name="rankId"
              register={register}
              defaultOption='Select a rank'
              value={formData.rankId}
              options={ranks && ranks as { id: number; name: string }[]} // Typecast 'ranks' as an array of objects with 'id' and 'name' properties
              isEditable={isEditable && isAdmin } // Assuming 'isDisabled' determines if the select is disabled
              errors={errors}
            />
          )}
        </div>
      </div>
    </PanelContainer>
  );
};

export default Basicinfo;

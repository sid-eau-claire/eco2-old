'use client'
import PageContainer from "@/components/Containers/PageContainer";
import Image from "next/image";
import { useEffect, useState } from "react";
import {RoundButton} from '@/components/Button/'; 
import { useForm } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfileSchema, zProfileSchema } from "@/types/profile";
import Basicinfo from './Basicinfo';
import Contactinfo from './Contactinfo';
import BankingInformation from "./Bankinginformation";
import BeneficiaryInfo from "./Beneficiary";
import SubscriptionSettings from "./SubscriptionSetting";
import ProfileData from '../_actions/updateprofile';
import Administrative from "./Administrative";
import { FaSitemap } from "react-icons/fa";
import {motion} from "framer-motion";
import  Link  from "next/link";
import Spinner from "@/components/Common/Spinner";
import {updateProfileImage} from '../_actions/updateprofileimage'
import { resizeImage } from '@/lib/image';
import { useSession } from "next-auth/react";
import { IoCameraOutline } from "react-icons/io5";
import { MdOutlineEdit, MdOutlineSave } from "react-icons/md";
import { ColContainer, RowContainer } from "@/components/Containers";
import { set } from "zod";
import {getProfileImage} from '@/lib/network'

const refreshSession = async () => {
  // setLoading(true);
  const response = await fetch('/api/refreshsession');
  const data = await response.json();

  // Force update the session by reloading the page
  if (response.ok) {
    window.location.reload();
  } else {
    console.error('Failed to refresh session:', data.message);
  }
  // setLoading(false);
};

const findChanges = (oldObj: any, newObj: any, path = '') => {
  const changes: any = {};
  const safeOldObj = oldObj || {};
  Object.keys(newObj).forEach((key) => {
    const fullPath = path ? `${path}.${key}` : key;

    // Directly compare values if oldObj is undefined/null or if oldObj does not have the current key
    if (typeof oldObj !== 'object' || oldObj === null || !(key in safeOldObj)) {
      changes[fullPath] = newObj[key];
    } else if (typeof newObj[key] === 'object' && newObj[key] !== null && !(newObj[key] instanceof Array)) {
      // If newObj[key] is an object (and not an array), do a deep comparison
      const deeperChanges = findChanges(safeOldObj[key], newObj[key], fullPath);
      if (Object.keys(deeperChanges).length > 0) {
        // Only add deeper changes if there are any
        Object.assign(changes, deeperChanges);
      }
    } else if (newObj[key] !== safeOldObj[key]) {
      // For non-object values or arrays, compare values directly
      changes[fullPath] = newObj[key];
    }
  });
  return changes;
};


const Profile = ({ profile, mode }: { profile: ProfileSchema, mode: string }) => {
  const [active, setActive] = useState<boolean[]>([true, true, true, true, true]);
  // const form = useForm<ProfileSchema>({resolver: zodResolver(zProfileSchema)});
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ProfileSchema>(
    // {resolver: zodResolver(zProfileSchema)}
   { defaultValues: profile}
  );
  const { register, handleSubmit, watch, formState: {errors, isSubmitting}, reset, getValues} =  form
  // const {formState: { errors } } = form;
  const oldData = profile
  const [currentProfileImage, setCurrentProfileImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const formData = watch();
  // const [formData, setFormData] = useState<ProfileSchema>(profile)
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const { data: session } = useSession();

  const handleToggle = (index: number) => {
    setActive((prev) => {
      const temp = [...prev];
      temp[index] = temp[index] === true ? false : true;
      return temp;
    });
  };
  const onSubmit = async () => {
    const change = findChanges(oldData, formData)
    console.log(change)
    console.log(formData)

    const response = await ProfileData(oldData, formData)
    const result1 = await refreshSession();
  }
  const handleFileChange = async (event: any) => {
    if (!event?.target?.files[0]) return;
    setIsLoading(true);
    setProfileImage(event.target.files[0].name);
    // const data = {}
    const data = { dummy: Math.floor(Math.random() * 10000) };
    const formProfileData = new FormData();
    const resizedImageBlob = await resizeImage(event.target.files[0], 512, 512);
    formProfileData.append('files.profileImage',resizedImageBlob, 'profile_image_' + profile?.id);
    formProfileData.append('data', JSON.stringify(data))
    // console.log(formData)
    const result = await updateProfileImage(formProfileData, profile?.id!);
    const result1 = await refreshSession();
    setIsLoading(false);
    // console.log(result)
  };
  // console.log('session', session)
  useEffect(() => {
    const fetchProfileImage = async (id: string) => {
      const response = await getProfileImage(id)
      setCurrentProfileImage(response)
      console.log('profileImage', response)
      return response;
    }
    fetchProfileImage(profile?.id)
  }, []);
  return (
    <PageContainer pageName="Profile">
      <form onSubmit={handleSubmit(onSubmit)}  >
        <div className="relative px-[1rem] flex justify-between items-center z-20 h-25 md:h-16 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-black to-strokedark">
          <Link href={`/dashboard/mynetwork/${profile?.id}`}>
            <RoundButton
              icon={FaSitemap}
              hint="View Network"
              title="View Network"
              className="p-[0.3rem]"
            />
          </Link>
          { mode === 'edit' && (
            <div>
              {isEditable  ? (
                <button
                  type='submit'
                  onClick={handleSubmit(onSubmit)}
                > 
                  <RoundButton
                    icon={MdOutlineSave}
                    onClick={() => setIsEditable(false)}
                    hint="Save"
                    title="Save"
                    className="p-[0.3rem]" 
                  />
                </button>
              ):(
                <RoundButton
                  icon={MdOutlineEdit}
                  onClick={() => setIsEditable(true)}
                  hint="Edit"
                  title="Edit"
                  className="p-[0.3rem]"
                />
              )}
            </div>
          )}
        </div>
        {/* <form onSubmit={handleSubmit(onSubmit)} className="mx-4 my-4"> */}
        <div className="mx-4 my-4">
          <input type='hidden' {...register('id', {setValueAs: value => value === '' ? null : value,}) } value={formData.id} />
          <div className="relative z-30 mx-auto -mt-30 h-20 w-full max-w-20 rounded-full bg-white/20 p-1 backdrop-blur sm:h-24 sm:max-w-24 sm:p-3">
            <div className="relative drop-shadow-2">
              <Image
                // src={"/images/user/user-06.png"}
                src={currentProfileImage || '/images/user/user-0.svg'}
                width={128}
                height={128}
                alt="profile"
                className="rounded-full"
              />
              <label
                htmlFor="profile"
                className="absolute top-13 left-13 flex h-8.5 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
              > 
                <IoCameraOutline size={20} />
                <input
                  type="file"
                  name="profile"
                  id="profile"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          <ColContainer >
            <div className="space-y-8">
              <Basicinfo formData={formData}  active={active[0]} isEditable={isEditable} handleToggle={handleToggle} form={form} />
              {'beneficiary' in formData && (
                <BeneficiaryInfo formData={formData}  active={active[1]} isEditable={isEditable} handleToggle={handleToggle} form={form} />
              )}
            </div>
            <div className="space-y-8">
              <Contactinfo formData={formData} active={active[2]} isEditable={isEditable} handleToggle={handleToggle} form={form} />
            </div>
            <div className="space-y-8">
              {'bankingInformation' in formData && (
                <BankingInformation formData={formData} active={active[3]} isEditable={isEditable} handleToggle={handleToggle} form={form} />
                )}
              {'subscriptionSetting' in formData && (
                <SubscriptionSettings formData={formData}  active={active[4]} isEditable={isEditable} handleToggle={handleToggle} form={form} />
              )}
            </div>
            {/* { isEditable && (
              <input type='submit' value='submit' className='bg-primary text-white p-2 rounded-md mt-4' />
              )} */}
          </ColContainer>
          {'administrative' in formData  && (
            <RowContainer className="mt-[0.5rem]">
              <Administrative formData={formData} active={active[5]} isEditable={isEditable} handleToggle={handleToggle} form={form} />
            </RowContainer>
          )}
        </div>
      </form>
      {isSubmitting && <Spinner />}
      <div className="mb-4">
        {Object.keys(errors).length > 0 && (
          <div className="text-danger">
            <p>Please correct the following errors:</p>
            <ul>
              {Object.entries(errors).map(([key, error]) => (
                <li key={key}>{`${key}: ${(error as any).message || 'Error'}`}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {isLoading && <Spinner />}
    </PageContainer>
  );
};

export default Profile;

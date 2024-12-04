'use client'
import React, {useState, useEffect} from 'react'
import {getProfileImage, getProfile}  from '@/lib/network'
import Image from 'next/image'
import Link from 'next/link';
import { ToolTip } from '../Common/ToolTip';
import { twMerge } from 'tailwind-merge';
import { ProfileMenu } from '../Common';

const ProfileIcon = ({profileId, className, menuEnable = true} : {profileId: string, className?: string, menuEnable?: boolean}) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null); // [profile, setProfile]
  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    getProfileImage(profileId).then((res) => {
      setProfileImage(res || '/images/user/user-0.svg')
      // setProfile(res)
    })
  }, []);  
  return (
    <div className={twMerge(`w-fit`, className)}>
      {profileImage && menuEnable && (
        <ToolTip message='Advisor Menu' className='w-[2rem]'>
          <button type='button' onClick={()=>setShowPopup(true)}>
            {/* <Image src={profileImage} alt="profile" className='w-fit rounded-full py-0 hover:scale-105' width={48} height={48}/> */}
            <Image
              className="rounded-full"
              width={48}
              height={48}
              src={`/images/user/user-${Math.floor(Math.random() * 14).toString().padStart(2, '0')}.png`}
              alt="User"
            />

          </button>
        </ToolTip>
      )}
      {profileImage && !menuEnable && (
        // <ToolTip message={profile?.firstName} className='w-[2rem]'>
          <Image src={profileImage} alt="profile" className='w-fit rounded-full py-0 hover:scale-105' width={48} height={48}/>
        // </ToolTip>
      )}
      {showPopup && (
        <ProfileMenu
          profile={{id: profileId}}
          onClose={() => {setShowPopup(false); }}
        />
      )} 
    </div>
  )
}

export default ProfileIcon
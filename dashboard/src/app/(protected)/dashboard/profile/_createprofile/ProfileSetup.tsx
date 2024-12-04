'use client'
import React, { useEffect, useState } from 'react';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useSession } from 'next-auth/react';
import Link from "next/link";
import { State, City } from 'country-state-city';
import { FaCheck } from "react-icons/fa";
import {motion} from "framer-motion";
import ModalThree from '@/components/Popup/ModalThree';
import { useRouter } from 'next/navigation'
import {useCookieState, putCookiesFile, putCookiesItem} from '@/components/CookieState'
import { TbCurrentLocation } from 'react-icons/tb';
import { MdDataObject } from 'react-icons/md';
import { TiTick } from "react-icons/ti";
import { MdOutlineDoneOutline } from "react-icons/md";
import Popup from '@/components/Popup/PopupWindows';
import axios from 'axios';
import MessageBox from '@/components/Popup/MessageBox';

const ProfileSetup = ({invitation, changeRole}: {invitation: any, changeRole: any}) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [heading, setHeading] = useState('')
  const [message, setMessage] = useState('')
  const [redirect, setRedirect] = useState('')
  // const [step, setStep] = useState(1)
  const [openTab, setOpenTab] = useState(invitation?.attributes?.step || 1);
  const activeClasses = "text-primary border-primary";
  const inactiveClasses = "border-transparent";
  const [isSameAddress, setIsSameAddress] = useState(true);
  const stateData = State.getStatesOfCountry('CA').map(state => ({
    value: state.name,
    displayValue: state.name,
    isoCode: state.isoCode
  }))
  const [selectedHomeState, setSelectedHomeState] = useState<any>(invitation?.attributes?.inviteHomeProvince)
  const [selectedMailState, setSelectedMailState] = useState<any>(invitation?.attributes?.inviteMailProvince)

  const [homeCities, setHomeCities] = useState<any>([])
  const [mailCities, setMailCities] = useState<any>([])
  const [url, setUrl] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const handleOpenPopup = () => {setShowPopup(true);};
  const handleClosePopup = () => {setShowPopup(false);};
  const [inviteExamResults, setInviteExamResults] = useState<any>(null);
  const [inviteCurrentLicense, setInviteCurrentLicense] = useState<any>(null);
  const renderContractingPackage = () => {
    if (formData.licenseStatus == '' || (formData.previousSponsor == '' && formData.licenseStatus == '') ) {
      return -1;
    }
    // setForward(true);
    if (formData.licenseStatus === 'terminated' || formData.licenseStatus === 'nolicense') {
      return 0;  
    } else if (formData.previousSponsor === 'La Capitale') {
      if (formData.inviteAdvisorYear == 'true') {
        return 3
      } else {
        return 1
      } 
    } else {
      if (formData.inviteAdvisorYear == 'true') {
        return 2
      } else {
        return 0
      }
    }
    return -1
  };
  useEffect(() => {
    if (selectedHomeState || selectedMailState) {
      setHomeCities(City.getCitiesOfState('CA', selectedHomeState))
      setMailCities(City.getCitiesOfState('CA', selectedMailState))
    }
  }, [selectedHomeState, selectedMailState]);
  
  const { data: session, status, update } = useSession();

  const [formData, setFormData] = useCookieState('formData',{
    id: invitation?.id,
    inviter: invitation?.attributes?.inviter?.data?.id,
    inviteName: invitation?.attributes?.inviteName,
    inviteFirstName: invitation?.attributes?.inviteFirstName ? invitation?.attributes?.inviteFirstName : invitation?.attributes?.inviteName.split(" ")[0],
    inviteLastName: invitation?.attributes?.inviteLastName ? invitation?.attributes?.inviteLastName : invitation?.attributes?.inviteName.split(" ")[1],
    inviteMiddleName: invitation?.attributes?.inviteMiddleName,
    inviteNickName: invitation?.attributes?.inviteNickName || invitation?.attributes?.inviteName ,
    inviteEmail: invitation?.attributes?.inviteEmail,
    invitePhoneNo: invitation?.attributes?.invitePhoneNo,
    inviteHomeProvince: invitation?.attributes?.inviteHomeProvince,
    inviteHomeCity: invitation?.attributes?.inviteHomeCity,
    inviteHomeAddress: invitation?.attributes?.inviteHomeAddress,
    inviteMailProvince: invitation?.attributes?.inviteMailProvince,
    inviteMailCity: invitation?.attributes?.inviteMailCity,
    inviteMailAddress: invitation?.attributes?.inviteMailAddress,
    inviteDateOfBirth: invitation?.attributes?.inviteDateOfBirth || null, 
    inviteMailingAddress: invitation?.attributes?.inviteMailingAddress,
    inviteProfileImage: invitation?.attributes?.inviteProfileImage,
    inviteLicenseIntention: invitation?.attributes?.inviteLicenseIntention,
    inviteLicenseStatus: invitation?.attributes?.inviteLicenseStatus,
    inviteIntention: invitation?.attributes?.inviteIntention,
    inviteCreditRating: invitation?.attributes?.inviteCreditRating,
    // inviteExamResults: invitation?.attributes?.inviteExamResults,
    // inviteCurrentLicense: invitation?.attributes?.inviteCurrentLicense,
    inviteStandards: invitation?.attributes?.inviteStandards,
    inviteAdvisorYear: invitation?.attributes?.inviteAdvisorYear,
    invitePreviousCompany: invitation?.attributes?.invitePreviousCompany,
    step: invitation?.attributes?.step,
    status: invitation?.attributes?.status,
    profileStatus: invitation?.attributes?.profileStatus,
    preScreeningStatus: invitation?.attributes?.preScreeningStatus,
    eoStatus: invitation?.attributes?.eoStatus,
    licenseStatus: invitation?.attributes?.licenseStatus,
    previousSponsor: invitation?.attributes?.previousSponsor,
    user: session?.user?.data?.id
  }, 'invitation');

  useEffect(() => {
    if (formData.user == null) {
      setFormData((prevFormData: typeof formData) => ({
        ...prevFormData,
        user: session?.user?.data?.id
      }));
    }
  }, [session]);

  // Disable input if invitation is completed
  if (formData.status == 'completed') {
    document.querySelectorAll('input').forEach(input => input.setAttribute('disabled', 'true'));
    document.querySelectorAll('select').forEach(select => select.setAttribute('disabled', 'true'));

  }

  const licenseIntention = [
    "Intent to have license",
    "No intention to get license"
  ];

  const licenseStatusOptions = [
    "No license - studying for exam",
    "No license - recently pass exam",
    "License - transfer",
  ];
  const keyInfo = [
    {name: '1. Do I need to purchase a new E&O?', answer: 'Yes. Even if you have valid E&O from a previous firm, once you resign, your E&O coverage will be terminated as you are no longer associated with the agency. Most E&O carriers will give you a prorated refund if the policy was paid for annually. Also, compliance states you cannot have E&O under multiple agencies.'},
    {name: '2. How much liability limits do I need to purchase with my E&O?', answer: 'We recommend $1,000,000 per claim & $2,000,000 aggregate.'},
    {name: '3. Do I need to add privacy and data breach coverage to my E&O?', answer: 'This is an optional coverage; however we highly recommend you add it to your E&O policy as it will cover your liability should your client’s personal information be compromised, exposed or stolen by hackers. It costs $60/year.'},
    {name: '4. The E&O application is asking “Do you wish purchase a Entity/Corporate E&O Insurance?” What should I answer?', answer: 'You would answer no and proceed to purchase an individual E&O policy unless you are licensed under a corporation and not your own name.'},
    {name: '5. What are the E&O rates?', answer: 'Limit of Liability (Each Claim $1M/Aggregate $2M): $465/yr or $41.04/mo\nLimit of Liability (Each Claim $2M/Aggregate $2M): $620/yr\nLimit of Liability (Each Claim $5M/Aggregate $5M): $980/yr'},
  ]
  const packages = [
    {name: 'Beneva Sponsorship & Contracting Package', url: 'https://na2.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=3a3a39f9-5daa-450c-b16d-94c51d600676&env=na2&acct=c07e4d0b-233d-45f3-a60f-d65c8495433b&v=2'},
    {name: 'Beneva Contracting Package - Transfer', url: 'https://na2.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=bd4fc4d3-bed4-4f07-bd72-498de54637dc&env=na2&acct=c07e4d0b-233d-45f3-a60f-d65c8495433b&v=2'},
    {name: 'Beneva Contracting Package - New - No Sponsorship', url: 'https://na2.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=b2469622-052a-4f44-bd63-f0920fad63eb&env=na2&acct=c07e4d0b-233d-45f3-a60f-d65c8495433b&v=2'},
    {name: 'Beneva Contracting Package - Transfer - No Sponsorship', url: 'https://na2.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=79e79f09-9f1d-4dbe-8477-f93ed9ba4711&env=na2&acct=c07e4d0b-233d-45f3-a60f-d65c8495433b&v=2'},
  ]

  const formatPhoneNumber = (value: string) => {
    if (!value || value === '+1 (' || value === '+1') return value;
    console.log(value)
    if (value.length == 1) {
      value = '+1 (' + value 
    } else {
      value = '+1 (' + value.replace(/[^\d]/g, '').slice(1);
    }
    const phoneNumberDigits = value.replace(/[^\d]/g, '').slice(1);
    if (phoneNumberDigits.length < 4) return value;
    if (phoneNumberDigits.length < 7) return `+1 (${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3)}`;
    return `+1 (${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3, 6)}-${phoneNumberDigits.slice(6, 10)}`;
  };

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = (phone: string) => /^(\+1\s?)?(\(\d{3}\)|\d{3})[-\s]?\d{3}[-\s]?\d{4}$/.test(phone);

  const handleChange = (e: any ) => {
    const { type, name, value } = e.target;
    if (name === 'invitePhoneNo') {
      setFormData((prevFormData: typeof formData) => ({
        ...prevFormData,
        [name]: formatPhoneNumber(value)
      }));
      return;
    }
    if (e.target.name =="inviteLicenseStatus") {
      setFormData((prevFormData: typeof formData) => ({
        ...prevFormData,
        examRsults: null,
        currentLicense: null,
        inviteCreditRating: null,
        inviteStandards: null,
        inviteAdvisorYear: 0,
        invitePreScreening: null,
      }));
    }
    if ( type == 'radio') {
      console.log(e.target)
      setFormData((prevFormData: typeof formData) => ({
        ...prevFormData,
        [name]: (e.target.value == 'true') ? true : false
      }));
    } else if ( type == 'checkbox') {
      setFormData((prevFormData: typeof formData) => ({
        ...prevFormData,
        [name]: (e.target.checked) ? true : false
      }));
    } else {
      setFormData((prevFormData: typeof formData) => ({
        ...prevFormData,
        [name]: value
      }));
    }
  };
  const handleFileUpload = async (e: any) => {
    if (e.target?.files[0]?.size > 2000000) {
      setHeading('File Size Too Large');
      setMessage('Please upload a file less than 2MB.');
      setShowMessage(true);
      return
    }
    const formFile = new FormData();
    formFile.append(`files.${e.target.name}`, e.target.files[0]);
    formFile.append('data', JSON.stringify({}));
    putCookiesFile('invitation_formData', formFile, session, 'myinvitation')
  };  

  const handleAffiliate = (e: any) => {
    e.preventDefault();
    setFormData((prevFormData: typeof formData) => ({
      ...prevFormData,
      status: 'completed',
      profileStatus: true,
    }));
    if(!changeRole(6)) {return}

    setHeading('Welcome to Eau Claire One')
    setMessage('You have successfully registered an account in our Eau Claire One Dashboard. Please find the affiliate program page.')
    setRedirect('/dashboard/affiliates')
    setShowModal(true)
    setTimeout(() => {
      putCookiesItem('invitation_formData', session, 'myinvitation')
    }, 1000);    
    // Change user role to affiliate
  }
  const handleProfileCreate = (e: any) => {
    e.preventDefault();
    setFormData((prevFormData: typeof formData) => ({
      ...prevFormData,
      status: 'waitForExamResult',
      licenseStatus: 'nolicense',
      profileStatus: true 
    }));
    setHeading('Welcome to Eau Claire One')
    setMessage('You have successfully registered an account in our Eau Claire One Dashboard. Please find the resources in the Dashboard.')
    setRedirect('/dashboard')
    setShowModal(true)
    setTimeout(() => {
      putCookiesItem('invitation_formData', session, 'myinvitation')
    }, 1000);  
  }  

  const handleProfileComplete = (e: any)  => {
    e.preventDefault();
    setFormData((prevFormData: typeof formData) => ({
      ...prevFormData,
      status: 'profileCompleted',
      licenseStatus: 'nolicense',
      profileStatus: true
    }));    
    setFormData((prevFormData: typeof formData) => ({...prevFormData, step: 2}))
    setTimeout(() => {
      putCookiesItem('invitation_formData', session, 'myinvitation')
    }, 1000);
  }

  const handlePreScreening = (e: any)  => {
    e.preventDefault();
    setFormData((prevFormData: typeof formData) => ({
      ...prevFormData,
      status: 'preScreeningCompleted',
      preScreeningStatus: true
    }));     
    setFormData((prevFormData: typeof formData) => ({...prevFormData, step: 3}))
    setTimeout(() => {
      putCookiesItem('invitation_formData', session, 'myinvitation')
    }, 1000);
  }  
  const handleEOCompleted = (e: any)  => {
    e.preventDefault();
    setFormData((prevFormData: typeof formData) => ({
      ...prevFormData,
      status: 'completed',
      eoStatus: true
    }));
    if(!changeRole(7)) {return}
    // setFormData((prevFormData: typeof formData) => ({...prevFormData, step: 3}))
    setTimeout(() => {
      putCookiesItem('invitation_formData', session, 'myinvitation')
      update()
      router.push('/dashboard')
    }, 1000);
  }  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('submitted')
  }
  // console.log(invitation)
  // console.log(formData)
  // console.log(inviteExamResults)
  // console.log(inviteCurrentLicense )
  return (
    <>
      <Breadcrumb pageName="Create ECO Profile" />

        <div className="flex flex-col gap-9">
          <motion.div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {/* <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Initial Profile Setup
              </h3>
            </div> */}
            <form onSubmit={handleSubmit} action="#"
              className="mx-6 mt-6"
            >
              <div className="mb-6 flex justify-start items-center flex-wrap gap-5 border-b border-stroke dark:border-strokedark sm:gap-10">
                <Link
                  href="#"
                  className={`border-b-2 py-4 text-sm font-medium hover:text-primary md:text-base ${
                    openTab === 1 ? activeClasses : inactiveClasses
                  }`}
                  onClick={() => setOpenTab(1)}
                >
                  {(formData.profileStatus == true) && <TiTick className="inline-block mr-2 text-green-300 border-4 rounded-full" size={36}/>}
                  Personal Information
                </Link>
                {formData.step > 1 && (
                  <Link
                    href="#"
                    className={`border-b-2 py-4 text-sm font-medium hover:text-primary md:text-base ${
                      openTab === 2 ? activeClasses : inactiveClasses
                    }`}
                    onClick={() => setOpenTab(2)}
                  >
                    {(formData.preScreeningStatus == true) && <TiTick className="inline-block mr-2 text-green-300 border-4 rounded-full" size={36}/>}
                    Pre-screening
                  </Link>                
                )}
                {formData.step > 2 && (
                  <Link
                    href="#"
                    className={`border-b-2 py-4 text-sm font-medium hover:text-primary md:text-base ${
                      openTab === 3 ? activeClasses : inactiveClasses
                    }`}
                    onClick={() => setOpenTab(3)}
                  >
                    {(formData.eoStatus) && <TiTick className="inline-block mr-2 text-green-300 border-4 rounded-full" size={36}/>}
                    E&O Licensing
                  </Link>
                )}
              </div>
              <div>
                <div
                  className={`grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 leading-relaxed mb-2 ${openTab === 1 ? "block" : "hidden"}`} 
                >
                  <div className="mb-4.5">
                    <label className="mb-2.5 block text-black dark:text-white">Legal First Name<strong className='text-rose-600'>*</strong></label>
                    <input
                      required
                      type="text"
                      name="inviteFirstName"
                      value={formData.inviteFirstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div className="mb-4.5">
                    <label className="mb-2.5 block text-black dark:text-white">Legal Last Name</label>
                    <input
                      required
                      type="text"
                      name="inviteLastName"
                      value={formData.inviteLastName}
                      onChange={handleChange}
                      placeholder="Enter Last name"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div className="mb-4.5">
                    <label className="mb-2.5 block text-black dark:text-white">Middle Name (Optional)</label>
                    <input
                      required
                      type="text"
                      name="inviteMiddleName"
                      value={formData.inviteMiddleName}
                      onChange={handleChange}
                      placeholder="Enter Middle name"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div className="mb-4.5">
                    <label className="mb-2.5 block text-black dark:text-white">Preferred Name<strong className='text-rose-600'>*</strong></label>
                    <input
                      required
                      type="text"
                      name="inviteNickName"
                      value={formData.inviteNickName}
                      onChange={handleChange}
                      placeholder="Enter nick name"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>                  
                  <div className="mb-4.5">
                    <label className="mb-2.5 block text-black dark:text-white">Email</label>
                    <input
                      type="email"
                      name="inviteEmail"
                      value={formData.inviteEmail}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div className="mb-4.5">
                    <label className="mb-2.5 block text-black dark:text-white">Phone Number</label>
                    <input
                      type="text"
                      name="invitePhoneNo"
                      value={formData.invitePhoneNo}
                      minLength={17 }
                      maxLength={17}
                      onChange={handleChange}
                      placeholder="+1 (XXX) XXX-XXXX"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div className="mb-4.5">
                    <label className="mb-2.5 block text-black dark:text-white">Home Province/Territory</label>
                    <select
                      name="inviteHomeProvince"
                      value={formData.inviteHomeProvince}
                      onChange={(e)=>{handleChange(e);setSelectedHomeState(e.target.value)}}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="" selected disabled hidden>Select Province/Territory</option>
                      {stateData.map((province, index) => (
                        <option key={index} value={province.isoCode}>{province.displayValue}</option>
                      ))}
                    </select>
                  </div>
                  <motion.div className="mb-4.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    <label className="mb-2.5 block text-black dark:text-white">Home City</label>
                    <select
                      name="inviteHomeCity"
                      value={formData.inviteHomeCity}
                      onChange={(e)=>{handleChange(e)}}
                      className="w-full  rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="" selected disabled hidden>Select City</option>
                      {homeCities && homeCities.map((city: any, index:number) => (
                        <option key={index} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </motion.div>
                  {formData.inviteHomeCity && (
                    <motion.div className="mb-4.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      <label className="mb-2.5 block text-black dark:text-white">Home Address</label>
                      <input
                        type="text"
                        name="inviteHomeAddress"
                        value={formData.inviteHomeAddress}
                        maxLength={100}
                        onChange={handleChange}
                        placeholder="Please input your Home address"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />                    
                    </motion.div>
                  )}
                  {formData.inviteHomeAddress && (
                    <motion.div className="flex flex-col gap-5.5 p-6.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      <label
                        htmlFor="checkboxLabelTwo"
                        className="flex cursor-pointer select-none items-center"
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="checkboxLabelTwo"
                            className="sr-only"
                            onChange={() => {
                              setIsSameAddress(!isSameAddress);
                            }}
                          />
                          <div
                            className={`mr-4 flex h-5 w-5 items-center justify-center rounded border ${
                              isSameAddress && 'border-primary bg-gray dark:bg-transparent'
                            }`}
                          >
                            <span className={`opacity-0 ${isSameAddress && '!opacity-100'}`}>
                              <FaCheck />
                            </span>
                          </div>
                        </div>
                        Is your mail address same as home address?
                      </label>
                    </motion.div>
                  )}
                  {!isSameAddress && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">Mail Province/Territory</label>
                        <select
                          name="inviteMailProvince"
                          value={formData.inviteMailProvince}
                          onChange={(e)=>{handleChange(e);setSelectedMailState(e.target.value)}}
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        >
                          <option value="" selected disabled hidden>Select Province/Territory</option>
                          {stateData.map((province, index) => (
                            <option key={index} value={province.isoCode}>{province.displayValue}</option>
                          ))}
                        </select>
                      </div>
                      {formData.inviteMailProvince && (
                        <div className="mb-4.5">
                          <label className="mb-2.5 block text-black dark:text-white">Mail City</label>
                          <select
                            name="inviteMailCity"
                            value={formData.inviteMailCity}
                            onChange={(e)=>{handleChange(e)}}
                            className="w-full  rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                          >
                            <option value="" selected disabled hidden>Select City</option>
                            {mailCities && mailCities.map((city: any, index:number) => (
                              <option key={index} value={city.name}>{city.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {formData.inviteMailCity && (
                        <div className="mb-4.5">
                          <label className="mb-2.5 block text-black dark:text-white">Mail Address</label>
                          <input
                            type="text"
                            name="inviteMailAddress"
                            value={formData.inviteMailAddress}
                            maxLength={100}
                            onChange={handleChange}
                            placeholder="Please input your Home address"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                          />                    
                        </div>
                      )}                  
                    </motion.div>
                  )}
                  {formData.inviteHomeAddress && (
                    <motion.div className="mb-4.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      <label className="mb-2.5 block text-black dark:text-white">Date of Birth</label>
                      <input
                        type="date"
                        name="inviteDateOfBirth"
                        value={formData.inviteDateOfBirth}
                        onChange={handleChange}
                        placeholder="Enter date of birth"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                    </motion.div>
                  )}
                  {formData.inviteDateOfBirth != null && (
                  <div className="mb-4.5">
                    <label className="mb-2.5 block text-black dark:text-white">Intent to have license?</label>
                    <select
                      name="inviteLicenseIntention"
                      value={formData.inviteLicenseIntention}
                      onChange={handleChange}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="" selected disabled hidden>Select License Intention</option>
                      {licenseIntention.map((status, index) => (
                        <option key={index} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>                    
                  )}
                  {(formData.inviteLicenseIntention == "No intention to get license" && formData.status != 'completed') && (
                    <div className='col-span-full mx-6 mt-2 mb-6 flex flex-row justify-center'>
                      <input type="submit" className="bg-primary p-3 font-medium text-gray  mx-auto rounded-md"
                        onClick={(e) => {handleAffiliate(e)}}
                        value="Join our affiliate programs"
                      />
                    </div>                    
                  )}
                  {formData.inviteLicenseIntention == "Intent to have license" && (
                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">Select License Status</label>
                      <select
                        name="inviteLicenseStatus"
                        value={formData.inviteLicenseStatus}
                        onChange={handleChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      >
                        <option value="" selected disabled hidden>Select Options</option>
                        {licenseStatusOptions.map((status, index) => (
                          <option key={index} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>          
                  )}
                  {(formData.inviteLicenseIntention == "Intent to have license" && formData.inviteLicenseStatus == 'No license - studying for exam') && (
                    <div className='col-span-full mx-6 mt-2 mb-6 flex flex-row justify-center'>
                      <button className="bg-primary p-3 font-medium text-gray  mx-auto rounded-md"
                        onClick={(e) => {handleProfileCreate(e)}}
                      >
                        Please return when you pass the exam
                      </button>
                    </div>   
                  )}
                  {( formData.inviteLicenseIntention == "Intent to have license" && formData.inviteLicenseStatus == "No license - recently pass exam") && (
                    <div>
                      <label className="mb-2.5 block text-black dark:text-white">Upload exam result</label>
                      <input
                        name="inviteExamResults"
                        type="file"
                        onChange={(e)=>{handleFileUpload(e);setInviteExamResults('found')}}
                        className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2.5 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                      />
                    </div>
                  )}       
                  {(formData.inviteLicenseIntention == "Intent to have license" && formData.inviteLicenseStatus == "License - transfer") && (
                    <div>
                      <label className="mb-2.5 block text-black dark:text-white">Upload your current license</label>
                      <input
                        name="inviteCurrentLicense"
                        type="file"
                        onChange={(e)=>{handleFileUpload(e);setInviteCurrentLicense('found')}}
                        className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2.5 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                      />
                    </div>
                  )}                        
                  {(formData.inviteLicenseIntention == "Intent to have license" && (formData.inviteLicenseStatus != "No license - studying for exam" ) && (inviteExamResults != null || inviteCurrentLicense != null)) && (
                    <motion.div className='col-span-full mx-6 mt-2 mb-6 flex flex-row justify-center'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      <button className="bg-primary/80 hover:bg-primary p-3 font-medium text-gray  mx-auto rounded-md"
                        onClick={(e) => {handleProfileComplete(e);setOpenTab(2)}}
                      >
                        Review and confirm personal information
                      </button>
                    </motion.div>  
                  )}
                </div>
                <div
                  className={`grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 leading-relaxed mb-4 ${openTab === 2 ? "block" : "hidden"}`} 
                >
                  {((formData.inviteLicenseStatus == "No license - studying for exam")
                    || 
                    (formData.inviteLicenseStatus == "No license - recently pass exam")
                    || 
                    (formData.inviteLicenseStatus == "License - transfer")
                  ) && (
                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">Your credit rating range</label>
                      <select
                        name="inviteCreditRating"
                        value={formData.inviteCreditRating}
                        onChange={handleChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      >
                        <option value="" selected disabled hidden>Select Option</option>
                        <option value="Above 650">Above 650</option>
                        <option value="Between 650 and 500">Between 650 and 500</option>
                        <option value="Below 500">Below 500</option>
                      </select>
                    </div>
                  )}
                  {(formData.inviteCreditRating == "Above 650" || formData.inviteCreditRating == "Between 650 and 500" )&& (
                    <div className="mb-4.5 col-span-full">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Please confirm
                      </label>
                      <label
                        htmlFor="inviteStandards"
                        className="flex cursor-pointer select-none items-center"
                      >
                        <div>
                          <input
                            type="checkbox"
                            id="inviteStandards"
                            name="inviteStandards"
                            className='scale-150 mr-4'
                            // className="sr-only"
                            onChange={handleChange}
                            // value={formData.inviteStandards == true ? 'on' : 'off'}
                            // checked={formData.inviteStandards}
                          />
                        </div>
                        <div>
                          <p><strong>1.</strong> I do not have outstanding collection accounts</p>
                          <p><strong>2.</strong> I do not have indebeted to any other MGA</p>
                          <p><strong>3.</strong> I have no history of bankruptcy or consumer proposals</p>
                          <p><strong>4.</strong> I have no pending or unresolved criminal charges</p>
                        </div>
                      </label>
                    </div>                    
                  )}
                  {(formData.inviteStandards == true  && formData.inviteLicenseStatus == "License - transfer" && formData.inviteCreditRating != "Below 500") && (
                    <motion.div className="mb-4.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      <label className="mb-2.5 block text-black dark:text-white">Is your license is more than 2 years?</label>
                      <div >
                        <input 
                          type="radio" 
                          id="inviteAdvisorYear_yes"
                          name="inviteAdvisorYear"
                          value="true"
                          checked={formData.inviteAdvisorYear}
                          onChange={handleChange}
                          className='scale-150 mr-2' 
                        />
                        <label>Yes</label>
                        <input 
                          type="radio" 
                          id="inviteAdvisorYear_no"
                          name="inviteAdvisorYear"
                          value="false"
                          checked={!formData.inviteAdvisorYear}
                          onChange={handleChange}
                          className='scale-150 ml-8 mr-2'
                        />
                        <label>No</label>
                      </div>                    
                    </motion.div>
                  )}
                  {(formData.inviteAdvisorYear != 0 && formData.inviteCreditRating != "Below 500") && (
                    <motion.div className='col-span-2'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      <label className="mb-2.5 block text-black dark:text-white">What was your previous brokerage company?</label>
                      <input
                        type="text"
                        name="invitePreviousCompany"
                        value={formData.invitePreviousCompany}
                        onChange={handleChange}
                        placeholder="e.g. EAU CLAIRE PARTNERS"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />                      
                    </motion.div>  
                  )}
                  {(formData.inviteCreditRating == "Below 500" ) && (
                    <div className='col-span-full mx-6 mt-2 mb-6 flex flex-row justify-center'>
                      <button className="bg-primary p-3 font-medium text-gray  mx-auto rounded-md"
                        onClick={(e) => handleProfileCreate(e)}
                      >
                        Please contact your reporting manager or EAU CLAIRE PARTNERS
                      </button>
                    </div>
                  )}
                  {((formData.inviteLicenseStatus == "License - transfer" && formData.inviteCreditRating != "Below 500" && formData.inviteStandards == true && formData.invitePreviousCompany != null)
                  ||
                    (formData.inviteLicenseStatus == "No license - recently pass exam" && formData.inviteCreditRating != "Below 500" && formData.inviteStandards == true)
                  ) 
                  && (
                    <div className='col-span-full mx-6 mt-2 mb-6 flex flex-row justify-center'>
                      <button className="bg-primary p-3 font-medium text-gray  mx-auto rounded-md"
                        onClick={(e) => {handlePreScreening(e);setOpenTab(3);  }}
                      >
                        Review and Confirm Pre-screening Information
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className={`grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 leading-relaxed mb-4 ${openTab === 3 ? "block" : "hidden"}`} 
                >
                  <p
                    className='col-span-full text-black dark:text-white'
                  >
                    At Eau Claire Partners Inc., our license sponsoring company is Beneva, but on your licence, it will show as their previous name, La Capitale Financial Security Insurance Company.
                    {/* ... Additional explanatory text ... */}
                  </p>
                  <div className="space-y-4 col-span-2">
                    <div className="flex flex-col md:flex-row items-center md:space-x-2">
                      <label className="md:w-2/3">What is your license status?</label>
                      <select
                        name="licenseStatus"
                        value={formData.licenseStatus}
                        onChange={(e) => {handleChange(e); setShowConfirm(false)}}
                        className="flex-1 p-2 border rounded-md"
                      >
                        <option value="" selected hidden disabled>Select Status</option>
                        <option value="nolicense">No License</option>
                        <option value="active">Active</option>
                        <option value="terminated">Terminated</option>
                      </select>
                    </div>
                    {formData.licenseStatus === 'active' && (
                      <div className="flex flex-col md:flex-row items-center md:space-x-2">
                        <label className="md:w-2/3">Was your previous sponsoring company La Capitale?</label>
                        <select
                          name="previousSponsor"
                          value={formData.previousSponsor}
                          onChange={(e) => {handleChange(e);setShowConfirm(false)}}
                          className="flex-1 p-2 border rounded-md"
                        >
                          <option value="" selected hidden disabled>Select Option</option>
                          <option value="La Capitale">Yes, La Capitale</option>
                          <option value="other">No, Different Company</option>
                        </select>
                      </div>
                    )}
                    {formData.licenseStatus === 'active' && (
                      <div className="flex flex-col md:flex-row items-center md:space-x-2">
                        <label className="md:w-2/3">Have you been licensed in Ontario for over 2 years?</label>
                        <select
                          name="inviteAdvisorYear"
                          value={formData.inviteAdvisorYear}
                          onChange={(e) => {handleChange(e);setShowConfirm(false)}}
                          // Boolean(e.target.value).valueOf()
                          className="flex-1 p-2 border rounded-md"
                        >
                          <option value="" selected hidden disabled>Select Option</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                    )}
                  </div>
                  {(renderContractingPackage() >= 0 && !showConfirm) && (
                    <div className="mt-6 col-span-full">
                      <h4 className="text-md font-semibold">Contracting:</h4>
                      <p>Please complete the Docusign below for your sponsorship/contracting application. You will receive a verification code in your email to access the Docusign.</p>
                      <div className="flex flex-col md:flex-row justify-center items-center md:space-x-2">
                        <motion.button className="mt-4 font-medium bg-primary/80 text-white p-4 rounded-md hover:bg-primary disabled:bg-gray-400"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.8 }}
                          onClick={() => {
                            setUrl(packages[renderContractingPackage()].url);
                            handleOpenPopup();
                            // setShowConfirm(true);
                          }}  
                          >
                          {`Required Package: ${packages[renderContractingPackage()].name}`}
                        </motion.button>
                      </div>
                    </div>

                  )}
                  {showConfirm && (
                    <div className="col-span-full flex flex-col md:flex-row justify-center items-center md:space-x-2">
                      <motion.button className="mt-4 font-medium bg-primary/80 text-white p-4 rounded-md hover:bg-primary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.8 }}
                        onClick={(e) => {
                          // setStep4Complete(true);
                          handleEOCompleted(e);
                        }}  
                        >
                          Confirm you have signed the Docusign?
                      </motion.button>
                    </div>
                  )}
                  <Popup 
                    // url={url + '&Broker_UserName=' + encodeURIComponent(nameInLicense).replaceAll("^\"|\"$", "") +  '&Broker_Email=' + emailForLicense.replaceAll("^\"|\"$", "")  }
                    url={url +  '&Broker_Email=' + formData?.inviteEmail?.replaceAll("^\"|\"$", "")  }
                    isVisible={showPopup} 
                    onClose={() => {handleClosePopup(); setShowConfirm(true)}}
                  />                  
                </div>
                                               
              </div>
            </form>
          </motion.div>
          {showModal && (
            <ModalThree heading={heading} message={message} close={setShowModal} redirect={redirect} />
          )}
          {showMessage && <MessageBox heading={heading} message={message} close={setShowMessage}/>}
        </div>
    </>
  );
};

export default ProfileSetup

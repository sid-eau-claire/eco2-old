'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {createContact} from './../_actions/contact';

interface TaskPopupProps {
  popupOpen: boolean;
  setPopupOpen: (open: boolean) => void;
  addContact: (contact: any) => void;
}

const AddContact = ({ popupOpen, setPopupOpen, profileId }: {popupOpen: any, setPopupOpen: any, profileId: string}) => {
  const [clientInfo, setClientInfo] = useState({
    prefix: '',
    firstName: '',
    middleName: '',
    lastName: '',
    netWorth: '',
    homePhone: '',
    email: '',
    clientType: 'household',
    company: '',
    title: '',
    houseHoldType: '',
    houseHoldName: '',
    backgroundInformation: '',
    tags: '',
    maritialStatus: '',
    address: [],
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setClientInfo(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = createContact(clientInfo, profileId);
    setPopupOpen(false);
  };

  return (
    <>
      {popupOpen && (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark-2 cursor-pointer p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black dark:text-white">Add Your Client Contact</h2>
            <button
              onClick={() => setPopupOpen(false)}
              className="text-black dark:text-white">
              Close
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col justify-center items-start">
            <div className='w-full mb-5'>
              <label className="mb-2.5 block font-medium text-black dark:text-white capitalize">
                Name
              </label>
              <div className='grid gap-4 grid-cols-1 md:grid-cols-4 sm:grid-cols-2'>
                <input
                  type="text"
                  id="prefix"
                  name="prefix"
                  value={clientInfo.prefix}
                  onChange={handleChange}
                  placeholder="Prefix"
                  className="w-full rounded-sm border border-stroke bg-white py-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={clientInfo.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="w-full rounded-sm border border-stroke bg-white py-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  value={clientInfo.middleName}
                  onChange={handleChange}
                  placeholder="Middle Name"
                  className="w-full rounded-sm border border-stroke bg-white py-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={clientInfo.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="w-full rounded-sm border border-stroke bg-white py-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
              </div>
            </div>
            <div className='w-full mb-5'>
              <label className="mb-2.5 block font-medium text-black dark:text-white capitalize">
                Net Worth
              </label>
              <div className='w-full'>
                <input
                  type="text"
                  id="netWorth"
                  name="netWorth"
                  value={clientInfo.netWorth}
                  onChange={handleChange}
                  placeholder="Net Worth"
                  className="w-full rounded-sm border border-stroke bg-white py-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
              </div>
            </div>
            <div className='w-full mb-5'>
              <label className="mb-2.5 block font-medium text-black dark:text-white capitalize">
                Maritial Status
              </label>
              <div className='grid gap-4 grid-cols-1 md:grid-cols-4 space-x-4'>
                <input
                  type="text"
                  id="maritialStatus"
                  name="maritialStatus"
                  value={clientInfo.maritialStatus}
                  onChange={handleChange}
                  placeholder="Maritial Status"
                  className="w-full rounded-sm border border-stroke bg-white py-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
              </div>
            </div>
            <div className='w-full mb-5'>
              <label className="mb-2.5 block font-medium text-black dark:text-white capitalize">
                Email Address
              </label>
              <div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={clientInfo.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full rounded-sm border border-stroke bg-white py-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
              </div>
            </div>
            <div className='w-full mb-5'>
              <label className="mb-2.5 block font-medium text-black dark:text-white capitalize">
                Phone Number
              </label>
              <div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
                <input
                  type="text"
                  id="homePhone"
                  name="homePhone"
                  value={clientInfo.homePhone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full rounded-sm border border-stroke bg-white py-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
              </div>
            </div>
            <div className='w-full mb-5'>
              <label className="mb-2.5 block font-medium text-black dark:text-white capitalize">
                Company
              </label>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={clientInfo.title}
                  onChange={handleChange}
                  placeholder="Title"
                  className="w-full rounded-sm border border-stroke bg-white py-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={clientInfo.company}
                  onChange={handleChange}
                  placeholder="Company"
                  className="w-full rounded-sm border border-stroke bg-white py-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
              </div>
            </div>
            <div className='w-full mb-5'>
              <label className="mb-2.5 block font-medium text-black dark:text-white capitalize">
                Household
              </label>
              <div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
                <input
                  type="text"
                  id="houseHoldType"
                  name="houseHoldType"
                  value={clientInfo.houseHoldType}
                  onChange={handleChange}
                  placeholder="Household Type"
                  className="w-full rounded-sm border border-stroke bg-white py-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
                <input
                  type="text"
                  id="houseHoldName"
                  name="houseHoldName"
                  value={clientInfo.houseHoldName}
                  onChange={handleChange}
                  placeholder="Household Name"
                  className="w-full rounded-sm border border-stroke bg-white py-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
              </div>
            </div>
            <div className='w-full mb-5'>
              <label className="mb-2.5 block font-medium text-black dark:text-white capitalize">
                Tags
              </label>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={clientInfo.tags}
                  onChange={handleChange}
                  placeholder="Tags"
                  className="w-full rounded-sm border border-stroke bg-white py-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
              </div>
            </div>
            <div className='w-full mb-5'>
              <label className="mb-2.5 block font-medium text-black dark:text-white capitalize">
                Background Information
              </label>
              <div className='w-full'>
                <textarea
                  id="backgroundInformation"
                  name="backgroundInformation"
                  cols={30}
                  value={clientInfo.backgroundInformation}
                  onChange={handleChange}
                  placeholder="Background Information"
                  className="w-full rounded-sm border border-stroke bg-white py-3 px-4.5 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
              </div>
            </div>
            <button className="col-span-1 md:col-span-2 bg-primary hover:bg-primary/90 text-white py-2.5 px-4.5 font-medium rounded-md transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AddContact;

'use client';
import React, { useState } from 'react';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import {motion} from "framer-motion";

const ContractingInfo = ({heading, type}: {heading: string, type: string}) => {
  const [companies] = useState([
    // {
    //   name: 'Serenia Life',
    //   description: 'Fill the following 2 forms and email them to contracting@eauclairepartners.com:',
    //   forms: [
    //     {name: 'Serenia Life - Affiliate Broker Contracting Kit', url: 'https://drive.google.com/file/d/1je3YlU7_MRTQlvBsRHW11y6FrkCZciTV/view?usp=drive_link'},
    //     {name: 'Serenia Life - Affiliate Broker Contracting Kit', url: 'https://drive.google.com/file/d/1gfRGqTQollkVhIe3rZKs_2gqVl-T2N0d/view?usp=drive_link'},
    //     {name: 'Licence(s) and E&O', url: ''},
    //     {name: '2 forms of ID', url: ''}
    //   ]
    // },
    {
      name: '21 Century',
      type: 'travelhealth',
      description: 'Fill the following form and email it along with your licence(s) and E&O to contracting@eauclairepartners.com:',
      forms: [
        {name: 'New Agent Info Sheet', url: "https://drive.google.com/file/d/1LzgefIoTN6FDWWgxrmgZ8K5UNW_cULH-/view?usp=sharing"}
      ],
    },
    {
      name: 'Allianz',
      type: 'travelhealth',
      description: 'Email a request to contracting@eauclairepartners.com with your name and phone number.'
    },
    {
      name: 'B2B Bank',
      type: 'lending',
      description: 'Fill the following form and email it to contracting@eauclairepartners.com:',
      forms: [
        {name: 'Advisor Setup Form', url: 'https://drive.google.com/file/d/14xCb-U0-vteUBczqs6pfseeNh5I5wx3K/view?usp=drive_link'}
      ]
    },
    {
      name: 'Blendable',
      type: 'hsa',
      description: 'Click on this link for their online application process:',
      link: 'Blendable Signup',
      linkUrl: 'https://www.blendable.com/signup',
      additional: 'In the "Affiliation" drop-down menu, select Eau Claire Partners.'
    },
    {
      name: 'Blue Cross',
      type: 'travelhealth',
      description: 'Blue Cross requires a first piece of business (FPB) to get contracted. Please email contracting@eauclairepartners.com to get started, and write whether you\'re in ON or AB.'
    },
    {
      name: 'ClearBenefits',
      type: 'hsa',
      description: 'No contracting necessary. You can start right away with a quote:',
      link: 'ClearBenefits Quote Request',
      linkUrl: 'https://clearbenefits.ca/eau-claire-quote-request/'
    },
    {
      name: 'Custom Care',
      type: 'hsa',
      description: 'Fill the following form and email it to contracting@eauclairepartners.com:',
      forms: [
        {name: 'Custom Care Broker Agreement', url: "https://drive.google.com/file/d/1IZnTu8ASVz8-F7B3mzvDX44VdIc_DpLI/view?usp=sharing"}
      ]
    },
    {
      name: 'Destination Travel',
      type: 'travelhealth',
      description: 'Fill the following form and email it to contracting@eauclairepartners.com. Also attach a copy of your license and E&O certificate to the email.',
      forms: [
        {name: 'Destination Travel Agent Appointment', url: "https://drive.google.com/file/d/1WTasSSdlFdAZ4lblZ6do4NQIVCTC-0RZ/view?usp=sharing"}
      ]
    },
    {
      name: 'GMS',
      type: 'travelhealth',
      description: 'Go to www.gms.ca directly and make the first sale (no login necessary, and commissions are built into all products). Keep the confirmation number from the sale. Download and complete this form:',
      forms: [
        {name: 'GMS Broker Agreement', url: "https://drive.google.com/file/d/11wfCqNkDXdRdjBaAWNk2xyIF5P_N6mKY/view?usp=sharing"}
      ],
      additional: 'Email the confirmation number, the Broker Agreement, a copy of your license, and a copy of your E&O to contracting@eauclairepartners.com.'
    },
    {
      name: 'Ingle',
      type: 'travelhealth',
      description: 'Email a copy of your license(s) to contracting@eauclairepartners.com, along with the following information: Name, Address, Cell, Email.'
    },
    {
      name: 'LegalShield',
      description: 'Please email affiliates@eauclairepartners.com for details regarding the sign-up process.'
    },
    {
      name: 'My Dignity',
      type: 'travelhealth',
      description: 'To get contracted: MyDignity requires a first piece of business (FPB) in order to begin the contracting process. Complete the application for a client, submit it in ECO as a regular submission, and send a copy of the application to contracting@eauclairepartners.com, indicating in the email that it is your FPB for MyDignity. In ECO, please refer to Training > Home Care (LTC). Additional documents and materials are there.',
      forms: [
        {name: 'MyDignity Client Application', url: "https://drive.google.com/file/d/1T868t_opUe3AGkJliXL6d8MfflBGV4zP/view?usp=sharing"}
      ]
    },
    {
      name: 'MyHSA',
      type: 'hsa',
      description: 'Request contracting with MyHSA by emailing contracting@eauclairepartners.com with your: Phone number, Address.'
    },
    {
      name: 'National Health Claim',
      type: 'hsa',
      description: 'Email a request to contracting@eauclairepartners.com with your name and email address to be added to their database.'
    },
    {
      name: 'Travelance',
      type: 'travelhealth',
      description: 'For new advisors: Email the following information to contracting@eauclairepartners.com: Full name, Business phone number, Email address, Primary Address. You will receive an email with further instructions from Travelance. For transferring advisors: Fill the following forms and email them to contracting@eauclairepartners.com',
      forms: [
        {name: 'Travelance - Transfer of MGA', url: "https://drive.google.com/file/d/1izYQk3Pv9RltVHIzyc95gJEEEGSTyP-x/view?usp=sharing"},
        {name: 'Travelance - Travelance Sales Agreement', url: "https://drive.google.com/file/d/1mwEWosNs7futkTg9xmDFfSQtRN7pjgJr/view?usp=sharing"},
        {name: 'Travelance - Broker Sales Agreement', url: "https://drive.google.com/file/d/1J6FKDG0khga3m7rq36o8eLRzYwdMHBPp/view?usp=sharing"}
      ]
    },
    {
      name: 'TuGo',
      type: 'travelhealth',
      description: 'Email a request to contracting@eauclairepartners.com to get contracted.'
    }
    // Add other companies as needed
  ]);

  return (
    <>
      <Breadcrumb pageName={heading} />
      <motion.div className=""
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className='mb-4'>
          AFTER you have a obtained an active licence representing Eau Claire Partners, feel free to get contracted with any of the following carriers at any time going forward. Please read the instructions on how to get contracted with them.
        </h3>
        {/* {companies.map((company, index) => ( */}
        {companies.filter(company => company.type === type).map((company, index) => (
          <motion.div key={index} className="mb-6"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.02 }}
          >
            <h2 className="text-xl font-bold mb-2">{company.name}</h2>
            <p className="mb-2">{company.description}</p>
            {company.forms && (
              <ul className="list-disc list-inside">
                {company.forms.map((form, formIndex) => (
                  <li key={formIndex}><a className='underline' href={form.url} target="_blank">{form.name}</a></li>
                ))}
              </ul>
            )}
            {company.link && (
              <a href={company.linkUrl} className="text-blue-600 underline">
                {company.link}
              </a>
            )}
            {company.additional && <p className="mt-2">{company.additional}</p>}
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};

export default ContractingInfo;

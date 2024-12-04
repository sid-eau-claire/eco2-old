'use client'
import React, {useEffect, useState} from 'react'
import { CommissionLog, CommissionLogEntry } from '@/types/commissionlog'; // Ensure this import matches your file structure.
import {excelDateToJSDate} from '@/lib/excel';
import TableView from './TableView';
import LoadingButton from '@/components/Button/LoadingButton';
import LoadingButtonNP from '@/components/Button/LoadingButtonNP';
import {normalize} from '@/lib/format';
import { getCarrier, getCarriers} from './../_actions/retrievedata';

import Fuse from 'fuse.js'
import Spinner from '@/components/Common/Spinner';
import Loader from '@/components/Common/Loader';

// function findMatchingAdvisor(name: string, advisorList: any[]) {
//   const normalizedInputName = name.toLowerCase().trim();
//   const nameParts = normalizedInputName.split(' ').filter(Boolean);
//   const matches = advisorList.filter(advisor => {
//       const advisorFirstName = advisor.firstName?.toLowerCase().trim() ?? '';
//       const advisorMiddleName = advisor.middleName?.toLowerCase().trim() ?? '';
//       const advisorLastName = advisor.lastName?.toLowerCase().trim() ?? '';
//       switch (nameParts.length) {
//           case 2:
//               return nameParts[0] === advisorFirstName && nameParts[1] === advisorLastName;
//           case 3:
//               return nameParts[0] === advisorFirstName && nameParts[1] === advisorMiddleName && nameParts[2] === advisorLastName;
//           default:
//               return false;
//       }
//   });
//   return matches;
// }
// function normalizeString(str: string): string {
//   // Remove all non-letter characters for English and French, including any kind of dash or hyphen
//   return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove diacritics
//          .replace(/[^a-zA-ZÀ-ÿ\s]/g, "") // Keep letters and whitespace only
//          .toLowerCase()
//          .trim();
// }

function normalizeString(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
         .replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
         .toLowerCase()
         .trim();
}

// function findMatchingAdvisor(name: string, advisorList: any[]): any[] {
//   const normalizedInputName = normalizeString(name);
//   const nameParts = normalizedInputName.split(/\s+/).filter(Boolean);

//   return advisorList.filter(advisor => {
//     let advisorFullName = null
//     let normalizedAdvisorName : any = null

//     switch (nameParts.length) {
//       case 2:
//         advisorFullName = `${advisor.firstName ?? ''} ${advisor.lastName ?? ''}`.trim();
//         normalizedAdvisorName = normalizeString(advisorFullName);
//         return nameParts.every((part, index) => normalizedAdvisorName.split(/\s+/)[index] === part);
//       case 3:
//         advisorFullName = `${advisor.firstName ?? ''} ${advisor.middleName ?? ''} ${advisor.lastName ?? ''}`.trim();
//         normalizedAdvisorName = normalizeString(advisorFullName);        
//         return nameParts.every((part, index) => normalizedAdvisorName.split(/\s+/)[index] === part);
//       default:
//         advisorFullName = `${advisor.firstName ?? ''} ${advisor.middleName ?? ''} ${advisor.lastName ?? ''}`.trim();
//         normalizedAdvisorName = normalizeString(advisorFullName);        
//         return normalizedAdvisorName.includes(normalizedInputName);
//     }
//   });
// }

// function findMatchingAdvisor(name: string, advisorList: any[]): any[] {
//   const normalizedInputName = normalizeString(name);
//   const nameParts = normalizedInputName.split(/\s+/).filter(Boolean);

//   return advisorList.filter(advisor => {
//     let advisorFullName = null
//     let normalizedAdvisorName : any = null

//     switch (nameParts.length) {
//       case 2:
//         advisorFullName = `${advisor.firstName ?? ''} ${advisor.lastName ?? ''}`.trim();
//         normalizedAdvisorName = normalizeString(advisorFullName);
//         return nameParts.every((part, index) => normalizedAdvisorName.split(/\s+/)[index] === part);
//       case 3:
//         // advisorFullName = `${advisor.firstName ?? ''} ${advisor.middleName ?? ''} ${advisor.lastName ?? ''}`.trim();
//         advisorFullName = `${advisor.firstName ?? ''}  ${advisor.lastName ?? ''}`.trim();
//         normalizedAdvisorName = normalizeString(advisorFullName);        
//         return nameParts.every((part, index) => normalizedAdvisorName.split(/\s+/)[index] === part);

//       default:
//         advisorFullName = `${advisor.firstName ?? ''} ${advisor.middleName ?? ''} ${advisor.lastName ?? ''}`.trim();
//         normalizedAdvisorName = normalizeString(advisorFullName);        
//         return normalizedAdvisorName.includes(normalizedInputName);
//     }
//   });
// }

function findMatchingAdvisor(name: string, advisorList: any[]): any[] {
  const normalizedInputName = normalizeString(name);
  const nameParts = normalizedInputName.split(/\s+/).filter(Boolean);

  return advisorList.filter(advisor => {
    // Create different possible full name combinations
    const possibleNames = [
      [advisor.firstName, advisor.middleName, advisor.lastName].filter(Boolean).join(" "),
      [advisor.firstName, advisor.lastName].join(" "),  // In case middleName is not commonly used
      [advisor.firstName, advisor.lastName].filter(Boolean).join(" ")  // In case middleName is not commonly used
    ];

    const matches = possibleNames.some(fullName => {
      let normalizedAdvisorName = normalizeString(fullName);
      return nameParts.every(part => normalizedAdvisorName.includes(part));
    });

    return matches;
  });
}




const FindSimilar = (advisorList: any[], name: string) => {
  const names = advisorList.map(profile => (`${profile.firstName} ${profile.middleName || ''} ${profile.lastName}`));
  const fuse = new Fuse(names);
  const match = fuse.search(name);
  const message = match.map(item => {
    return item.item + ' or '
  })
  return "Did you mean " + message
}

const parseRows = async (carrier: {id: string, carrierName: string}, statementPeriodStart: string | undefined, statementPeriodEnd: string | undefined, rows: any[], advisorList: any[]) => {
  const DATA_START_ROW = 4;
  const DATA_START_COL = 5;
  let newRecords = [];
  let recordValidation = [];
  let recordWarning = [];
  let totalPostMarkupRevenue = 0
  const carrierOptions = await getCarriers();

  for (let i = DATA_START_ROW; i < rows.length; i++) {
    let row = rows[i];
    if (Array.isArray(row) && row[DATA_START_COL] && !isNaN(Number(row[DATA_START_COL]))) {
      // let writingAgentName = String(row[2 + DATA_START_COL]);
      const carrierName = String(row[1 + DATA_START_COL])
      const carrierId = carrierOptions.find((option: any) => option.carrierName == carrierName)?.id;
      // const carrierId = await getCarrier(row[1 + DATA_START_COL]);
      if (carrierId == null) {
        alert(`Carrier "${row[1 + DATA_START_COL]}" not found in the system.`)
        throw new Error(`Carrier "${row[1 + DATA_START_COL]}" not found in the system.`);
      }
      let record = {
        line: Number(row[0 + DATA_START_COL]),
        carrier: carrierName,
        carrierId: carrierId,
        // carrierId: carrier.id,
        writingAgent: String(row[2 + DATA_START_COL]),
        writingAgentId: findMatchingAdvisor(row[2 + DATA_START_COL], advisorList)[0]?.id,
        writingAgentPercentage: parseFloat(row[3 + DATA_START_COL]) * 100 | 0,
        splitAgent1: String(row[4 + DATA_START_COL]),
        splitAgent1Id:  String(row[4 + DATA_START_COL]) != '' ? findMatchingAdvisor(row[4 + DATA_START_COL], advisorList)[0]?.id : null,
        splitAgent1Percentage: parseFloat(row[5 + DATA_START_COL]) * 100 | 0,
        splitAgent2: String(row[6 + DATA_START_COL]),
        splitAgent2Id:  String(row[6 + DATA_START_COL]) != '' ?  findMatchingAdvisor(row[6 + DATA_START_COL], advisorList)[0]?.id : null,
        splitAgent2Percentage: parseFloat(row[7 + DATA_START_COL]) * 100 | 0,
        splitAgent3: String(row[8 + DATA_START_COL]),
        splitAgent3Id:  String(row[8 + DATA_START_COL]) != '' ?  findMatchingAdvisor(row[8 + DATA_START_COL], advisorList)[0]?.id : null,
        splitAgent3Percentage: parseFloat(row[9 + DATA_START_COL]) * 100 | 0,
        clientName: String(row[10 + DATA_START_COL]),
        policyAccountFund: String(row[11 + DATA_START_COL]),
        transactionDate: excelDateToJSDate(row[12 + DATA_START_COL]),
        productCategory: String(row[13 + DATA_START_COL]),
        productDetails: String(row[14 + DATA_START_COL]),
        bonus: (row[15 + DATA_START_COL]) === 'Y',
        bonusMarkup: parseFloat(row[16 + DATA_START_COL]) || 0,
        receivedRevenue: parseFloat(row[17 + DATA_START_COL]) || 0,
        postMarkupRevenue: parseFloat(row[18 + DATA_START_COL]) || 0,
      };
      // if (record.receivedRevenue > 0) {
        totalPostMarkupRevenue += record.postMarkupRevenue
      // }
      let isValid = true;
      let isWarning = false
      let messages = [];

      // Validation 1: Writing Agent is in advisorList
      let writingAgentMatch = findMatchingAdvisor(record.writingAgent, advisorList).length;
      if (writingAgentMatch !== 1) {
        isValid = false;
        messages.push(`Exact name of Writing agent "${record.writingAgent}" is not found in our system! `);
        messages.push(FindSimilar(advisorList, record.writingAgent).trim().replace(/ or $/,''))
      }

      // Validation 2: Split Agents are in advisorList
      if (record.splitAgent1 && record?.splitAgent1Id == undefined ) {
        isValid = false;
        messages.push(`Exact name of split agent 1 "${record.splitAgent1}" is not found in our system! `);
      }
      if (record.splitAgent2 && record?.splitAgent2Id == undefined) {
        isValid = false;
        messages.push(`Exact name of split agent 2 "${record.splitAgent2}" is not found in our system! `);
      }
      if (record.splitAgent3 && record?.splitAgent3Id == undefined) {
        isValid = false;
        messages.push(`Exact name of split agent 3 "${record.splitAgent3}" is not found in our system! `);
      }

      // Validation 3: Carrier matches
      // if (record.carrier != carrier.carrierName) {
      //   isValid = false;
      //   messages.push(`Carrier "${record.carrier}" does not match the given carrier "${carrier}".`);
      // }

      // Validation 4: Percentages add up to 100
      let totalPercentage = record.writingAgentPercentage + record.splitAgent1Percentage + record.splitAgent2Percentage + record.splitAgent3Percentage;
      if (totalPercentage !== 100) {
        isValid = false;
        messages.push(`Total percentage does not add up to 100 (found ${totalPercentage}).`);
      }

      // Validation 5: Non-null clientName and policyAccountFund
      if (!record.clientName || !record.policyAccountFund) {
        isValid = false;
        messages.push("Client name or policy account fund is null.");
      }
      
      // Validateion 6: All the date are valid date 
      if (isNaN(record.transactionDate.getTime())) {
        isValid = false;
        messages.push("Transaction date is not a valid date.");
      }

      // Validation 7: postMarkupRevenue calculation
      let expectedPostMarkupRevenue = Math.round((record.bonus  ? (record.bonusMarkup + 1 ) * record.receivedRevenue  :  record.receivedRevenue)* 100) /100;
      if (record.postMarkupRevenue !== expectedPostMarkupRevenue) {
        isValid = false;
        messages.push(`Post Markup Revenue does not match the expected value (expected ${expectedPostMarkupRevenue}, found ${record.postMarkupRevenue}).`);
      }
      // Validation 8: Product Category is correctly set
      if (!record.productCategory) {
        isValid = false;
        messages.push("Product Category is not set.");
      } else if (!['FYC', 'Bonus', 'Insurance', 'Investments', 'Affiliates'].includes(record.productCategory)) {
        isValid = false;
        messages.push(`Product Category "${record.productCategory}" is not valid.`);
      }
      // Validation 9: All figures should be numberic
      if (isNaN(record.receivedRevenue) || isNaN(record.postMarkupRevenue) || isNaN(record.bonusMarkup)) {
        isValid = false;
        messages.push("Received Revenue, Post Markup Revenue and Bonus Markup should be numeric.");
      }
      // Validation 10: Bonus Markup should be 0 if Bonus is false
      if (!record.bonus && record.bonusMarkup !== 0) {
        isValid = false;
        messages.push("Bonus Markup should be 0 if Bonus is false.");
      }
      // Validation 11: Bonus Markup should be greater than 0 if Bonus is true
      if (record.bonus && record.bonusMarkup <= 0) {
        isValid = false;
        messages.push("Bonus Markup should be greater than 0 if Bonus is true.");
      }
      // Validation 12: Writing Agent is unique
      if (advisorList.filter(profile => profile.name == row[2 + DATA_START_COL].toUpperCase()).length > 1) {
        isValid = false;
        messages.push(`More than one Writing agent "${record.writingAgent}" in our system! `);
      }
      // Validation 13: Split Agent 1 is unique
      if (advisorList.filter(profile => profile.name == row[4 + DATA_START_COL].toUpperCase()).length > 1) {
        isValid = false;
        messages.push(`More than one Spilting agent 1 "${record.splitAgent1}" in our system! `);
      }
      // Validation 14: Split Agent 2 is unique
      if (advisorList.filter(profile => profile.name == row[6 + DATA_START_COL].toUpperCase()).length > 1) {
        isValid = false;
        messages.push(`More than one Spilting agent 2 "${record.splitAgent2}" in our system! `);
      }
      // Validation 15: Split Agent 3 is unique
      if (advisorList.filter(profile => profile.name == row[8 + DATA_START_COL].toUpperCase()).length > 1) {
        isValid = false;
        messages.push(`More than one Spilting agent 3 "${record.splitAgent3}" in our system! `);
      }      
      
      newRecords.push(record);
      recordValidation.push({line: record.line , valid: isValid, message: messages.join(" ") });
      // Accumulate postMarkupRevenue if the record is valid
    
    } else {
      // Assuming skipping the creation of a 'record' object for invalid rows
      // Consider adding a generic invalid message if tracking all row validations
    }
  }

  // console.log(newRecords);
  // console.log(recordValidation);
  console.log('advisorList', advisorList)

  return { newRecords, recordValidation, totalPostMarkupRevenue };
};
  

const PreviewLogEntries =  ({carrier, commissionLog, records, advisorList, onClose}: {carrier: {id: string, carrierName: string}, commissionLog: CommissionLog, records: any[], advisorList:any[], onClose:any }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const [fileInfo, setFileInfo] = useState<string>('');
  const [data, setData] = useState<any>();
  // console.log(advisorList)
  useEffect(() => {
    const fetchData = async () => {
      const result = await parseRows(carrier, commissionLog?.statementPeriodStartDate, commissionLog.statementPeriodEndDate, records, advisorList);
      setData(result);
    };
    fetchData();
  }, [])
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  }; 
  console.log(commissionLog) 
  return (
    <>
      {data ? (
        <LoadingButtonNP onClick={() => handleOpenModal()}
          className="bg-success text-white px-4 py-2 rounded-md mt-4 w-[20rem] h-[3rem]"
        >
          Proceed if above information is correct
        </LoadingButtonNP>
      ):(
        <Loader className="h-10 w-10"/>
      )}
      {isModalOpen && data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-9999">
          <div className="bg-white p-5 rounded-lg w-screen max-h-[90vh]  overflow-y-auto relative">
            <TableView commissionLog={{...commissionLog, totalPostMarkupRevenue: data.totalPostMarkupRevenue, totalCommissionDeposited: commissionLog.totalCommissionDeposited}} newRecords={data.newRecords} recordValidation={data.recordValidation} onClose={onClose} />
            <button
              className="absolute top-0 right-4 mt-4 px-4 py-2 bg-body text-white rounded hover:bg-blue-600 transition duration-300" 
              onClick={handleCloseModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>    
  )
}

export default PreviewLogEntries
import React, {useState, useEffect} from 'react';
import { ColContainer, RowContainer } from '@/components/Containers';
import { LoadingButtonNP, LoadingButton } from '@/components/Button';
import {updateNewCaseStatus} from './../_actions/newcase';
const ChangeStatus = ({ selectedRecordsData, close }: { selectedRecordsData: any, close: any }) => {
  console.log(selectedRecordsData);
  const [status, setStatus] = useState('Pending Review');

  const handleConfirm = async () => {
    await selectedRecordsData.map((record: any) =>{
      // console.log(record.id);
      updateNewCaseStatus(record, status);
    })
    close();
  }
  console.log('selectedRecordsData', selectedRecordsData);
  return (
    <>
      <ColContainer cols="1:1:1:1">
        <RowContainer className="flex flew-row items-center justify-start py-2 mt-3">
          <h2 className="text-lg font-semibold">Change Status</h2>
        </RowContainer>
        <RowContainer className="flex flex-col mt-4">
          <label htmlFor="status" className="text-sm font-semibold">Status</label>
          <select name="status" id="status" className="w-[12rem] border border-gray-300 rounded-md px-2 py-1 mt-1"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Pending Review">Pending Review</option>
            <option value="UW/Processing">UW/Processing</option>
            <option value="UW/Approved">UW/Approved</option>
            <option value="Pending Pay">Pending Pay</option>
            <option value="Paid Settled">Paid & Settled</option>
            <option value="Not Proceeded With">Not Proceeded With</option>
            <option value="Declined/Postponed">Declined/Postponed</option>
            <option value="Lapse/Withdrawn">Lapse/Withdrawn</option>
            <option value="Unknown">Unknown</option>
          </select>
        </RowContainer>
        <RowContainer className="flex flex-col mt-4">
          <h4 className='text-md font-semibold'>Below business case(s) will have status changed</h4>
          {selectedRecordsData.map((record: any) => (
            <div key={record.id} className="p-2 border-b border-gray-300">
              <div><strong>Owner:</strong> {record.applicants.find((applicant: any) => applicant.isOwner).firstName} {record.applicants.find((applicant: any) => applicant.isOwner).lastName}</div>
              <div><strong>Carrier:</strong> {record.appInfo.carrierId.carrierName}</div>
              <div><strong>Product Description:</strong> {record.appInsProducts.map((product: any) => product.productId.name).join(', ')}</div>
            </div>
          ))}
        </RowContainer>
        <RowContainer className="flex justify-start mt-4">
          <LoadingButton
            loadingText='..'
            className='bg-primary text-white py-2 px-2 w-[6rem] my-0 rounded-md'
            onClick={()=>handleConfirm()}
          >
            Confirm
          </LoadingButton>
        </RowContainer>
      </ColContainer>
    </>
  );
};

export default ChangeStatus;

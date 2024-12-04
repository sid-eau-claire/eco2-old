// components/PolicyDetails.tsx
'use client'
import React, { useEffect, useState } from 'react';

const PolicyDetails = ({data}: {data: any}) => {
  // const [data, setData] = useState({ policyData: [], partyData: [], relationData: [] });
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   fetch('/api/policyDetails')
  //     .then(res => res.json())
  //     .then(data => {
  //       setData(data);
  //       setIsLoading(false);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching policy details:', error);
  //       setIsLoading(false);
  //     });
  // }, []);

  // if (isLoading) return <div>Loading...</div>;
  console.log(data)

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Policy Details</h2>
      {/* Display your data here */}
    </div>
  );
};

export default PolicyDetails;

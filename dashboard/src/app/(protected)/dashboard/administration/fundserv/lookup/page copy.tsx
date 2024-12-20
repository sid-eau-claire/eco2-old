'use client'
// pages/index.tsx
import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';

type PaymentStream = {
  tradeAccount: boolean;
  commissionAccount: boolean;
};

type Currency = {
  currencyId: string;
  currencyCode: string;
  currencyDesc: string;
  paymentStream: PaymentStream;
};

type Company = {
  companyCode: string;
  companyName: string;
  companyType: string;
  alternatePaymentStream: boolean;
  status: string;
  currency: Currency[];
};

type CompaniesData = {
  companies: Company[];
};

const Home: NextPage = () => {
  const [data, setData] = useState<CompaniesData>({ companies: [] });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/testing/lookup_all.json');
      const jsonData = await response.json() as CompaniesData;
      setData(jsonData);
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-5">Companies Table</h1>
      <CompaniesTable data={data} />
    </div>
  );
};

const CompaniesTable: React.FC<{ data: CompaniesData }> = ({ data }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Code</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Type</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alternate Payment Stream</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currencies</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.companies.map((company, idx) => (
          <tr key={idx}>
            <td className="px-6 py-4 whitespace-nowrap">{company.companyCode}</td>
            <td className="px-6 py-4 whitespace-nowrap">{company.companyName}</td>
            <td className="px-6 py-4 whitespace-nowrap">{company.companyType}</td>
            <td className="px-6 py-4 whitespace-nowrap">{company.alternatePaymentStream ? 'Yes' : 'No'}</td>
            <td className="px-6 py-4 whitespace-nowrap">{company.status}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              {company.currency.map((c, cIdx) => (
                <div key={cIdx}>
                  {c.currencyCode} - {c.currencyDesc}
                  <div>
                    Trade Account: {c.paymentStream.tradeAccount ? 'Yes' : 'No'}, Commission Account: {c.paymentStream.commissionAccount ? 'Yes' : 'No'}
                  </div>
                </div>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Home;

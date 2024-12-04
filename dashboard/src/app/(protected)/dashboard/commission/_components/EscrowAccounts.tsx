import React, { useState, useEffect } from 'react';
import { getAccountsWithPositiveEscrowBalance } from './../_actions/retrievedata';

const EscrowAccounts = ({ refreshTab, setRefreshTab }: { refreshTab: number, setRefreshTab: any }) => {
  const [positiveEscrowAccounts, setPositiveEscrowAccounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const response = await getAccountsWithPositiveEscrowBalance();
      setPositiveEscrowAccounts(response);
    };
    fetchAccounts();
  }, [refreshTab]);
  // console.log('positiveEscrowAccounts', positiveEscrowAccounts)
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-primary text-white">
            {/* <th className="py-2 px-4 border-b text-left">ID</th> */}
            <th className="py-2 px-4 border-b text-left">Name</th>
            <th className="py-2 px-4 border-b text-left">Balance</th>
            <th className="py-2 px-4 border-b text-left">Hold</th>
            <th className="py-2 px-4 border-b text-left">Created At</th>
            <th className="py-2 px-4 border-b text-left">Updated At</th>
          </tr>
        </thead>
        <tbody>
          {positiveEscrowAccounts.map(account => (
            <tr key={account.id} className="hover:bg-gray-100">
              {/* <td className="py-2 px-4 border-b text-left">{account?.id}</td> */}
              <td className="py-2 px-4 border-b text-left">{account?.firstName} {account.lastName}</td>
              <td className="py-2 px-4 border-b text-left">{account?.balance?.toFixed(2) || 0}</td>
              <td className="py-2 px-4 border-b text-left">{account?.hold?.toFixed(2)}</td>
              <td className="py-2 px-4 border-b text-left">{new Date(account?.createdAt).toLocaleDateString()} {new Date(account?.createdAt).toLocaleTimeString()}</td>
              <td className="py-2 px-4 border-b text-left">{new Date(account?.updatedAt).toLocaleDateString()} {new Date(account?.updatedAt).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EscrowAccounts;

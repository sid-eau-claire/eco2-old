import React from 'react';
import { useEffect, useState } from 'react';
import { targetForApproved, approveTarget, rejectTarget } from '../_actions/target';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const OKRTeam = () => {
  const [targetList, setTargetList] = useState<any>([]);

  useEffect(() => {
    const fetchTarget = async () => {
      try {
        const response = await targetForApproved();
        setTargetList(response);
      } catch (error) {
        console.error('Error fetching OKR data:', error);
      }
    };
    fetchTarget();
  }, []);

  const handleApprove = async (id:any) => {
    try {
      await approveTarget(id);
      // Refresh the target list after approval
      const updatedTargets = await targetForApproved();
      setTargetList(updatedTargets);
    } catch (error) {
      console.error('Error approving target:', error);
    }
  };

  const handleReject = async (id:any) => {
    try {
      await rejectTarget(id);
      // Refresh the target list after rejection
      const updatedTargets = await targetForApproved();
      setTargetList(updatedTargets);
    } catch (error) {
      console.error('Error rejecting target:', error);
    }
  };
  console.log('targetList', targetList);
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">OKR Approval Table</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Advisor Name</TableHead>
            <TableHead>Mobile Phone</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Month</TableHead>
            <TableHead>No. Core App</TableHead>
            <TableHead>Core MPE</TableHead>
            <TableHead>No. Investment App</TableHead>
            <TableHead>Investment AUM</TableHead>
            <TableHead>No. of Subscriptions</TableHead>
            <TableHead>No. of Licensed</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {targetList?.advisorTarget?.map((target:any) => (
            <TableRow key={target.id}>
              <TableCell>{`${target?.profileId?.firstName} ${target?.profileId?.lastName}`}</TableCell>
              <TableCell>{target?.profileId?.mobilePhone}</TableCell>
              <TableCell>{target?.year}</TableCell>
              <TableCell>{target?.month}</TableCell>
              <TableCell>{target?.noCoreApp}</TableCell>
              <TableCell>{target?.coreMPE}</TableCell>
              <TableCell>{target?.noInvestmentApp}</TableCell>
              <TableCell>{target?.investmentAUM}</TableCell>
              <TableCell>{target?.noOfSubscription}</TableCell>
              <TableCell>{target?.noOfLicensed}</TableCell>
              <TableCell>
                {target.status === 'Waiting for Approval' ? (
                  <div className="flex flex-row space-x-2">
                    <Button 
                      onClick={() => handleApprove(target.id)} 
                      className="bg-green-500 hover:bg-green-600 text-white w-[4rem]"
                    >
                      Approve
                    </Button>
                    <Button 
                      onClick={() => handleReject(target.id)} 
                      className="bg-red-500 hover:bg-red-600 text-white w-[4rem]"
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  <span>{target.status}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OKRTeam;
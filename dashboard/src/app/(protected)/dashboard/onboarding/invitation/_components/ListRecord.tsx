'use client'

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { getInvitation, cancelInvitation } from '../_actions/invitation';
import AddRecord from './AddRecord';
import { toast } from 'react-toastify';
import { PageContainer } from '@/components/Containers';

const ListRecord = ({session}: {session: any}) => {
  // const { data: session } = useSession();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      const response = await getInvitation(session?.user?.data?.profile?.id);
      setRecords(response || []);
      setIsLoading(false);
    };
    fetchRecords();
  }, [session, showAddDialog]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="secondary">New</Badge>;
      case 'waitForExamResult':
        return <Badge variant="secondary">Waiting for Exam Result</Badge>;
      case 'profileCompleted':
        return <Badge variant="secondary">Profile Completed</Badge>;
      case 'eoCompleted':
        return <Badge variant="secondary">EO Completed</Badge>;
      case 'preScreeningCompleted':
        return <Badge variant="secondary">Pre-Screening Completed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleCancelClick = (invitation: any) => {
    setSelectedInvitation(invitation);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (selectedInvitation) {
      const result = await cancelInvitation(selectedInvitation.id);
      if (result.status === 200) {
        toast.success('Invitation cancelled successfully!');
        const updatedRecords = records.filter((record: any) => record.id !== selectedInvitation.id);
        setRecords(updatedRecords);
      } else {
        toast.error('Failed to cancel invitation. Please try again later.');
      }
    }
    setShowCancelDialog(false);
    setSelectedInvitation(null);
  };
  console.log('invitations', records)
  return (
    <PageContainer pageName='Member Invitation'>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold">Invitation List</CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="default">Invite to join</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] z-999 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Invitation</DialogTitle>
              </DialogHeader>
              <AddRecord onClose={() => setShowAddDialog(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className='px-2 py-0'>
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone No</TableHead>
                  <TableHead className="hidden lg:table-cell">Home Province</TableHead>
                  <TableHead className="hidden lg:table-cell">License Status</TableHead>
                  <TableHead>Invitation Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record: any, index: number) => (
                  <TableRow key={index} className="h-14">
                    <TableCell className="font-medium py-2">{record.inviteName}</TableCell>
                    <TableCell className="py-2">{record.inviteEmail}</TableCell>
                    <TableCell className="hidden md:table-cell py-2">{record.invitePhoneNo}</TableCell>
                    <TableCell className="hidden lg:table-cell py-2">{record.inviteHomeProvince}</TableCell>
                    <TableCell className="hidden lg:table-cell py-2">{record.inviteLicenseStatus}</TableCell>
                    <TableCell className="py-2">{formatDate(record.createdAt)}</TableCell>
                    <TableCell className="py-2">{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="py-2">
                      <Button variant="destructive" size="sm" onClick={() => handleCancelClick(record)}>Cancel</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog} >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Cancellation</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Are you sure you want to cancel this invitation? This action cannot be undone.
            </DialogDescription>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>No, keep it</Button>
              <Button variant="destructive" onClick={handleCancelConfirm}>Yes, cancel invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </PageContainer> 
     
  );
};

export default ListRecord;
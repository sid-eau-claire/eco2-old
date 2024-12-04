import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle } from "lucide-react";
import { mergeRecords } from './../_actions/client';

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  title: string;
  company: string;
  prefix: string;
  dateOfBirth: string;
  mobilePhone: string;
  homePhone: string;
  address: {
    address: string
    city: string
    provinceId: string
    countryId: string
  }  
  clientType: string;
  houseHoldType: string;
  houseHoldName: string;
  backgroundInformation: string;
  maritialStatus: string;
  smokingStatus: string;
  netWorth: number | null;
}

type ChangeableFields = {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string | null;
  mobilePhone: string;
  homePhone: string;
  dateOfBirth: string;
  title: string;
  company: string;
  prefix: string;
  clientType: string;
  houseHoldType: string;
  houseHoldName: string;
  maritialStatus: string;
  smokingStatus: string;
  netWorth: number | null;
  backgroundInformation: string;
};

interface MergeRecordsProps {
  selectedRecords: string[];
  clients: Client[];
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
}

const changeableFields: (keyof ChangeableFields)[] = [
  'firstName',
  'lastName',
  'middleName',
  'email',
  'mobilePhone',
  'homePhone',
  'dateOfBirth',
  'title',
  'company',
  'prefix',
  'clientType',
  'houseHoldType',
  'houseHoldName',
  'maritialStatus',
  'smokingStatus',
  'netWorth',
  'backgroundInformation',
];

const fieldLabels: Record<keyof ChangeableFields, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  middleName: 'Middle Name',
  email: 'Email',
  mobilePhone: 'Mobile Phone',
  homePhone: 'Home Phone',
  dateOfBirth: 'Date of Birth',
  title: 'Title',
  company: 'Company',
  prefix: 'Prefix',
  clientType: 'Client Type',
  houseHoldType: 'Household Type',
  houseHoldName: 'Household Name',
  maritialStatus: 'Marital Status',
  smokingStatus: 'Smoking Status',
  netWorth: 'Net Worth',
  backgroundInformation: 'Background Information',
};

const MergeRecords: React.FC<MergeRecordsProps> = ({ selectedRecords, clients, isOpen, onClose, profileId }) => {
  const [consolidatedRecord, setConsolidatedRecord] = useState<ChangeableFields | null>(null);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [mergeSuccess, setMergeSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const filteredClients = clients.filter(client => selectedRecords.includes(client.id));
    setSelectedClients(filteredClients);
    setConsolidatedRecord(getDefaultConsolidatedRecord(filteredClients));
  }, [selectedRecords, clients]);

  const getDefaultConsolidatedRecord = (clients: Client[]): ChangeableFields => {
    const defaultRecord: ChangeableFields = changeableFields.reduce((acc, field) => {
      if (field === 'netWorth') {
        acc[field] = clients.reduce((max, client) => 
          client.netWorth !== null && (max === null || client.netWorth > max) ? client.netWorth : max
        , null as number | null);
      } else if (field === 'email') {
        acc[field] = clients.reduce((longest, client) => {
          const currentValue = client[field];
          return (currentValue && currentValue.length > (longest?.length || 0)) 
            ? currentValue 
            : longest;
        }, null as string | null);
      } else {
        const longestValue = clients.reduce((longest: any, client) => {
          const currentValue = client[field as keyof Client];
          return (currentValue && currentValue.toString().length > longest.toString().length) 
            ? currentValue 
            : longest;
        }, '');
        acc[field] = longestValue as any;
      }
      return acc;
    }, {} as ChangeableFields);

    return defaultRecord;
  };

  const handleFieldClick = (field: keyof ChangeableFields, value: ChangeableFields[keyof ChangeableFields]) => {
    setConsolidatedRecord(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleMerge = async () => {
    setShowConfirmDialog(true);
  };

  const confirmMerge = async () => {
    setShowConfirmDialog(false);
    if (consolidatedRecord) {
      const consolidatedRecordId = Math.max(...selectedRecords.map(id => parseInt(id))).toString();
      const recordToMerge = {
        ...consolidatedRecord,
        email: consolidatedRecord.email === '' ? null : consolidatedRecord.email
      };
      try {
        const result = await mergeRecords(consolidatedRecordId, selectedRecords, recordToMerge);
        if (result.success && result.status === 200) {
          setMergeSuccess(true);
          setResultMessage('Clients merged successfully.');
        } else {
          throw new Error(result.message || 'Merge failed');
        }
      } catch (error) {
        setMergeSuccess(false);
        setResultMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      }
      setShowResultDialog(true);
    }
  };

  const areAllValuesSame = (field: keyof ChangeableFields) => {
    const values = selectedClients.map(client => client[field]);
    return values.every(value => value === values[0]);
  };

  const handleResultClose = () => {
    setShowResultDialog(false);
    if (mergeSuccess) {
      onClose();
    }
  };

  if (!consolidatedRecord) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Merge Records</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  {selectedClients.map((client, index) => (
                    <TableHead key={client.id}>Record {index + 1}</TableHead>
                  ))}
                  <TableHead>Consolidated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changeableFields.map((key, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{fieldLabels[key]}</TableCell>
                    {selectedClients.map((client) => (
                      <TableCell 
                        key={client.id}
                        className={`cursor-pointer hover:bg-gray-100 ${
                          !areAllValuesSame(key) && 
                          consolidatedRecord[key] === client[key] 
                            ? 'bg-green-100' 
                            : ''
                        }`}
                        onClick={() => handleFieldClick(key, client[key] as ChangeableFields[keyof ChangeableFields])}
                      >
                        {client[key]?.toString() || 'N/A'}
                      </TableCell>
                    ))}
                    <TableCell className="bg-blue-100">
                      {consolidatedRecord[key]?.toString() || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleMerge}>Merge Records</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Merge</AlertDialogTitle>
            <AlertDialogDescription>
              Duplicate clients can lead to data fragmentation and disrupt the overall journey of a single client. The items below have been identified as possible duplicates of each other. You may merge the duplicate clients together or ignore and keep them as separate records. Note that merging **cannot be undone**.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMerge}>Confirm Merge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResultDialog} onOpenChange={handleResultClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {mergeSuccess ? 'Success' : 'Error'}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <Alert variant={mergeSuccess ? "default" : "destructive"}>
            <div className="flex items-center">
              {mergeSuccess ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              <AlertDescription>{resultMessage}</AlertDescription>
            </div>
          </Alert>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleResultClose}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MergeRecords;
'use client'
import React, { useState, ChangeEvent, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';
import { CommissionLog, CommissionLogEntry } from '@/types/commissionlog';
import { Input, FileInput, Select } from '@/components/Input';
import { PanelContainer } from '@/components/Containers'
import { excelDateToJSDate } from '@/lib/excel';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
import LoadingButton from '@/components/Button/LoadingButton';
import LoadingButtonNP from '@/components/Button/LoadingButtonNP';
import { getCarrier } from '../_actions/retrievedata';
import { IoMdCheckmarkCircle, IoMdCloseCircle } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import { ToolTip } from '@/components/Common/ToolTip';
import PreviewLogEntries from './PreviewLogEntries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogDescription } from '@radix-ui/react-dialog';

const isValidDate = (value: string) => !isNaN(Date.parse(value)) && !isNaN(new Date(value).getTime());

const renderValidationIcon = (isValid: boolean, message: string, index: number) => {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 * index, duration: 0.5 }}
    >
      {isValid ? (
        <ToolTip message={message}>
          <IoMdCheckmarkCircle className="text-success" size={28} />
        </ToolTip>
      ) : (
        <ToolTip message={message}>
          <IoMdCloseCircle className="text-danger" size={28} />
        </ToolTip>
      )}
    </motion.div>
  )
};

const AddCommissionLog = ({ selectedCommissionLog, advisorList, onClose, setLogFocus }: { selectedCommissionLog?: CommissionLog, advisorList: any[], onClose: any, setLogFocus?: any }) => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [carrier, setCarrier] = useState<{ id: string, carrierName: string }>({ id: '', carrierName: '' });
  const [step, setStep] = useState(1);
  const [fileInfo, setFileInfo] = useState<string>('');
  const [records, setRecords] = useState<any[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [readcomplete, setReadComplete] = useState<boolean>(false);
  const [commissionLog, setCommissionLog] = useState<CommissionLog>(selectedCommissionLog || {
    carrier: undefined,
    carrierId: {
      id: undefined,
      carrierName: undefined
    },
    statementPeriodStartDate: new Date().toISOString().slice(0, 10),
    statementPeriodEndDate: new Date().toISOString().slice(0, 10),
    statementDate: new Date().toISOString().slice(0, 10),
    statementAmount: 0,
    totalPostMarkupRevenue: 0,
    bankDepositStatus: undefined,
    deposit: undefined,
    payrollStatus: undefined,
    depositDate: new Date().toISOString().slice(0, 10),
  });

  const commissionLogTemplate = [
    { label: 'Carrier', value: commissionLog.carrier },
    { label: 'Statement Period Start Date', value: commissionLog?.statementPeriodStartDate },
    { label: 'Statement Period End Date', value: commissionLog?.statementPeriodEndDate },
    { label: 'Statement Date', value: commissionLog?.statementDate },
    { label: 'Total Commission Deposited', value: `$${commissionLog?.statementAmount?.toLocaleString()}` },
  ];

  const [commissionLogValid, setCommissionLogValid] = useState<boolean[]>([false, false, false, false, false]);
  const [commissionLogMessage, setCommissionLogMessage] = useState<string[]>(['', '', '', '', '']);

  useEffect(() => {
    console.log('Updated commissionLog:', commissionLog);
  }, [commissionLog]);

  const handleExtractCommissionLog = async (workbook: XLSX.WorkBook) => {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const desiredCells = {
      carrier: 'B3',
      statementPeriodStart: 'B4',
      statementPeriodEnd: 'B5',
      statementDate: 'B6',
      statementAmount: 'B8',
    };
    let commissionLogTemp: any = {};

    for (const [key, cellAddress] of Object.entries(desiredCells)) {
      const cell = worksheet[cellAddress];
      commissionLogTemp[key] = cell ? cell.v : null;
    }

    console.log('Extracted data:', commissionLogTemp);

    // Convert string dates to JS dates where necessary
    const convertedStartDate = excelDateToJSDate(commissionLogTemp.statementPeriodStart).toISOString().slice(0, 10);
    const convertedEndDate = excelDateToJSDate(commissionLogTemp.statementPeriodEnd).toISOString().slice(0, 10);

    const tempCommissionLog = {
      id: commissionLog?.id || null,
      carrier: commissionLogTemp.carrier,
      carrierId: {
        id: undefined,
        carrierName: undefined
      },
      statementPeriodStartDate: convertedStartDate,
      statementPeriodEndDate: convertedEndDate,
      statementDate: excelDateToJSDate(commissionLogTemp.statementDate).toISOString().slice(0, 10),
      statementAmount: Number(commissionLogTemp.statementAmount),
    };

    console.log('Converted commissionLog:', tempCommissionLog);

    // Check if the carrier exists to validate the first condition further
    const carrierExists = await getCarrier(tempCommissionLog.carrier);
    console.log('Carrier exists:', carrierExists);

    // Validate all conditions and prepare detailed messages
    const validations = [
      carrierExists?.carrierName == tempCommissionLog.carrier,
      tempCommissionLog.statementPeriodEndDate >= tempCommissionLog.statementPeriodStartDate,
      tempCommissionLog.statementPeriodEndDate >= tempCommissionLog.statementPeriodStartDate,
      isValidDate(tempCommissionLog.statementDate),
      !isNaN(tempCommissionLog.statementAmount) && tempCommissionLog.statementAmount >= -10000000,
    ];

    console.log('Validations:', validations);

    // Detailed messages for each validation, explaining the reason for failure
    const validationMessages = [
      carrierExists?.carrierName == tempCommissionLog.carrier ? `${tempCommissionLog.carrier} is valid since it is found in our system` : `The carrier ${tempCommissionLog.carrier} specified does not exist or was not entered. Please provide a valid carrier name.`,
      tempCommissionLog.statementPeriodEndDate >= tempCommissionLog.statementPeriodStartDate ? 'Valid statement period dates.' : 'The statement period end date must be the same as or after the start date. Please check the dates.',
      tempCommissionLog.statementPeriodEndDate >= tempCommissionLog.statementPeriodStartDate ? 'Valid statement period dates.' : 'The statement period end date must be the same as or after the start date. Please check the dates.',
      isValidDate(tempCommissionLog.statementDate) ? 'Valid statement date.' : 'Invalid statement date. Please check the format.',
      !isNaN(tempCommissionLog.statementAmount) && tempCommissionLog.statementAmount >= -10000000 ? 'Valid commission amount.' : 'Invalid commission amount. Please check the value.',
    ];

    const updatedCommissionLog = {
      ...tempCommissionLog,
      deposit: undefined,
      totalPostMarkupRevenue: 0,
      id: tempCommissionLog.id || undefined,
    };
    setCommissionLog(updatedCommissionLog);
    if (carrierExists?.carrierName == tempCommissionLog.carrier) {
      setCarrier(carrierExists);
      setCommissionLog({ ...updatedCommissionLog, carrierId: carrierExists.id });
    }
    setCommissionLogValid(validations);
    setCommissionLogMessage(validationMessages);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    // setLogFocus(true);
    const files = e.target.files;
    if (files && files[0]) {
      setFile(files[0]);
      setUploadError('');
    }
  };

  const handleValidateFile = async () => {
    setStep(2);
    if (file) {
      console.log('Uploading file:', file.name);
      setFileInfo('Validating file: ' + file.name + '. Please wait!!');
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const arrayBuffer = e.target?.result;
          if (arrayBuffer instanceof ArrayBuffer) {
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            setReadComplete(false);
            await handleExtractCommissionLog(workbook);
            setReadComplete(true);
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            setRecords(rows);
          }
        } catch (error) {
          console.error('Error:', error);
          setUploadError(error instanceof Error ? error.message : String(error));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <>
      <PanelContainer
        header="1. Select file to upload"
        collapse={step > 1}
        className='mb-2'
      >
        <FileInput onChange={handleFileChange} accept=".xlsx, .xls" label="Use below button to select the file." name="fileupload" />
        {file && (
          <LoadingButton onClick={handleValidateFile}
            className="bg-success w-[12rem] text-white px-4 py-2 rounded-md mt-4"
          >
            Loading Content
          </LoadingButton>
        )}
        {uploadError && <p className="error">{uploadError}</p>}
      </PanelContainer>
      
      <Dialog open={step >= 2} onOpenChange={() => setStep(1)}>
        <DialogContent className="max-w-[90vw] w-full h-full max-h-[85vh] overflow-y-auto z-999">
          <DialogHeader>
            <DialogTitle>2. Extract Commission Data</DialogTitle>
          </DialogHeader>
          <motion.div
            className='pl-0 w-fit'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {commissionLogTemplate.map(({ label, value }, index) => (
              <div key={index} className='mb-2 flex flex-row justify-between items-center space-x-2'>
                <p>{label}: <strong>{readcomplete && value}</strong></p>
                {records.length > 0 && readcomplete && renderValidationIcon(commissionLogValid[index], commissionLogMessage[index], index)}
              </div>
            ))}
          </motion.div>
          {commissionLogValid.every(isValid => isValid) &&
            <PreviewLogEntries 
              carrier={carrier} 
              commissionLog={commissionLog} 
              records={records} 
              advisorList={advisorList} 
              onClose={onClose} 
            />
          }
          {!readcomplete && <img className="h-16 animate-spin" src="/images/eauclaire/logo.svg" alt="Loading" />}
          {readcomplete && !commissionLogValid.every(isValid => isValid) && (
            <button className="bg-danger text-white px-4 py-2 rounded-md mt-4"
              onClick={() => window.location.reload()}
            >
              Fix the error and re-import
            </button>
          )}
          <DialogDescription></DialogDescription>
        </DialogContent>
      </Dialog>

      <Dialog open={step >= 3} onOpenChange={() => setStep(2)}>
        <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>3. Validate file content</DialogTitle>
          </DialogHeader>
          <TypewriterEffectSmooth words={fileInfo} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddCommissionLog;
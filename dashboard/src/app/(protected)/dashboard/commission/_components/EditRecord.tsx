import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { CommissionLog } from '@/types/commissionlog';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getCarriers, getAdvisorNameList } from '../_actions/retrievedata';
import AddCommissionLog from './AddCommissionLog';
import { normalize } from '@/lib/format';
import { findChanges } from '@/lib/updateRecord';
import { getCommissionLog, modifyCommissionLog, revalidating } from '../_actions/commission';
import { Checkbox } from "@/components/ui/checkbox";

interface EditRecordProps {
  selectedCommissionLogId: string | null;
  onClose: () => void;
  isOpen: boolean;
}

const EditRecord: React.FC<EditRecordProps> = ({ selectedCommissionLogId, onClose, isOpen }) => {
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CommissionLog>({
    defaultValues: {
      carrierId: { id: '' },
      statementDate: '',
      statementAmount: 0,
      depositDate: '',
      deposit: 0,
      fieldPayDate: '',
      payrollStatus: '',
      // Add other fields as necessary
    }
  });

  const [carrierOptions, setCarrierOptions] = useState<any[]>([]);
  const [advisorList, setAdvisorList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalStatement, setOriginalStatement] = useState<File | null>(null);
  const [oldData, setOldData] = useState<CommissionLog | null>(null);
  const [logFocus, setLogFocus] = useState(false);
  const [payrollStatusOptions, setPayrollStatusOptions] = useState<any[]>([]);
  
  const formData = watch();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [carriers, advisors] = await Promise.all([getCarriers(), getAdvisorNameList()]);
        setCarrierOptions(carriers);
        setAdvisorList(advisors);

        if (selectedCommissionLogId) {
          const response = await getCommissionLog(selectedCommissionLogId);
          const responseData = await normalize(response);
          reset(responseData);
          if (responseData?.payrollStatus === 'Just In') {
            setPayrollStatusOptions([{ id: 'Just In', name: 'Just In' }, { id: 'Issue', name: 'Issue' }]);
          } else if (responseData?.payrollStatus === 'Current Pay Run') {
            setPayrollStatusOptions([{ id: 'Current Pay Run', name: 'Current Pay Run' }, { id: 'Issue', name: 'Issue' }, { id: 'Just In', name: 'Just In' }]);
          }
          setOldData(responseData);
          
          if (responseData.carrierId && responseData.carrierId.id) {
            setValue('carrierId.id', responseData.carrierId.id.toString());
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error (e.g., show user-friendly error message)
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCommissionLogId, reset, setValue]);

  const submitFunction = async (formData: CommissionLog) => {
    setIsSubmitting(true);
    try {
      const diff = findChanges(oldData, formData);
      if (Object.keys(diff).length !== 0 || originalStatement) {
        const newFormData = new FormData();
        newFormData.append('data', JSON.stringify({
          ...diff,
          carrierId: { id: formData.carrierId.id },
          bankDepositStatus: formData?.deposit ? 'Deposit Received' : 'Statement Only',
        }));
        if (originalStatement) {
          newFormData.append('files.originalStatement', originalStatement, `commissionLog_statement_${originalStatement.name}`);
        }
        if (formData?.id) {
          const response = await modifyCommissionLog(formData.id, newFormData);
          if (response.success) {
            await revalidating();
            onClose();
          }
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error (e.g., show user-friendly error message)
    } finally {
      setIsSubmitting(false);
    }
  };

  const LoadingField = () => (
    <Skeleton className="h-10 w-full" />
  );

  return (
    <form onSubmit={handleSubmit(submitFunction)} className="space-y-6">
      <Card>
        <CardContent>
          <div className="text-lg font-semibold flex items-center justify-between pt-6">
            <div className="text-lg font-semibold flex items-center justify-start space-x-4">
              <span>Carrier</span>
              {isLoading ? (
                <LoadingField />
              ) : (
                <Controller
                  name="carrierId.id"
                  control={control}
                  rules={{ required: 'Carrier is required' }}
                  render={({ field }) => (
                    <Select 
                      onValueChange={(value) => field.onChange(value)} 
                      value={field.value || ''}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Carrier" />
                      </SelectTrigger>
                      <SelectContent className=''>
                        {carrierOptions.map((carrier) => (
                          <SelectItem key={carrier.id} value={carrier.id.toString()}>
                            {carrier.carrierName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              )}
            </div>
            <div className="space-y-2 flex items-center space-x-2">
              {isLoading ? (
                <Skeleton className="h-4 w-[100px]" />
              ) : (
                <Controller
                  name="payrollStatus"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="payrollStatus"
                        checked={field.value === 'Issue'}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? 'Issue' : 'Just In');
                        }}
                      />
                      <Label htmlFor="payrollStatus">Issue?</Label>
                    </div>
                  )}
                />
              )}
            </div>
            <div>
              {isLoading ? (
                  <Skeleton className="h-4 w-[100px]" />
                ) : (
                  <Controller
                    name="payrollStatus"
                    control={control}
                    rules={{ required: 'Payroll status is required' }}
                    render={({ field }) => (
                      <Select 
                        onValueChange={(value) => field.onChange(value)} 
                        value={field.value || ''}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select Payroll Status" />
                        </SelectTrigger>
                        <SelectContent className='z-9999'>
                          {payrollStatusOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}              
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Statement Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="statementDate">Statement Date</Label>
            {isLoading ? (
              <LoadingField />
            ) : (
              <Controller
                name="statementDate"
                control={control}
                render={({ field }) => (
                  <Input id="statementDate" type="date" {...field} value={field.value ?? ''} />
                )}
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="statementAmount">Statement Amount</Label>
            {isLoading ? (
              <LoadingField />
            ) : (
              <Controller
                name="statementAmount"
                control={control}
                render={({ field }) => (
                  <Input id="statementAmount" type="number" step="0.01" {...field} value={field.value ?? ''} />
                )}
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="originalStatement">Original Statement</Label>
            <Input
              id="originalStatement"
              type="file"
              onChange={(e) => setOriginalStatement(e.target.files?.[0] || null)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Bank Deposit Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="depositDate">Deposit Date</Label>
            {isLoading ? (
              <LoadingField />
            ) : (
              <Controller
                name="depositDate"
                control={control}
                render={({ field }) => (
                  <Input id="depositDate" type="date" {...field} value={field.value ?? ''} />
                )}
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit">Deposit Amount</Label>
            {isLoading ? (
              <LoadingField />
            ) : (
              <Controller
                name="deposit"
                control={control}
                render={({ field }) => (
                  <Input id="deposit" type="number" step="0.01" {...field} value={field.value ?? ''} />
                )}
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fieldPayDate">Field Pay Date</Label>
            {isLoading ? (
              <LoadingField />
            ) : (
              <Controller
                name="fieldPayDate"
                control={control}
                render={({ field }) => (
                  <Input id="fieldPayDate" type="date" {...field} value={field.value ?? ''} />
                )}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">ECO Commission Log</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <AddCommissionLog
              selectedCommissionLog={formData}
              advisorList={advisorList}
              onClose={onClose}
              setLogFocus={setLogFocus}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? 'Submitting...' : 'Confirm'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EditRecord;
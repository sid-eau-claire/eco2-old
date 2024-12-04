import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getCarriers, getAdvisorNameList } from '../_actions/retrievedata';
import { createCommissionLog, revalidating } from '../_actions/commission';
import { DialogDescription } from '@radix-ui/react-dialog';
import AddCommissionLog from './AddCommissionLog'

const zCommissionLogSchema = z.object({
  carrierId: z.number().min(1, "Carrier is required"),
  statementDate: z.string().optional(),
  statementAmount: z.string().optional(),
  depositDate: z.string().optional(),
  deposit: z.string().optional(),
  fieldPayDate: z.string().optional(),
});

type CommissionLog = z.infer<typeof zCommissionLogSchema>;

const AddRecord = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<CommissionLog>({
    resolver: zodResolver(zCommissionLogSchema),
    defaultValues: {
      carrierId: undefined,
      statementDate: "",
      statementAmount: "",
      depositDate: "",
      deposit: "",
      fieldPayDate: "",
    }
  });

  const [carrierOptions, setCarrierOptions] = useState<any[]>([]);
  const [advisorList, setAdvisorList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalStatement, setOriginalStatement] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const carriers = await getCarriers();
      const advisors = await getAdvisorNameList();
      setCarrierOptions(carriers);
      setAdvisorList(advisors);
    };
    fetchData();
  }, []);

  const submitFunction = async (data: CommissionLog) => {
    setIsSubmitting(true);
    const formData = new FormData();
    
    // Convert empty strings to null for numeric and date fields
    const processedData = {
      ...data,
      statementDate: data.statementDate === "" ? null : data.statementDate,
      statementAmount: data.statementAmount === "" ? null : Number(data.statementAmount),
      depositDate: data.depositDate === "" ? null : data.depositDate,
      deposit: data.deposit === "" ? null : Number(data.deposit),
      fieldPayDate: data.fieldPayDate === "" ? null : data.fieldPayDate,
      bankDepositStatus: data.deposit && data.deposit !== "" ? 'Deposit Received' : 'Statement Only',
    };

    formData.append('data', JSON.stringify(processedData));

    if (originalStatement) {
      formData.append('files.originalStatement', originalStatement, `commissionLog_statement_${originalStatement.name}`);
    }

    try {
      const response = await createCommissionLog(formData);
      if (response.success) {
        await revalidating();
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(submitFunction)} className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-start space-x-4 space-y-0 pb-2">
            <CardTitle className="text-lg">Carrier</CardTitle>
            <div className="w-full sm:w-64">
              <Controller
                name="carrierId"
                control={control}
                rules={{ required: "Carrier is required" }}
                render={({ field }) => (
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))} 
                    value={field.value ? field.value.toString() : undefined}
                  >
                    <SelectTrigger id="carrierId" className="w-full">
                      <SelectValue placeholder="Select Carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {carrierOptions.map((carrier) => (
                        <SelectItem key={carrier.id} value={carrier.id.toString()}>
                          {carrier.carrierName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardHeader>
          <CardContent>
            {errors.carrierId && <p className="text-red-500 text-sm mt-1">{errors.carrierId.message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statement Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="statementDate">Statement Date</Label>
                <Controller
                  name="statementDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="statementDate"
                      type="date"
                      {...field}
                      value={field.value || ""}
                    />
                  )}
                />
                {errors.statementDate && <p className="text-red-500">{errors.statementDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="statementAmount">Statement Amount</Label>
                <Controller
                  name="statementAmount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="statementAmount"
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value || ""}
                    />
                  )}
                />
                {errors.statementAmount && <p className="text-red-500">{errors.statementAmount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalStatement">Original Statement</Label>
                <Input
                  id="originalStatement"
                  type="file"
                  onChange={(e) => setOriginalStatement(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bank Deposit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depositDate">Deposit Date</Label>
                <Controller
                  name="depositDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="depositDate"
                      type="date"
                      {...field}
                      value={field.value || ""}
                    />
                  )}
                />
                {errors.depositDate && <p className="text-red-500">{errors.depositDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit">Deposit Amount</Label>
                <Controller
                  name="deposit"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="deposit"
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value || ""}
                    />
                  )}
                />
                {errors.deposit && <p className="text-red-500">{errors.deposit.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldPayDate">Field Pay Date</Label>
                <Controller
                  name="fieldPayDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="fieldPayDate"
                      type="date"
                      {...field}
                      value={field.value || ""}
                    />
                  )}
                />
                {errors.fieldPayDate && <p className="text-red-500">{errors.fieldPayDate.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ECO Log</CardTitle>
          </CardHeader>
          <CardContent>
            <AddCommissionLog
                advisorList={advisorList}
                onClose={onClose}
              //  setLogFocus={setLogFocus}
              />
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Confirm'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </>
    // <Dialog open={isOpen} onOpenChange={onClose}>
    //   <DialogContent className="sm:max-w-[90%] max-h-[80vh] overflow-y-auto z-50">
    //     <DialogHeader>
    //       <DialogTitle className="text-xl">Add New Commission Log</DialogTitle>
    //     </DialogHeader>
    //     <DialogDescription></DialogDescription>
    //   </DialogContent>
    // </Dialog>
  );
};

export default AddRecord;
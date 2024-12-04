import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTarget, updateTarget } from '../_actions/target'; // Adjust the import based on your file structure

interface EditRecordProps {
  advisor: number;
  year: number;
  month: number;
  onClose: () => void;
}

const EditRecord: React.FC<EditRecordProps> = ({ advisor, year, month, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    const target = {
      profileId: advisor,
      year,
      month,
      noCoreApp: parseInt(data.noCoreApp),
      coreMPE: parseFloat(data.coreMPE),
      noInvestmentApp: parseInt(data.noInvestmentApp),
      investmentAUM: parseFloat(data.investmentAUM),
      noSettledRevenue: parseInt(data.noSettledRevenue),
      settleRevenue: parseFloat(data.settleRevenue),
      noOfSubscription: parseInt(data.noOfSubscription),
      noOfLicensed: parseInt(data.noOfLicensed),
      status: 'Now Set'
    };

    try {
      await createTarget(target);
      onClose();
    } catch (error) {
      console.error('Error creating/updating target:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set your OKR target for {year}-{month}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="noCoreApp" className="text-right">No. Core Applications</Label>
              <Input id="noCoreApp" type="number" className="col-span-3" {...register('noCoreApp', { required: true })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coreMPE" className="text-right">Core MPE</Label>
              <Input id="coreMPE" type="number" step="0.01" className="col-span-3" {...register('coreMPE', { required: true })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="noInvestmentApp" className="text-right">No. Investment Applications</Label>
              <Input id="noInvestmentApp" type="number" className="col-span-3" {...register('noInvestmentApp', { required: true })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="investmentAUM" className="text-right">Investment AUM</Label>
              <Input id="investmentAUM" type="number" step="0.01" className="col-span-3" {...register('investmentAUM', { required: true })} />
            </div>
            {/* <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="noSettledRevenue" className="text-right">No. Settled Revenues</Label>
              <Input id="noSettledRevenue" type="number" className="col-span-3" {...register('noSettledRevenue', { required: true })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="settleRevenue" className="text-right">Settle Revenue</Label>
              <Input id="settleRevenue" type="number" step="0.01" className="col-span-3" {...register('settleRevenue', { required: true })} />
            </div> */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="noOfSubscription" className="text-right">No. of Subscription</Label>
              <Input id="noOfSubscription" type="number" className="col-span-3" {...register('noOfSubscription', { required: true })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="noOfLicensed" className="text-right">No. of Licensed</Label>
              <Input id="noOfLicensed" type="number" className="col-span-3" {...register('noOfLicensed', { required: true })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Submit for Approval</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecord;
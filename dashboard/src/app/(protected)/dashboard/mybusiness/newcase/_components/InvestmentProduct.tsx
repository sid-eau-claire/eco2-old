'use client'
import React, { useEffect, useRef, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { MdAddCircle } from "react-icons/md";
import { IoCloseCircle } from "react-icons/io5";
import { getFundCategory, getInvestmentFeeType, getCommissionDistributionGS } from '../_actions/retrievedata';

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import CurrencyInputComponent from '@/components/ui/CurrencyInput'; // Assuming you've saved the CurrencyInput in a separate file

function calculateRecurringDepositsPerYear(frequency: string) {
  const frequencies: { [key: string]: number } = {
    'Weekly': 52,
    'Bi-Weekly': 26,
    'Twice a month': 24,
    'Monthly': 12,
    'Quarterly': 4
  };

  return frequencies[frequency] || 0;
}

const InvestmentProduct = ({ form, currentStep, setCurrentStep, markComplete, isEditable }: { form: any, currentStep: number, setCurrentStep: any, markComplete: any, isEditable?: boolean }) => {
  const [fundCategories, setFundCategories] = useState<any[]>([]);
  const [isNoCategory, setIsNoCategory] = useState<boolean>(false);
  const [investmentFeeTypes, setInvestmentFeeTypes] = useState<any[]>([]);
  const [commissionDistributionGS, setCommissionDistributionGS] = React.useState<any>(null);
  const [corporateMarginPercentInvestment, setCorporateMarginPercentInvestment] = React.useState<number>(0);

  const { control, setValue, getValues, resetField, watch } = form;
  const formData = watch();
  const completionRef = useRef(false);
  const firstAccessRef = useRef(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'appInvProducts'
  });

  useEffect(() => {
    const fetchGS = async () => {
      const response = await getCommissionDistributionGS();
      setCommissionDistributionGS(response);
      setCorporateMarginPercentInvestment(response.find((item: any) => item.name === 'corporateMarginPercentInvestment')?.value);
    };
    fetchGS();
  }, []);

  useEffect(() => {
    const fetchFundCategories = async () => {
      const response = await getFundCategory(formData?.appInfo?.carrierId);
      setIsNoCategory(response[0]?.name == 'nocategory');
      setFundCategories(response);
    };
    const fetchInvestmentFeeType = async () => {
      const response = await getInvestmentFeeType();
      setInvestmentFeeTypes(response);
    };
    fetchFundCategories();
    fetchInvestmentFeeType();
  }, [formData?.appInfo?.carrierId]);

  useEffect(() => {
    fields.forEach((field: any, index) => {
      const isLumpSum = getValues(`appInvProducts[${index}].isLumpSum`);
      const isRecurring = getValues(`appInvProducts[${index}].isRecurring`);
      const lumpSumDeposit = Number(getValues(`appInvProducts[${index}].lumpSumDeposit`));
      const recurringDeposit = Number(getValues(`appInvProducts[${index}].recurringDeposit`));
      const frequency = getValues(`appInvProducts[${index}].frequency`);
      const feeTypeId = getValues(`appInvProducts[${index}].feeTypeId`);
      const feePercentage = Number(investmentFeeTypes.find((investmentFeeType: any) => investmentFeeType.id == feeTypeId)?.feePercentage);
      const lumpSumEstFieldRevenue = isLumpSum ? lumpSumDeposit * feePercentage * (1 - corporateMarginPercentInvestment / 100) : 0;
      const recurringEstFieldRevenue = isRecurring ? recurringDeposit * calculateRecurringDepositsPerYear(frequency) * feePercentage * (1 - corporateMarginPercentInvestment / 100) : 0;
      const lumpSumAUM = isLumpSum ? lumpSumDeposit : 0
      const recurringAUM = isRecurring ? recurringDeposit * calculateRecurringDepositsPerYear(frequency) : 0
      const annualAUM = lumpSumAUM + recurringAUM
      const estFieldRevenue = lumpSumEstFieldRevenue + recurringEstFieldRevenue;

      if (!isNaN(estFieldRevenue) && field.estFieldRevenue != estFieldRevenue) {
        const currentEstFieldRevenue = getValues(`appInvProducts[${index}].estFieldRevenue`);
        const formattedEstFieldRevenue = estFieldRevenue.toFixed(2);
        if (currentEstFieldRevenue != formattedEstFieldRevenue) {
          setValue(`appInvProducts[${index}].estFieldRevenue`, formattedEstFieldRevenue, { shouldDirty: true });
        }
        const currentAnnualAUM = getValues(`appInvProducts[${index}].annualAUM`);
        const formattedAnnualAUM = annualAUM.toFixed(2);
        if (currentAnnualAUM != formattedAnnualAUM) {
          setValue(`appInvProducts[${index}].annualAUM`, formattedAnnualAUM, { shouldDirty: true });
        }
      }
    });

    const totalEstFieldRevenue = formData.appInvProducts.reduce((total: number, product: any) => {
      return total + parseFloat(product.estFieldRevenue || 0);
    }, 0);
    const totalAnnualAUM = formData.appInvProducts.reduce((total: number, product: any) => {
      return total + parseFloat(product.annualAUM || 0);
    }, 0)
    const currentTotalEstFieldRevenue = getValues('totalEstFieldRevenue');
    const formattedTotalRevenue = totalEstFieldRevenue.toFixed(2);
    if (currentTotalEstFieldRevenue !== formattedTotalRevenue) {
      setValue('totalEstFieldRevenue', formattedTotalRevenue, { shouldDirty: true });
    }
    const currentTotalAnnualAUM = getValues('totalAnnualAUM');
    const formattedTotalAnnualAUM = totalAnnualAUM.toFixed(2);
    if (currentTotalAnnualAUM !== formattedTotalAnnualAUM) {
      setValue('totalAnnualAUM', formattedTotalAnnualAUM, { shouldDirty: true });
    }
  }, [fields.map((field, index) => getValues(`appInvProducts[${index}].lumpSumDeposit`)),
      fields.map((field, index) => getValues(`appInvProducts[${index}].recurringDeposit`)),
      fields.map((field, index) => getValues(`appInvProducts[${index}].feeTypeId`)),]);

  useEffect(() => {
    fields.forEach((product: any, index: number) => {
      if (isNoCategory && `appInvProducts[${index}].categoryId` != fundCategories[0]?.id) {
        product.categoryId = fundCategories[0]?.id
      }
    })
  }, [fields.map((field, index) => getValues(`appInvProducts[${index}].registrationType`))]);

  useEffect(() => {
    if (formData?.appInvProducts?.length > 0) {
      const allFieldsFilled = formData?.appInvProducts.every((field: any) =>
        field.applicantIndex !== undefined &&
        field.registrationType !== '' &&
        field.categoryId !== '' &&
        field.feeTypeId !== '' &&
        field.lumpSumDeposit !== 0 &&
        field.lumpRecurringDeposit !== 0 &&
        field.estFieldRevenue !== 0 &&
        formData?.estSettledDays !== '' &&
        formData?.estSettledDays != undefined
      );
      if (allFieldsFilled && !completionRef.current) {
        completionRef.current = true;
        markComplete(currentStep, true);
      } else if (!allFieldsFilled && completionRef.current) {
        completionRef.current = false;
        markComplete(currentStep, false);
      }
    }
  }, [formData, currentStep, markComplete]);

  const handleAddProduct = (applicantIndex: number, fieldIndex?: number) => {
    let currentCount = fieldIndex !== undefined ? fieldIndex : formData?.appInvProducts?.length || 0;
    append({
      applicantIndex,
      fieldIndex: currentCount,
      registrationType: '',
      categoryId: '',
      frequency: '',
      deposit: 0,
      feeTypeId: '',
      estFieldRevenue: 0
    });
  };

  if (formData && !firstAccessRef.current && formData?.applicants && formData?.applicants?.length > 0) {
    firstAccessRef.current = true;
    const temp = formData.appInsProducts?.filter((product: any) =>
      formData.applicants.some((applicant: any, index: number) => index == product.applicantIndex)
    );
    setValue('appInsProducts', temp, { shouldDirty: true })
    formData.applicants?.forEach((applicant: any, index: number) => {
      if (formData?.appInsProducts?.some((product: any) => product.applicantIndex == index)) return;
      handleAddProduct(index, index);
    })
  }

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = fields.filter((_, idx) => idx !== index);
    const productsWithUpdatedIndices = updatedProducts.map((product, idx) => ({
      ...product,
      fieldIndex: idx
    }));
    resetField('appInvProducts', {
      defaultValue: productsWithUpdatedIndices,
    });
  };

  const groupedFields = formData?.appInvProducts?.reduce((acc: any, product: any) => {
    const index = product.applicantIndex;
    if (!acc[index]) {
      acc[index] = [];
    }
    acc[index].push(product);
    return acc;
  }, {});

  return (
    <Form {...form}>
      {groupedFields && Object.keys(groupedFields).map((groupIndex, aindex) => (
        <Card key={aindex}>
          <CardContent className="space-y-4">
            {groupedFields[groupIndex] && groupedFields[groupIndex][0] && (
              <h3 className="font-semibold">Applicant {aindex + 1}: {formData?.applicants[groupIndex]?.firstName} {formData?.applicants[groupIndex]?.lastName}</h3>
            )}
            {groupedFields[groupIndex] && groupedFields[groupIndex].map((field: any, index: number) => (
              <Card key={field.id} className="relative">
                <CardContent className="space-y-4">
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      type="button"
                      size="icon"
                      onClick={() => { if (groupedFields[groupIndex].length > 1) { handleRemoveProduct(field.fieldIndex) } }}
                      disabled={!isEditable}
                    >
                      <IoCloseCircle className="h-8 w-8" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                      control={control}
                      name={`appInvProducts[${index}].registrationType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!isEditable}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Registration Type" />
                            </SelectTrigger>
                            <SelectContent className='z-9999'>
                              {['RRSP', 'RRSP - Spousal', 'TFSA', 'RESP', 'LIRA/PENSIONS', 'RDSP', 'Non-Registered', 'FHSA'].map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    {formData?.appInvProducts[index]?.registrationType != '' && fundCategories?.length > 0 && !isNoCategory && (
                      <FormField
                        control={control}
                        name={`appInvProducts[${index}].categoryId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category ID</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!isEditable}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                              <SelectContent className='z-9999'>
                                {fundCategories.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    )}
                    {formData?.appInvProducts[index]?.categoryId != '' && investmentFeeTypes?.length > 0 && (
                      <FormField
                        control={control}
                        name={`appInvProducts[${index}].feeTypeId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fee Type ID</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!isEditable}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Fee Type" />
                              </SelectTrigger>
                              <SelectContent className='z-9999'>
                                {investmentFeeTypes
                                  .filter((feeType) => feeType?.fundCategoryTypeId?.id == formData?.appInvProducts[index]?.categoryId)
                                  .map((feeType) => (
                                    <SelectItem key={feeType.id} value={feeType.id.toString()}>{feeType.name}</SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            </FormItem>
                        )}
                      />
                    )}
                    {(formData?.appInvProducts[index]?.feeTypeId != '') && isNoCategory && (
                      <FormField
                        control={control}
                        name={`appInvProducts[${index}].managementFee`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Management Fee Percentage</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" disabled={!isEditable} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                    {(formData?.appInvProducts[index]?.feeTypeId != '') && (
                      <>
                        <FormField
                          control={control}
                          name={`appInvProducts[${index}].isLumpSum`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!isEditable}
                                />
                              </FormControl>
                              <FormLabel>Lump Sum?</FormLabel>
                            </FormItem>
                          )}
                        />
                        {formData?.appInvProducts[index]?.isLumpSum && (
                          <FormField
                            control={control}
                            name={`appInvProducts[${index}].lumpSumDeposit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lump Sum Deposit</FormLabel>
                                <FormControl>
                                  <CurrencyInputComponent
                                    {...field}
                                    disabled={!isEditable}
                                    onChange={(value) => field.onChange(value)}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        )}
                        {formData?.appInvProducts[index]?.lumpSumDeposit && formData?.appInvProducts[index]?.feeTypeId && formData?.appInvProducts[index]?.lumpSumDeposit > 0 && formData?.appInvProducts[index]?.feeTypeId > 0 && (
                          <p className="text-sm text-gray-500">AUM: ${formData?.appInvProducts[index]?.lumpSumDeposit}</p>
                        )}
                      </>
                    )}
                    {(formData?.appInvProducts[index]?.feeTypeId != '') && (
                      <>
                        <FormField
                          control={control}
                          name={`appInvProducts[${index}].isRecurring`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={!isEditable}
                                />
                              </FormControl>
                              <FormLabel>Recurring?</FormLabel>
                            </FormItem>
                          )}
                        />
                        {formData?.appInvProducts[index]?.isRecurring && (
                          <>
                            <FormField
                              control={control}
                              name={`appInvProducts[${index}].frequency`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Frequency</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value} disabled={!isEditable}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Frequency" />
                                    </SelectTrigger>
                                    <SelectContent className='z-9999'>
                                      {['Weekly', 'Bi-Weekly', 'Twice a month', 'Monthly', 'Quarterly'].map((freq) => (
                                        <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={control}
                              name={`appInvProducts[${index}].recurringDeposit`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Recurring deposit</FormLabel>
                                  <FormControl>
                                    <CurrencyInputComponent
                                      {...field}
                                      disabled={!isEditable}
                                      onChange={(value:any) => field.onChange(value)}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                        {formData?.appInvProducts[index]?.recurringDeposit && formData?.appInvProducts[index]?.feeTypeId && formData?.appInvProducts[index]?.recurringDeposit > 0 && formData?.appInvProducts[index]?.feeTypeId > 0 && (
                          <p className="text-sm text-gray-500">AUM: ${formData?.appInvProducts[index]?.recurringDeposit}</p>
                        )}
                      </>
                    )}
                    {(formData?.appInvProducts[index]?.lumpSumDeposit || formData?.appInvProducts[index]?.recurringDeposit) && (
                      <FormField
                        control={control}
                        name={`appInvProducts[${index}].estFieldRevenue`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Year Estimated Revenue</FormLabel>
                            <FormControl>
                              <CurrencyInputComponent
                                {...field}
                                disabled
                                onChange={(value:any) => field.onChange(value)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="ghost"
              onClick={() => handleAddProduct(Number(groupIndex))}
              disabled={!isEditable}
            >
              <MdAddCircle className="mr-2 h-8 w-8" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end items-center space-x-4">
        <FormField
          control={control}
          name="estSettledDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Est. Settled Days</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!isEditable}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Days" />
                </SelectTrigger>
                <SelectContent className='z-9999'>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="60">60 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="totalEstFieldRevenue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total First Year Estimated Revenue</FormLabel>
              <FormControl>
                <CurrencyInputComponent
                  {...field}
                  disabled
                  onChange={(value: any) => field.onChange(value)}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
};

export default InvestmentProduct;
'use client'
import React, { useEffect, useRef, useCallback } from 'react';
import { useFieldArray } from 'react-hook-form';
import { getProducts, getCommissionDistributionGS } from '../../_actions/retrievedata';
import { MdAddCircle } from "react-icons/md";
import { IoCloseCircle } from "react-icons/io5";

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import CurrencyInput from '@/components/ui/CurrencyInput';

const InsuranceProduct = ({ form, currentStep, setCurrentStep, markComplete, isEditable }: { form: any, currentStep: number, setCurrentStep: any, markComplete: any, isEditable?: boolean }) => {
  const { control, setValue, getValues, resetField, formState: { errors }, watch } = form;
  const firstAccessRef = useRef(false);
  const completionRef = useRef(false);
  const prevAppInsProductsRef = useRef<any[]>([]);
  const [commissionDistributionGS, setCommissionDistributionGS] = React.useState<any>(null);
  const [corporateMarginPercentDefault, setCorporateMarginPercentDefault] = React.useState<number>(0);
  const [corporateMarginPercentInvestment, setCorporateMarginPercentInvestment] = React.useState<number>(0);
  const [corporateMarginPercentAffiliates, setCorporateMarginPercentAffiliates] = React.useState<number>(0);
  const { fields, append, remove } = useFieldArray<any>({
    control,
    name: 'appInsProducts'
  });

  const [products, setProducts] = React.useState<any[]>([]);
  const [productCategoryList, setProductCategoryList] = React.useState<{id: string, name: string}[]>([]);

  const appInsProducts = watch('appInsProducts');
  const appInfo = watch('appInfo');
  const applicants = watch('applicants');

  useEffect(() => {
    const fetchGS = async () => {
      const response = await getCommissionDistributionGS();
      setCommissionDistributionGS(response);
      setCorporateMarginPercentDefault(response.find((item: any) => item.name === 'corporateMarginPercentDefault')?.value);
      setCorporateMarginPercentInvestment(response.find((item: any) => item.name === 'corporateMarginPercentInvestment')?.value); 
      setCorporateMarginPercentAffiliates(response.find((item: any) => item.name === 'corporateMarginPercentAffiliates')?.value);
    }
    fetchGS();
  }, []);

  useEffect(() => {
    const fetchProducts = async (carrierId: number) => {
      const response = await getProducts(carrierId);
      setProducts(response);
      const uniqueProductCategoryLists = new Set();
      const convertedProducts = response.reduce((acc: any[], product: any) => {
        const name = product.productcategoryId.name;
        const id = product.productcategoryId.id;
        if (!uniqueProductCategoryLists.has(name)) {
          uniqueProductCategoryLists.add(name);
          acc.push({ id: id.toString(), name: name });
        }
        return acc;
      }, []);
      setProductCategoryList(convertedProducts);
    };
    if (appInfo?.carrierId) {
      fetchProducts(appInfo.carrierId);
    }
  }, [appInfo?.carrierId]);

  const handleAddProduct = useCallback((applicantIndex: number, fieldIndex?: number) => {
    let currentCount = fieldIndex !== undefined ? fieldIndex : appInsProducts?.length || 0;
    append({
      applicantIndex,
      fieldIndex: currentCount,
      productCategory: '',
      productId: '',
      coverageFaceAmount: 0,
      annualPremium: 0,
      targetPremium: 0,
      estFieldRevenue: 0
    });
  }, [append, appInsProducts?.length]);

  const handleRemoveProduct = useCallback((index: number) => {
    const updatedProducts = fields.filter((_, idx) => idx !== index);
    const productsWithUpdatedIndices = updatedProducts.map((product, idx) => ({
      ...product,
      fieldIndex: idx
    }));
    resetField('appInsProducts', {
      defaultValue: productsWithUpdatedIndices,
    });
    updateAllRevenues();
  }, [fields, resetField]);

  useEffect(() => {
    if (!firstAccessRef.current && applicants && applicants.length > 0) {
      firstAccessRef.current = true;
      const temp = appInsProducts?.filter((product: any) =>
        applicants.some((applicant: any, index: number) => index == product.applicantIndex)
      );    
      setValue('appInsProducts', temp, { shouldDirty: true })
      applicants.forEach((applicant: any, index: number) => {
        if (appInsProducts?.some((product: any) => product.applicantIndex == index)) return;
        handleAddProduct(index, index);
      })
    }
  }, [applicants, appInsProducts, setValue, handleAddProduct]);

  const updateRevenue = useCallback((index: number) => {
    const product = getValues(`appInsProducts[${index}]`);
    let premium = Number(product.annualPremium);
    let excessPremium = 0;
    let premiumToUse = premium;
    
    if (premium > Number(product.targetPremium) && Number(product.targetPremium) !== 0) {
      excessPremium = premium - Number(product.targetPremium);
      premiumToUse = Number(product.targetPremium);
    }
    
    const productDetails = products.find(p => p.id.toString() === product.productId);
    const FYC = productDetails ? Number(productDetails.FYC) : 0;
    
    const excessRevenue = excessPremium * 0.05 * 3 * (1 - corporateMarginPercentDefault / 100);
    const calculatedRevenue = premiumToUse * FYC * 3 * (1 - corporateMarginPercentDefault / 100) + excessRevenue;
    const formattedRevenue = calculatedRevenue.toFixed(2);

    setValue(`appInsProducts[${index}].estFieldRevenue`, formattedRevenue, { shouldDirty: true });
    return Number(formattedRevenue);
  }, [getValues, products, corporateMarginPercentDefault, setValue]);

  const updateAllRevenues = useCallback(() => {
    const currentProducts = getValues('appInsProducts') || [];
    const totalEstFieldRevenue = currentProducts.reduce((total: number, _:any, index: number) => {
      return total + updateRevenue(index);
    }, 0);

    setValue('totalEstFieldRevenue', totalEstFieldRevenue.toFixed(2), { shouldDirty: true });
  }, [getValues, updateRevenue, setValue]);

  useEffect(() => {
    const prevAppInsProducts = prevAppInsProductsRef.current;
    if (JSON.stringify(prevAppInsProducts) !== JSON.stringify(appInsProducts)) {
      updateAllRevenues();
      prevAppInsProductsRef.current = appInsProducts;
    }
  }, [appInsProducts, updateAllRevenues]);

  useEffect(() => {
    if (appInsProducts?.length > 0) {
      const allFieldsFilled = appInsProducts.every((field: any) => 
        field.applicantIndex !== undefined &&
        field.productCategory !== '' &&
        field.productId !== '' &&
        field.coverageFaceAmount !== 0 &&
        field.annualPremium !== 0 &&
        field.estFieldRevenue !== 0 &&
        getValues('estSettledDays') !== '' &&
        getValues('estSettledDays') != undefined

      );
      if (allFieldsFilled && !completionRef.current) {
        completionRef.current = true;
        markComplete(currentStep, true);
      } else if (!allFieldsFilled && completionRef.current) {
        completionRef.current = false;
        markComplete(currentStep, false);
      }
    }
  }, [appInsProducts, currentStep, markComplete, getValues]);

  const groupedFields = appInsProducts?.reduce((acc: any, product: any) => {
    const index = product.applicantIndex;
    if (!acc[index]) {
      acc[index] = [];
    }
    acc[index].push(product);
    return acc;
  }, {});

  return (
    <Form {...form}>
      {groupedFields && Object.keys(groupedFields).map((applicantIndex, aindex) => (
        <Card key={aindex}>
          <CardContent className="space-y-4">
            {groupedFields[applicantIndex] && groupedFields[applicantIndex].length > 0 && groupedFields[applicantIndex][0] && (
              <h3 className="font-semibold">Applicant {Number(applicantIndex) + 1}: {applicants[groupedFields[applicantIndex][0].applicantIndex]?.firstName} {applicants[groupedFields[applicantIndex][0].applicantIndex]?.lastName}</h3>
            )}
            {groupedFields[applicantIndex] && groupedFields[applicantIndex].map((field: any, index: number) => (
              <Card key={field.id} className="relative">
                <CardContent className="space-y-4">
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => { if(groupedFields[applicantIndex].length > 1) handleRemoveProduct(field.fieldIndex) }}
                      disabled={!isEditable}
                    >
                      <IoCloseCircle className="h-8 w-8" />
                    </Button>
                  </div>
                  <input
                    type="hidden"
                    {...form.register(`appInsProducts[${field.fieldIndex}].applicantIndex`)}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                      control={control}
                      name={`appInsProducts[${field.fieldIndex}].productCategory`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!isEditable}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className='z-9999'>
                              {productCategoryList.map(({ id, name }) => (
                                <SelectItem key={id} value={id}>{name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    {field.productCategory && (
                      <FormField
                        control={control}
                        name={`appInsProducts[${field.fieldIndex}].productId`}
                        render={({ field: productField }) => (
                          <FormItem>
                            <FormLabel>Product</FormLabel>
                            <Select 
                              onValueChange={(value) => { 
                                productField.onChange(value); 
                                updateRevenue(field.fieldIndex);
                                updateAllRevenues();
                              }} 
                              value={productField.value} 
                              disabled={!isEditable}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Product" />
                              </SelectTrigger>
                              <SelectContent className='z-9999'>
                                {products
                                  .filter(product => product.productcategoryId.id.toString() == field.productCategory)
                                  .map((product) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>{product.name}</SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    )}
                    {field.productId && (
                      <>
                        <FormField
                          control={control}
                          name={`appInsProducts[${field.fieldIndex}].coverageFaceAmount`}
                          render={({ field: coverageField }) => (
                            <FormItem>
                              <FormLabel>Coverage</FormLabel>
                              <FormControl>
                                <CurrencyInput 
                                  {...coverageField} 
                                  disabled={!isEditable} 
                                  onChange={(value) => { 
                                    coverageField.onChange(value); 
                                    updateRevenue(field.fieldIndex);
                                    updateAllRevenues();
                                  }} 
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`appInsProducts[${field.fieldIndex}].annualPremium`}
                          render={({ field: premiumField }) => (
                            <FormItem>
                              <FormLabel>Annual Premium</FormLabel>
                              <FormControl>
                                <CurrencyInput 
                                  {...premiumField}
                                  disabled={!isEditable} 
                                  onChange={(value) => { 
                                    premiumField.onChange(value); 
                                    updateRevenue(field.fieldIndex);
                                    updateAllRevenues();
                                  }} 
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`appInsProducts[${field.fieldIndex}].estFieldRevenue`}
                          render={({ field: revenueField }) => (
                            <FormItem>
                              <FormLabel>Est. Revenue</FormLabel>
                              <FormControl>
                                <CurrencyInput {...revenueField} disabled className="bg-gray-100" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        {field.productCategory == 'Universal Life Insurance' && (
                          <FormField
                            control={control}
                            name={`appInsProducts[${field.fieldIndex}].targetPremium`}
                            render={({ field: targetField }) => (
                              <FormItem>
                                <FormLabel>Target Premium</FormLabel>
                                <FormControl>
                                  <CurrencyInput 
                                    {...targetField}
                                    disabled={!isEditable} 
                                    onChange={(value) => { 
                                      targetField.onChange(value); 
                                      updateRevenue(field.fieldIndex);
                                      updateAllRevenues();
                                    }} 
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        )}
                      </>
                    )}
                  </div>
                  {field.productCategory == 'Universal Life Insurance' && (
                    <p className="text-sm text-gray-500">Policy Fee: $60</p>
                  )}
                </CardContent>
              </Card>
            ))}
            <Button
              variant="ghost"
              type="button"
              onClick={() => handleAddProduct(Number(applicantIndex))}
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
              <FormLabel>Total Est. Revenue</FormLabel>
              <FormControl>
                <CurrencyInput {...field} disabled className="w-[180px] bg-gray-100" />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </Form>
    );
  };
  
  export default InsuranceProduct;
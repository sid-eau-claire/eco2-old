'use client'
import React, { use, useEffect, useRef } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Input,CInput, Select } from '@/components/Input';
import { ColContainer, RowContainer } from '@/components/Containers';
import { getProducts } from '../../_actions/retrievedata';
import { RoundButton } from '@/components/Button';
import { MdAddCircle } from "react-icons/md";
import { IoCloseCircle } from "react-icons/io5";
import {getCommissionDistributionGS} from '../../_actions/retrievedata';
import { set } from 'zod';
import { PopupComponent, ConfirmPopup } from '@/components/Popup';

const GenericInsuranceProduct =   ({ form, currentStep, setCurrentStep, markComplete }: { form: any, currentStep: number, setCurrentStep: any, markComplete: any }) => {
  const { register, control, setValue, watch, getValues, formState: { errors, isSubmitting }, reset, trigger } = form;
  const formData = watch();
  const [showAskRiderForUL, setShowAskRiderForUL] = React.useState(false);
  const completionRef = useRef(false);
  const riderInteractionRef = useRef(false);
  const [commissionDistributionGS, setCommissionDistributionGS] = React.useState<any>(null);
  const [corporateMarginPercentDefault, setCorporateMarginPercentDefault] = React.useState<number>(0);
  const [corporateMarginPercentInvestment, setCorporateMarginPercentInvestment] = React.useState<number>(0);
  const [corporateMarginPercentAffiliates, setCorporateMarginPercentAffiliates] = React.useState<number>(0);
  
  // const [ refreshProduct, setRefreshProduct ] = React.useState(false)
  const { fields, append, remove } = useFieldArray<any>({
    control,
    name: 'appInsProducts'
  });

  useEffect(() => {
    const fetchGS = async () => {
      const response = await getCommissionDistributionGS();
      setCommissionDistributionGS(response);
      setCorporateMarginPercentDefault(response.find((item: any) => item.name === 'corporateMarginPercentDefault')?.value);
      setCorporateMarginPercentInvestment(response.find((item: any) => item.name === 'corporateMarginPercentInvestment')?.value); 
      setCorporateMarginPercentAffiliates(response.find((item: any) => item.name === 'corporateMarginPercentAffiliates')?.value);
    }
    fetchGS();
    // Try to assign the corporate margin percentage here

  }, []);

  // Ensure to initialize with one product if empty
  React.useEffect(() => {
    if (fields.length == 0) {
      handleAddProduct(0);
    }
  }, [append, fields.length]);

  const productCategoryWatchFields = fields.map((field, index) => watch(`appInsProducts[${index}].productCategory`));
  
  const [products, setProducts] = React.useState<any[]>([]);
  // const [filteredProducts, setFilteredProducts] = React.useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = React.useState<any[][]>([]);

  const [productCategoryList, setProductCategoryList] = React.useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    const fetchProducts = async (carrierId: number) => {
      const response = await getProducts(carrierId); // Assume getProducts fetches the product list
      setProducts(response);
      const uniqueProductCategoryLIsts = new Set();
      // Filter the products to get only unique productCategory names
      const convertedProducts = response.reduce((acc: any[], product: any) => {
        const name = product.productcategoryId.name; // Changed to use name instead of productCategoryGroup
        const id = product.productcategoryId.id;
        if (!uniqueProductCategoryLIsts.has(name)) {
          uniqueProductCategoryLIsts.add(name);
          acc.push({ id: id, name: name }); // Adjusted to push the name attribute
        }
        return acc;
      }, []);
      setProductCategoryList(convertedProducts);
    };
    fetchProducts(formData.appInfo.carrierId);
  }, [formData.appInfo.carrierId]);


  useEffect(() => {
    console.log('here')
    fields.forEach((field, index) => {
      const annualPremiumValue = Number(getValues(`appInsProducts[${index}].annualPremium`));
      const targetPremiumValue = Number(getValues(`appInsProducts[${index}].targetPremium`));
      const productId = getValues(`appInsProducts[${index}].productId`);
      const FYC = Number(products.find((product: any) => product.id == productId)?.FYC);
      
      let premiumToUse = 0;
      if (targetPremiumValue > 0 && targetPremiumValue < annualPremiumValue) {
        premiumToUse = targetPremiumValue;
      } else if (targetPremiumValue > 0 && targetPremiumValue >= annualPremiumValue) {
        premiumToUse = annualPremiumValue;
      } else {
        premiumToUse = annualPremiumValue;
      }
      console.log('premiumToUse', premiumToUse)
      console.log('annualPremiumValue', annualPremiumValue) 
      console.log('targetPremiumValue', targetPremiumValue)
      console.log('productId', productId)
      console.log('FYC', FYC)
      if (premiumToUse > 0) {
        const premium = Number(premiumToUse);
        if (!isNaN(premium)) { // Check if conversion to number is successful
          const calculatedRevenue = premium * FYC * 3 * (1 - corporateMarginPercentDefault / 100);
          const currentEstimatedRevenue = getValues(`appInsProducts[${index}].estFieldRevenue`);
          const formattedRevenue = calculatedRevenue.toFixed(2);
          if (currentEstimatedRevenue !== formattedRevenue) {
            setValue(`appInsProducts[${index}].estFieldRevenue`, formattedRevenue, { shouldDirty: true });
            // markComplete(true);
          }
        }        

      }
    });
  }, [fields.map((field, index) => getValues(`appInsProducts[${index}].annualPremium`)),fields.map((field, index) => getValues(`appInsProducts[${index}].targetPremium`))]);
  
  
  useEffect(() => {
    const ulSelected = productCategoryWatchFields.some(category => category === "Universal Life Insurance");
    // Only update showAskRiderForUL if there hasn't been an interaction or if the selected categories no longer include "Universal Life Insurance"
    if ((ulSelected && !riderInteractionRef.current) || (!ulSelected && riderInteractionRef.current)) {
      setShowAskRiderForUL(ulSelected);
      riderInteractionRef.current = false; // Reset interaction flag if category is no longer UL
    }
  }, [productCategoryWatchFields]);
  const handleConfirmRider = () => {
    setShowAskRiderForUL(true);
    riderInteractionRef.current = true;
  }
  
  const handleCancelRider = () => {
    setShowAskRiderForUL(false);
    riderInteractionRef.current = true;
  }  
  
  useEffect(() => {
    if (formData?.appInsProducts?.length > 0) {
      const allFieldsFilled = formData?.appInsProducts.every((field: any) => 
        field.applicantIndex !== undefined &&
        field.productCategory !== '' &&
        field.productId !== '' &&
        field.coverageFaceAmount !== 0 &&
        field.annualPremium !== 0 &&
        field.estFieldRevenue !== 0
      );
      if (allFieldsFilled && !completionRef.current) {
        completionRef.current = true;
        markComplete(currentStep, true);
      } else if (!allFieldsFilled && completionRef.current) {
        completionRef.current = false;
        markComplete(currentStep, false);
      }
    }
  // }, [fields.map((field:any, index:number ) => getValues(`appInsProducts[${index}]`))]);
  }, [formData]);
  
  const handleAddProduct = (applicantIndex: number) => {
    append({
      applicantIndex,
      productCategory: '',
      productId: '',
      coverageFaceAmount: 0,
      annualPremium: 0,
      targetPremium: 0,
      estFieldRevenue: 0
    });
  };

  console.log('products', products);
  // console.log('productCategoryWatchFields', productCategoryWatchFields)
  // console.log('productCategoryLIst', productCategoryList);
  console.log('formData', formData)
  console.log('commissionDistributionGS', commissionDistributionGS)
  console.log('corporateMarginPercentDefault', corporateMarginPercentDefault)
  console.log('corporateMarginPercentInvestment', corporateMarginPercentInvestment)
  console.log('corporateMarginPercentAffiliates', corporateMarginPercentAffiliates)
  // console.log('filteredProducts', filteredProducts)


  return (
    <ColContainer cols="1:1:1:1">
      <p>generic</p>
      {fields.map((field: any, index) => (
        <RowContainer key={field.id} className='relative'>
          <div className='absolute top-[0rem] right-[0rem]'>
            <RoundButton
              icon={IoCloseCircle}
              className="bg-transparent text-danger px-2 py-2 rounded-md"
              onClick={() => remove(index)}
              hint="Remove this product"
            />          
          </div>
          <RowContainer className='flex flex-row justify-start items-center py-2 border-none'>
            <Select
              label="Applicant"
              name={`appInsProducts[${index}].applicantIndex`}
              register={register}
              options={formData.applicants.filter((applicant: any) => (applicant.isInsuredAnnuitant == true)).map((applicant:any, idx: number) => ({
                name: `${applicant.firstName} ${applicant.lastName}`,
                id: idx
              }))}
              required={true}
              className='flex flex-row justify-start items-center space-x-2 mb-0'
            />
          </RowContainer>
          <RowContainer className='grid grid-cols-3 space-x-2'>
            {productCategoryList && productCategoryList.length > 0 && (
              <Select
              label="Product Category"
              name={`appInsProducts[${index}].productCategory`}
              defaultOption='Select Category'
              register={register}
              // onChange={(e)=>buildFilterProduct(e.target.value, index)}
              options={productCategoryList.map(({ id, name }) => ({name: name, id: id }))}
              required={true}
              className='max-w-[15rem]'
              />
            )}
            { productCategoryWatchFields && productCategoryWatchFields[index] && products && products.length > 0 && (
              <Select
              label="Product"
              name={`appInsProducts[${index}].productId`}
              register={register}
              defaultOption='Select Product'
              className='max-w-[15rem]'
              options={products.filter(product => product.productcategoryId.id == formData.appInsProducts[index].productCategory).map((product: any) => ({    
                name: product.name,
                id: product.id
              } ))} 
              required={true}
              />              
            )} 
            {formData.appInsProducts[index].productId != '' && (
              <div className='grid grid-cols-2 space-x-4'>
                <div>
                  <CInput
                    label="Coverage"
                    name={`appInsProducts[${index}].coverageFaceAmount`}
                    register={register}
                    type="currency"
                    required={true}
                    className='max-w-[10rem]'
                    form={form}
                  />
                  {formData.appInsProducts[index].productCategory == 'Universal Life Insurance' && ( 
                    <CInput
                    label="Target Premium"
                    name={`appInsProducts[${index}].targetPremium`}
                    register={register}
                    type="currency"
                    required={false}
                    className='max-w-[10rem]'
                    form={form}
                    />
                  )} 
                </div>
                <div>
                  <CInput
                    label="Annual Premium"
                    name={`appInsProducts[${index}].annualPremium`}
                    register={register}
                    type="currency"
                    required={true}
                    className='max-w-[10rem]'
                    form={form}
                  />
                  <CInput
                    label="Est. Revenue"
                    name={`appInsProducts[${index}].estFieldRevenue`}
                    type="currency"
                    register={register}
                    required={true}
                    className='max-w-[10rem] bg-meta-4/10 text-black'
                    isEditable={false}
                    disabled
                    form={form}
                  />
                </div>
              </div>
            )}
          </RowContainer>
          {showAskRiderForUL && (
            <ConfirmPopup
              heading="Universal Life Insurance Rider"
              message="Will you include rider(s) in this Universal Life Insurance case?"
              button1Text="Yes"
              button1Color='bg-primary'
              button2Color='bg-primary'
              button2Text="No"
              onConfirm={handleConfirmRider}
              onCancel={handleCancelRider}
            />
          )}
        </RowContainer>
      ))}
      <RoundButton
        icon={MdAddCircle}
        className="bg-transparent text-primary px-4 py-2 rounded-md"
        onClick={() => handleAddProduct(0)}  // Assuming the default applicantIndex; you might want to choose differently or set dynamically
        hint="Add another product"
      />
    </ColContainer>
  );
};

export default GenericInsuranceProduct;

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
import { PopupComponent, ConfirmPopup } from '@/components/Popup';

const InsuranceProduct =   ({ form, currentStep ,setCurrentStep, markComplete, isEditable }: { form: any, currentStep: number, setCurrentStep: any, markComplete: any, isEditable?: boolean }) => {
  const { register, control, setValue, watch, resetField ,getValues, formState: { errors, isSubmitting }, reset, trigger } = form;
  const formData = watch();
  const firstAccessRef = useRef(false);
  const completionRef = useRef(false);
  const riderInteractionRef = useRef(false);
  const [commissionDistributionGS, setCommissionDistributionGS] = React.useState<any>(null);
  const [corporateMarginPercentDefault, setCorporateMarginPercentDefault] = React.useState<number>(0);
  const [corporateMarginPercentInvestment, setCorporateMarginPercentInvestment] = React.useState<number>(0);
  const [corporateMarginPercentAffiliates, setCorporateMarginPercentAffiliates] = React.useState<number>(0);
  const [monthlyBillingPremium, setMonthlyBillingPremium] = React.useState<number>(0);
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
  const handleAddProduct = (applicantIndex: number, fieldIndex?: number) => {
    let currentCount = 0
    if (fieldIndex != undefined) {
      currentCount = fieldIndex;
    } else {
      currentCount = formData?.appInsProducts?.length || 0;
    }
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
  };
  const handleRemoveProduct = (index: number) => {
    const updatedProducts = fields.filter((_, idx) => idx !== index);
    const productsWithUpdatedIndices = updatedProducts.map((product, idx) => ({
      ...product,
      fieldIndex: idx  // Correct the fieldIndex to match the new array order
    }));
    resetField('appInsProducts', {
      defaultValue: productsWithUpdatedIndices, // Set the updated products as new default values
    });
  };
  

  if (!firstAccessRef.current && formData?.applicants && formData?.applicants?.length > 0) {
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

  const groupedFields = formData?.appInsProducts?.reduce((acc: any, product: any) => {
    const index = product.applicantIndex;
    if (!acc[index]) {
      acc[index] = [];
    }
    acc[index].push(product);
    return acc;
  }, {});


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
    fields.forEach((field, index) => {
      const product = formData.appInsProducts[index];
      if (!product) return;
      updateRevenue(index, product.annualPremium);
    });
  }, [fields.map(field => field.id)]); 
  
  // const getTotalPremiumWOUL = () => {
  //   return formData.appInsProducts.reduce((acc: number, product: any) => {
  //     if (product.productCategory !== 'Universal Life Insurance') {
  //       return acc + parseFloat(product.annualPremium || 0);
  //     }
  //     return acc;
  //   }, 0);
  // };
  
  // const getPremiumToUse = (index: number, annualPremiumValue: number) => {
  //   const targetPremiumValue = Number(getValues(`appInsProducts[${index}].targetPremium`));
  //   if (targetPremiumValue > 0 && targetPremiumValue < annualPremiumValue) {
  //     return targetPremiumValue;
  //   } else if (targetPremiumValue > 0 && targetPremiumValue >= annualPremiumValue) {
  //     return annualPremiumValue;
  //   }
  //   return annualPremiumValue;
  // };

  const updateRevenue = (index: number, premium: number) => {
    let excessPremium = 0;
    let premiumToUse = premium
    if (premium > Number(getValues(`appInsProducts[${index}].targetPremium`)) && Number(getValues(`appInsProducts[${index}].targetPremium`)) != 0 ) {
      excessPremium = premium - Number(getValues(`appInsProducts[${index}].targetPremium`));
      premiumToUse = Number(getValues(`appInsProducts[${index}].targetPremium`));
    } else {
      excessPremium = 0;
    }
    // excessPremium = 0 
    const productId = getValues(`appInsProducts[${index}].productId`);
    const FYC = Number(products.find(product => product.id == productId)?.FYC);
    const excessRevenue = excessPremium * 0.05 * 3 * (1 - corporateMarginPercentDefault / 100);
    // console.log('productName', products.find(product => product.id == productId)?.name)
    // console.log('FYC', FYC)
    // console.log('corporateMarginPercentDefault', corporateMarginPercentDefault)
    // console.log('premium', premium)
    // console.log('targetPremium', getValues(`appInsProducts[${index}].targetPremium`))
    // console.log('excessPremium', excessPremium);
    // console.log('excessRevenue', excessRevenue);
    const calculatedRevenue = premiumToUse * FYC * 3 * (1 - corporateMarginPercentDefault / 100) + excessRevenue;
    const formattedRevenue = calculatedRevenue.toFixed(2);

    const currentEstRevenue = getValues(`appInsProducts[${index}].estFieldRevenue`);
    if (currentEstRevenue !== formattedRevenue) {
        setValue(`appInsProducts[${index}].estFieldRevenue`, formattedRevenue, { shouldDirty: true });
    }

    const totalEstFieldRevenue = formData.appInsProducts.reduce((total: number, product: any) => {
        return total + parseFloat(product.estFieldRevenue || 0);
    }, 0);

    const currentTotalEstFieldRevenue = getValues('totalEstFieldRevenue');
    const formattedTotalRevenue = totalEstFieldRevenue.toFixed(2);
    if (currentTotalEstFieldRevenue !== formattedTotalRevenue) {
        setValue('totalEstFieldRevenue', formattedTotalRevenue, { shouldDirty: true });
    }
  };

  



  
  useEffect(() => {
    if (formData?.appInsProducts?.length > 0) {
      const allFieldsFilled = formData?.appInsProducts.every((field: any) => 
        field.applicantIndex !== undefined &&
        field.productCategory !== '' &&
        field.productId !== '' &&
        field.coverageFaceAmount !== 0 &&
        field.annualPremium !== 0 &&
        field.estFieldRevenue !== 0 &&
        formData?.estSettledDays !== ''
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
  
  // console.log('products', products);
  // // console.log('productCategoryWatchFields', productCategoryWatchFields)
  // console.log('productCategoryLIst', productCategoryList);
  // console.log('formData', formData)
  // console.log('groupedFields', groupedFields)
  // console.log('commissionDistributionGS', commissionDistributionGS)
  // console.log('corporateMarginPercentDefault', corporateMarginPercentDefault)
  // console.log('corporateMarginPercentInvestment', corporateMarginPercentInvestment)
  // console.log('corporateMarginPercentAffiliates', corporateMarginPercentAffiliates)
  // console.log('filteredProducts', filteredProducts)


  return (
    <ColContainer cols="1:1:1:1">
      {/* <p>Beneva</p> */}
      {groupedFields && Object.keys(groupedFields).map((fields, aindex) => (
        <RowContainer key={aindex} className='pb-0'>
          {fields && fields.length >  0 && fields[0] && (
            <p className="font-semibold pb-[1rem]">Applicant {aindex + 1}: {formData?.applicants[fields[0]]?.firstName} {formData?.applicants[fields[0]]?.lastName}</p>
          )}
          {groupedFields && groupedFields[aindex] && groupedFields[aindex].map((field: any, index: number) => (
            <div key={field.id} className='relative'>
              <div className='absolute top-[0rem] right-[0rem]'>
                <RoundButton
                  icon={IoCloseCircle}
                  type="button"
                  className="bg-transparent text-danger px-2 py-2 rounded-md"
                  onClick={() => { if( groupedFields[aindex].length > 1) {handleRemoveProduct(field.fieldIndex)}}}
                  hint="Remove this product"
                  isEditable={isEditable}
                />          
              </div>
              <RowContainer className='flex flex-row justify-start items-center py-0 border-none'>
                <input
                  name={`appInsProducts[${field.fieldIndex}].applicantIndex`}
                  {...register}
                  required={true}
                  type="hidden"
                  className='flex flex-row justify-start items-center space-x-2 mb-0'
                  isEditable={isEditable}
                />
                <span></span>
              </RowContainer>
              <RowContainer  className='grid grid-cols-4 space-x-2'>
                {productCategoryList && productCategoryList.length > 0 && (
                  <Select
                    label="Product Category"
                    name={`appInsProducts[${field.fieldIndex}].productCategory`}
                    defaultOption='Select Category'
                    register={register}
                    // onChange={(e)=>buildFilterProduct(e.target.value, index)}
                    options={productCategoryList.map(({ id, name }) => ({name: name, id: id }))}
                    required={true}
                    className='max-w-[15rem]'
                    isEditable={isEditable}
                  />
                )}
                { productCategoryWatchFields && productCategoryWatchFields[field.fieldIndex] && products && products.length > 0 && (
                  <Select
                    label="Product"
                    name={`appInsProducts[${field.fieldIndex}].productId`}
                    register={register}
                    defaultOption='Select Product'
                    className='max-w-[15rem]'
                    options={products.filter(product => product.productcategoryId.id == formData.appInsProducts[field.fieldIndex].productCategory).map((product: any) => ({    
                      name: product.name,
                      id: product.id
                    } ))} 
                    required={true}
                    isEditable={isEditable}
                  />              
                )} 
                {formData.appInsProducts[field.fieldIndex] && formData.appInsProducts[field.fieldIndex].productId != '' && (
                  <div className='col-span-2 grid grid-cols-3 gap-x-4'>
                      <CInput
                        label="Coverage"
                        name={`appInsProducts[${field.fieldIndex}].coverageFaceAmount`}
                        register={register}
                        type="currency"
                        required={true}
                        className='max-w-[10rem] mb-0'
                        form={form}
                        isEditable={isEditable}
                      />
                      <CInput
                        label="Annual Premium"
                        name={`appInsProducts[${field.fieldIndex}].annualPremium`}
                        register={register}
                        type="currency"
                        required={true}
                        className='max-w-[10rem] mb-0'
                        form={form}
                        isEditable={isEditable}
                      />
                      <CInput
                          label="Est. Revenue"
                          name={`appInsProducts[${field.fieldIndex}].estFieldRevenue`}
                          type="currency"
                          register={register}
                          required={true}
                          className='max-w-[10rem] bg-meta-4/10 text-black mb-0'
                          isEditable={false}
                          disabled
                          form={form}
                      />
                      {formData.appInsProducts[field.fieldIndex].productCategory == 'Universal Life Insurance' ? (
                        <> 
                          <div></div>
                          <CInput
                            label="Target Premium"
                            name={`appInsProducts[${field.fieldIndex}].targetPremium`}
                            register={register}
                            type="currency"
                            required={false}
                            className='max-w-[10rem] mb-0'
                            form={form}
                            isEditable={isEditable}
                            />
                          <div className=''>
                            <span>Policy Fee: $60</span>
                          </div>                            
                        </>
                      ):(<div></div>)} 
                      {/* {formData.appInsProducts[field.fieldIndex].productCategory == 'Universal Life Insurance' && (
                        <>
                          <div></div><div></div>
                          <div className='mt-[-1.5rem]'>
                            <span>Policy Fee: $60</span>
                          </div>
                        </>
                      )} */}
                  </div>
                )}
              </RowContainer>
            </div>
          ))}
          <RoundButton
            icon={MdAddCircle}
            type="button"
            className="bg-transparent text-primary px-4 py-2 rounded-md"
            onClick={() => handleAddProduct(aindex)}  // Assuming the default applicantIndex; you might want to choose differently or set dynamically
            hint="Add another product"
            isEditable={isEditable}
          />                
        </RowContainer>
      ))}

      <div className='flex flex-row justify-end items-center mt-[1rem] space-x-4'>
        <Select
          label="Est. Settled Days"
          name={`estSettledDays`}
          defaultOption='Select Days'
          register={register}
          options={[{name: '30 Days', id: '30'},{name: '60 Days', id: '60'},{name: '90 Days', id: '90'} ]}
          required={true}
          className='max-w-[15rem]'
          isEditable={isEditable}
        />
        <CInput
          label="Total Est. Revenue"
          name={`totalEstFieldRevenue`}
          register={register}
          type="currency"
          required={false}
          className='max-w-[10rem] mb-0'
          form={form}
          isEditable={false}
          disabled
        />        
      </div>
    </ColContainer>
  );
};

export default InsuranceProduct;

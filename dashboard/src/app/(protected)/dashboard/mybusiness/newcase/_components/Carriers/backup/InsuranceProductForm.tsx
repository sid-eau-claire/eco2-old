'use client'
import React, { useEffect, useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { CInput, Select } from '@/components/Input';
import { RowContainer } from '@/components/Containers';
import { RoundButton } from '@/components/Button';
import { IoCloseCircle } from "react-icons/io5";
import { MdAddCircle } from "react-icons/md";
import { getProducts } from '../../../_actions/retrievedata';
import { ConfirmPopup } from '@/components/Popup';

interface Props {
  form: any;
  index: number;
  applicant: any;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  markComplete: (step: number, isComplete: boolean) => void;
}

const InsuranceProductForm = ({ form, index, applicant, currentStep, setCurrentStep, markComplete }: Props) => {
  const { register, control, setValue, watch, getValues } = form;
  const formData = getValues();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `appInsProducts[${index}]`
  });

  const productCategoryWatchFields = fields.map((field: any, index: number) => watch(`appInsProducts[${index}].productCategory`));

  const [products, setProducts] = useState<any[]>([]);
  const [productCategoryList, setProductCategoryList] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchProducts = async (carrierId: number) => {
      const response = await getProducts(carrierId); // Assume getProducts fetches the product list
      setProducts(response);
      const uniqueProductCategoryLIsts = new Set();
      // Filter the products to get only unique productCategory names
      const convertedProducts = response.reduce((acc: any[], product: any) => {
        const name = product.productcategoryId.name; // Changed to use name instead of productCategoryGroup
        if (!uniqueProductCategoryLIsts.has(name)) {
          uniqueProductCategoryLIsts.add(name);
          acc.push({ id: name, name: name }); // Adjusted to push the name attribute
        }
        return acc;
      }, []);
      setProductCategoryList(convertedProducts);
    };
    fetchProducts(formData.appInfo.carrierId);
  }, [formData.appInfo.carrierId]);

  const handleAddProduct = () => {
    append({
      applicantIndex: index,
      productCategory: '',
      productId: '',
      coverageFaceAmount: 0,
      annualPremium: 0,
      targetPremium: 0,
      estFieldRevenue: 0
    });
  };
  console.log('products', products)
  console.log('productCategoryList', productCategoryList)
  return (
    <RowContainer className='relative'>
      {fields.map((field: any, fieldIndex: number) => (
        <div key={field.id} className='relative w-full'>
          <div className='absolute top-0 right-0'>
            <RoundButton
              icon={IoCloseCircle}
              className="bg-transparent text-danger px-2 py-2 rounded-md"
              onClick={() => remove(fieldIndex)}
              hint="Remove this product"
            />          
          </div>
          <RowContainer className='grid grid-cols-4 gap-2'>
            <Select
              label="Product Category"
              name={`appInsProducts[${fieldIndex}].productCategory`}
              defaultOption="Select Category"
              register={register}
              options={productCategoryList}
              required={true}
              className='col-span-1'
            />
            <Select
              label="Product"
              name={`appInsProducts[${fieldIndex}].productId`}
              defaultOption="Select Product"
              register={register}
              options={products.filter(product => product.productcategoryId.name === productCategoryWatchFields[fieldIndex]).map(({ id, name }) => ({ id, name }))}
              required={true}
              className='col-span-1'
            />
            <CInput
              label="Coverage"
              name={`appInsProducts[${fieldIndex}].coverageFaceAmount`}
              register={register}
              type="currency"
              required={true}
              className='col-span-1'
              form={form}
            />
            <CInput
              label="Annual Premium"
              name={`appInsProducts[${fieldIndex}].annualPremium`}
              register={register}
              type="currency"
              required={true}
              className='col-span-1'
              form={form}
            />
          </RowContainer>
        </div>
      ))}
      <RoundButton
        icon={MdAddCircle}
        className="bg-transparent text-primary px-4 py-2 rounded-md mt-4"
        onClick={handleAddProduct}
        hint="Add another product"
      />
    </RowContainer>
  );
};

export default InsuranceProductForm;

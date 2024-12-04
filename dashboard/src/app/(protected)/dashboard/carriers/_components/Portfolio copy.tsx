import React from 'react'
import { ColContainer, RowContainer } from '@/components/Containers';
import {TypewriterEffectSmooth} from '@/components/ui/typewriter-effect'
import { motion } from 'framer-motion';
import { CarrierType } from '@/types/carrier';
import Panel from '@/components/ReactParser/Panel'

type CarrierDetailProps = {
  carrier: CarrierType;
}

// const  Portfolio = ({ productCodes, carrier, selectedProduct, setSelectedProduct, setOpenTab }: { productCodes: ProductCode[], carrier: CarrierType, selectedProduct: ProductCode | null, setSelectedProduct: any, setOpenTab: any }) => {
const  Portfolio = ({ carrier }: { carrier: CarrierType }) => {
  console.log('carrier', carrier)
  return (
    <ColContainer cols='1:1:1:1'>
      <ColContainer cols='3:3:1:1'>
      // New code here
      // New code end
      </ColContainer>
      <ColContainer cols='1:1:1:1'>
        {carrier.products.map((product: any, index: number) => (
          <RowContainer key={index} index={index} className='mb-4'>
            <TypewriterEffectSmooth words={product.title} className="text-xl mb-2 font-semibold text-black dark:text-white" />
            <Panel content={product.description} />
          </RowContainer>
        ))}
      </ColContainer>
      <Panel content={carrier.content} /> 
    </ColContainer>
  );
};


export default Portfolio
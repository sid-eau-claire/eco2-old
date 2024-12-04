'use client'
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { IoMdArrowRoundBack } from "react-icons/io";
import { PageContainer } from "@/components/Containers";
import ProductManagement from './InsuranceProducts'
import InsuranceProducts  from "./InsuranceProducts";
import InvestmentProducts from "./InvestmentProducts";

// Importing types
import { CarrierType } from "@/types/carrier";
import { ProductCode } from '@/types/productCode';

// Importing tab components
import ProductCodes from './ProductCodes';
import Training from './Training';
import Contracting from './Contracting';
import CarrierDetail from "./CarrierDetail";
import Portfolio from "./Portfolio";

// Importing the reusable TabView component
import { Tab, TabView } from '@/components/TabView/TabView'

const TabThree = ({carrier, productCodes, carriertrainings}: {carrier: CarrierType, productCodes: ProductCode[], carriertrainings: any }) => {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<ProductCode | null>(null);


  const tabs = [
    {id: 1, title: 'Portfolio',  Component: (<Tab><Portfolio carrier={carrier}/></Tab>)},
    {id: 2, title: 'Training',  Component: (<Tab><Training carrier={carrier}/></Tab>)},
    // {id: 3, title: 'Compensation',  Component: (<Tab><ProductCodes productCodes={productCodes} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct}/></Tab>)},
    {id: 4, title: 'Insurance',  Component: (<Tab><InsuranceProducts carrier={carrier}/></Tab>)},
    {id: 5, title: 'Investment',  Component: (<Tab><InvestmentProducts carrier={carrier}/></Tab>)},
    {id: 6, title: 'Doc & links', Component: (<Tab><CarrierDetail carrier={carrier}/></Tab>)},
    // {id: 5, title: 'Contracting',  Component: (<Tab><Contracting carrier={carrier}/></Tab>)}
  ]

  return (
    <PageContainer pageName={`${carrier.carrierName}`}>
      <TabView menu={tabs} activeTab={1} />
    </PageContainer>
  );
};

export default TabThree;

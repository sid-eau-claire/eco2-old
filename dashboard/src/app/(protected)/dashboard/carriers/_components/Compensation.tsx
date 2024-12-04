import React, { useState, useEffect } from 'react';
import { ProductCode } from '@/types/productCode';
import { getRanks } from '../_actions/getRanks';
import { useSession } from 'next-auth/react';
import { ColContainer, RowContainer } from '@/components/Containers';

type Rank = {
  id: string,
  name: string;
  agencyCommissionPercentage: number;
};

const CommissionCalculator = ({ productCodes, selectedProduct, setSelectedProduct }: {productCodes: ProductCode[], selectedProduct: ProductCode | null, setSelectedProduct: any}) => {
  const { data: session } = useSession();
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [selectedRank, setSelectedRank] = useState<string>('');
  const [selectedProductType, setSelectedProductType] = useState<string>(selectedProduct?.productType || '');
  const [annualPremium, setAnnualPremium] = useState<string>('3000');
  const [financialDetails, setFinancialDetails] = useState({
    FYC: 0,
    bonus: 0,
    grossRevenue: 0,
    hqMargin: 0,
    partnerRevenue: 0,
  });

  useEffect(() => {
    const fetchRanks = async () => {
      const ranks = await getRanks();
      setRanks(ranks);
    };
    fetchRanks();
    setSelectedRank(session?.user?.data?.profile?.rankId);
  }, [session?.user?.data?.profile?.rankId]);

  const calculateRevenue = () => {


    if (!selectedProduct || !annualPremium || !selectedRank) return;
    const rank = ranks.find(item => item.id == selectedRank);
    // console.log(rank)
    if (!rank) return;
    console.log('there')
    const FYC = (selectedProduct.commission / 100) * parseFloat(annualPremium);
    const bonus = FYC * 2;
    const grossRevenue = FYC + bonus;
    const hqMargin = grossRevenue * 0.025;
    const totalFieldRevenue = grossRevenue - hqMargin;

    const partnerRevenue = totalFieldRevenue * (Number(rank.agencyCommissionPercentage));

    setFinancialDetails({
      FYC,
      bonus,
      grossRevenue,
      hqMargin,
      partnerRevenue,
    });
  };

  useEffect(() => {
    setSelectedProductType(selectedProduct?.productType || '');
    calculateRevenue();
  }, [selectedProduct, annualPremium, selectedRank, ranks]);

  const productTypes: string[] = Array.from(new Set(productCodes.map(productCode => productCode.productType)));

  const handleProductChange = (code: string) => {
    const product = productCodes.find(p => p.code === code);
    if (product) {
      setSelectedProduct(product);
    }
  };

  return (
    <ColContainer cols="1:1:1:1">
      <div className="md:w-1/2 bg-white dark:bg-graydark p-5 rounded-lg shadow-card">
        <h3 className='text-title-md font-semibold text-black-2 dark:text-white mb-4'>Product</h3>
        <div className="mb-6">
          <label htmlFor="productType" className="mb-1 block text-black dark:text-white">Product Type</label>
          <select
            id="productType"
            value={selectedProductType}
            onChange={(e) => {
              setSelectedProductType(e.target.value);
              const firstProduct = productCodes.find(productCode => productCode.productType === e.target.value);
              if (firstProduct) {
                setSelectedProduct(firstProduct);
              }
            }}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent text-black py-1 px-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary dark:text-white"
          >
            <option value="">Select Product Type</option>
            {productTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label htmlFor="code" className="mb-1 block text-black dark:text-white">Product Code</label>
          <select
            id="code"
            value={selectedProduct?.code}
            onChange={(e) => handleProductChange(e.target.value)}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent text-black py-1 px-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary dark:text-white"
          >
            <option value="">Select Code</option>
            {productCodes.filter(productCode => productCode.productType === selectedProductType).map((product) => (
              <option key={product.id} value={product.code}>
                {product.code} - {product.description}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label htmlFor="rank" className="mb-1 block text-black dark:text-white">Select Your Rank</label>
          <select
            id="rank"
            value={selectedRank}
            onChange={(e) => setSelectedRank(e.target.value)}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent text-black py-1 px-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary dark:text-white"
          >
            <option value="">Select Rank</option>
            {ranks.map((rank, index) => (
              <option key={index} value={rank.id}>{rank.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label htmlFor="annualPremium" className="bmb-1 block text-black dark:text-white">Annual Premium Estimation</label>
          <input
            type="number"
            id="annualPremium"
            value={annualPremium}
            onChange={(e) => setAnnualPremium(e.target.value)}
            placeholder="Enter annual premium"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent text-black py-1 px-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary dark:text-white"
          />
        </div>
      </div>
      <div className="md:w-1/2 bg-white dark:bg-graydark p-5 rounded-lg shadow-card">
        <h3 className="mb-8 text-title-md font-semibold text-black-2 dark:text-white">Revenue Details</h3>
        <div className="mt-4 flex flex-col justify-center items-start">
          <p className="mb-3 block text-black dark:text-white font-medium">FYC: ${financialDetails.FYC.toFixed(2)}</p>
          <p className="mb-3 block text-black dark:text-white font-medium">Bonus: ${financialDetails.bonus.toFixed(2)}</p>
          <p className="mb-3 block text-black dark:text-white font-medium">Gross Revenue: ${financialDetails.grossRevenue.toFixed(2)}</p>
          <p className="mb-3 block text-black dark:text-white font-medium">HQ Margin: ${financialDetails.hqMargin.toFixed(2)}</p>
          <p className="mb-3 block text-black dark:text-white font-medium">Partner Revenue: ${financialDetails.partnerRevenue.toFixed(2)}</p>
        </div>
      </div>
    </ColContainer>
  );
};

export default CommissionCalculator;

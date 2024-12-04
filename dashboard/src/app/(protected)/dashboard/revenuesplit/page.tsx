'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CommissionResults {
  grossRevenue: number; // Paid to EAU
  fieldRevenue: number; // Distributed among parties
  partnerRevenue: number; // Paid to the Advisor
  managingPartnerRevenue: number; // Paid to the Managing Partner
}

const CommissionCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<{ annualPremium: string; partnerTier: string }>({ annualPremium: '0', partnerTier: '' });
  const [results, setResults] = useState<CommissionResults | null>(null);

  useEffect(() => {
    calculateCommissions();
  }, [inputs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const calculatePartnerRevenuePercentage = (tier: string) => {
    switch (tier) {
      case 'junior': return 0.45;
      case 'associateTier2': return 0.52;
      case 'associateTier1': return 0.58;
      case 'seniorTier2': return 0.65;
      case 'seniorTier1': return 0.71;
      case 'managingPartner': return 0.80;
      default: return 0;
    }
  };

  const calculateCommissions = () => {
    if (!inputs.annualPremium || !inputs.partnerTier) return;

    const annualPremium = parseFloat(inputs.annualPremium);
    const fycPercentage = 0.50; // FYC: 50%
    const bonusMultiplier = 2; // Bonus: 200%
    
    const fyc = annualPremium * fycPercentage;
    const bonus = fyc * bonusMultiplier;
    const grossRevenue = fyc + bonus;
    
    const hqMargin = grossRevenue * 0.025;
    const fieldRevenue = grossRevenue - hqMargin;
    
    const partnerRevenuePercentage = calculatePartnerRevenuePercentage(inputs.partnerTier);
    const partnerRevenue = fieldRevenue * partnerRevenuePercentage;
    
    const managingPartnerPercentage = 0.80; // Managing Partner always gets 80%
    const managingPartnerRevenue = fieldRevenue * managingPartnerPercentage - partnerRevenue;

    setResults({
      grossRevenue,
      fieldRevenue,
      partnerRevenue,
      managingPartnerRevenue,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-xl mx-auto p-4 border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="annualPremium" className="block mb-2">Annual Premium:</label>
          <input
            type="number"
            id="annualPremium"
            name="annualPremium"
            value={inputs.annualPremium}
            onChange={handleChange}
            className="border p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="partnerTier" className="block mb-2">Partner Tier:</label>
          <select
            id="partnerTier"
            name="partnerTier"
            value={inputs.partnerTier}
            onChange={handleChange}
            className="border p-2"
            required
          >
            <option value="">Select Tier</option>
            <option value="junior">Junior Partner</option>
            <option value="associateTier2">Associate Partner (Tier 2)</option>
            <option value="associateTier1">Associate Partner (Tier 1)</option>
            <option value="seniorTier2">Senior Partner (Tier 2)</option>
            <option value="seniorTier1">Senior Partner (Tier 1)</option>
            <option value="managingPartner">Managing Partner</option>
          </select>
        </div>
      </div>

      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 p-4 border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
        >
          <p>Gross Revenue (Paid to EAU): ${results.grossRevenue.toFixed(2)}</p>
          <p>Field Revenue (Distributed among parties): ${results.fieldRevenue.toFixed(2)}</p>
          <p>Partner Revenue (Paid to the Advisor): ${results.partnerRevenue.toFixed(2)}</p>
          <p>Managing Partner Revenue (Paid to the Managing Partner): ${results.managingPartnerRevenue.toFixed(2)}</p>
        </motion.div>
      )}

      <Link href="/" passHref>
        <motion.div whileHover={{ scale: 1.04 }} className="mt-4 text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out cursor-pointer">
          Go Back
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default CommissionCalculator;

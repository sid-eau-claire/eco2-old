

// ProfilePopup.js
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { FaSitemap, FaUser, FaChartLine, FaBusinessTime, FaMoneyBillWave, FaTasks, FaChartBar } from 'react-icons/fa';
import { FaMoneyBillTrendUp } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { PopupComponent } from '@/components/Popup';

const ProfilePopup = ({ profile, onClose }: { profile: any, onClose: any }) => {
  const router = useRouter();

  const buttons = [
    { icon: <FaUser size={32} className=''/>, label: 'Profile', path: `/dashboard/profile/${profile.id}` },
    { icon: <FaBusinessTime size={32}/>, label: 'New Business cases', path: `/dashboard/mybusiness/newcase/${profile.id}` },
    { icon: <FaMoneyBillWave size={32} />, label: 'My Opportunity', path: `/dashboard/mybusiness/opportunity/${profile.id}` },
    // { icon: <FaTasks size={32}/>, label: 'Objective Key Results', path: `/dashboard/mybusiness/okr/${profile.id}` },
    { icon: <FaMoneyBillTrendUp size={32}/>, label: 'Cash Flow', path: `/dashboard/mybusiness/cashflow/${profile.id}` },
    { icon: <FaChartLine size={32}/>, label: 'Performance', path: `/dashboard/mybusiness/performance/${profile.id}` },
    // { icon: <FaChartLine size={32}/>, label: 'Personal KPI', path: `/dashboard/mybusiness/personalkpi/${profile.id}` },
    // { icon: <FaChartBar size={32}/>, label: 'Team KPI', path: `/dashboard/mybusiness/teamkpi/${profile.id}` },
    { icon: <FaSitemap size={32}/>, label: 'Network', path: `/dashboard/mynetwork/${profile.id}` }
  ];

  return (
    // <PopupComponent isVisible={true} onClose={onClose} className="fixed top-0 left-0 bottom-0 right-0 m-4 p-2 bg-black/20 flex flex-col justify-center items-center">
    <PopupComponent isVisible={true} onClose={onClose} secondClassName='h-[20rem] flex flex-col justify-center items-center'>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className='grid grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow-lg z-50'
      >
        {buttons.map((button, index) => (
          <div key={index} onClick={() => router.push(button.path)} className="flex items-center m-2 cursor-pointer">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="bg-white text-black p-2 rounded-full shadow-lg flex items-center justify-center ">
              {button.icon}
            </motion.div>
            <span className='ml-2 text-sm font-medium text-black'>{button.label}</span>
          </div>
        ))}
      </motion.div>
      {/* <span className="absolute top-1 right-1 cursor-pointer text-xl" onClick={onClose}>&times;</span> */}
    </PopupComponent>
  );
};

export default ProfilePopup;

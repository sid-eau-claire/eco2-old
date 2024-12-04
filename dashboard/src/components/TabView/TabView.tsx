// components/TabView.tsx
'use client'
import { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { canAccessTab } from './_action/canAccess';

type TabViewItem = {
  id: number;
  title: string;
  Component: ReactNode;
  accessControl?: {
    roles: string[];
    appRoles?: string[];
    profileId?: number | null;
  };
}

type TabViewProps = {
  menu: TabViewItem[];
  activeTab: number;
  setActiveTab?: (id: number) => void;
}
type TabProps  = {
  children: ReactNode;
  // setOpenTab: (id: number) => void;
}

export const TabView: React.FC<TabViewProps> = ({ menu, activeTab }) => {
  const router = useRouter();
  const pathName = usePathname();
  const [openTab, setOpenTab] = useState<number>(() => {
    const lastTab = typeof window !== 'undefined' ? localStorage.getItem('lastActiveTab-' + pathName) : null;
    return lastTab ? parseInt(lastTab) : activeTab;
  });
  
  const activeClasses = "text-black font-bold border-black dark:text-white dark:border-white";
  const inactiveClasses = "border-transparent";
  const [filteredMenu, setFilteredMenu] = useState<TabViewItem[]>([]);

  // Load last active tab from local storage or use the activeTab prop
  // useEffect(() => {
  //   const lastTab = localStorage.getItem('lastActiveTab');
  //   setOpenTab(lastTab ? parseInt(lastTab) : activeTab);
  // }, [activeTab]);

  // useEffect(() => {
  //   setOpenTab(activeTab);
  // }, [activeTab]);

  useEffect(() => {
    const accessControls = menu.map(item => item.accessControl);
    const isAllowed = canAccessTab(accessControls);
    isAllowed.then((results) => {
      const filteredMenu = menu.filter((item, index) => {
        if (!item.accessControl) return true; // Allow access if accessControl is not provided
        return results[index];
      });
      setFilteredMenu(filteredMenu);
    });
  }, [menu]);

  // Update the local storage when openTab changes
  useEffect(() => {
    localStorage.setItem('lastActiveTab-' + pathName, openTab.toString());
  }, [openTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastTab = localStorage.getItem('lastActiveTab-' + pathName);
      if (lastTab) {
        setOpenTab(parseInt(lastTab));
      }
    }
  }, [pathName]);
    
  if (filteredMenu.length === 0) return null;
  return (
    <motion.div className="rounded-sm border border-stroke bg-white px-4 py-1 shadow-default dark:border-strokedark dark:bg-boxdark pb-4"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-4 flex flex-wrap gap-x-5 border-b border-stroke dark:border-strokedark">
        {filteredMenu.map((item, index) => (
          <Link href="#" key={index}
            className={twMerge(`border-b-2 py-2 text-md font-semibold hover:scale-105`, openTab === item.id ? activeClasses : inactiveClasses)}
            onClick={(e) => {
              e.preventDefault();
              setOpenTab(item.id);
            }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
            >
              {item.title}
            </motion.span>
          </Link>
        ))}
      </div>
      <motion.div className={`rounded-sm relative shadow-default bg-white text-black dark:bg-boxdark`}
        initial={{ opacity: 0, x: -500, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        {menu.map((item, index) => (
          <div
            key={index}
            className={`leading-relaxed ${openTab === item.id ? "block" : "hidden"}`}
          >
            {item.Component}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export const Tab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};

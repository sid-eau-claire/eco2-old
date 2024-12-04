'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import {motion} from "framer-motion";

// Define the type for your data items
type ContractingItem = {
  Name: string;
  CIPR: string;
  EandO: string;
  Beneva: string;
  [key: string]: any;
};

const colorMap: { [key: string]: string } = {
  'Done': 'bg-success text-white',
  'Waiting on Beneva': 'bg-warning',
  // ... other mappings
};

export default function ContractingTable() {
  const [data, setData] = useState<ContractingItem[]>([]);

  // Function to load data (you would replace this with your actual data fetching logic)
  useEffect(() => {
    // Asynchronously fetch the data and update the state
    const fetchData = async () => {
      const response = await fetch('/contracting_data.json');
      const jsonData: ContractingItem[] = await response.json();
      setData(jsonData);
    };
    
    fetchData().catch(console.error);
  }, []);

  // Function to handle value changes
  const updateField = (index: number, field: string, value: string) => {
    const newData = [...data];
    newData[index][field] = value;
    setData(newData);
  };

  // Helper function to determine if a string is a URL
  const isUrl = (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch (_) {
      return false;
    }
  };
  console.log(data)
  return (
    <>
     <Breadcrumb pageName="Contracting Status" />
      <motion.div className="overflow-x-scroll"
        initial={{opacity: 0, }}
        animate={{opacity: 1,}}
        exit={{opacity: 0, x: -100}}
        transition={{duration: 0.6}}
      >
        {/* <h3 className="text-2xl font-bold">Contracting Status</h3> */}
        <table className="min-w-max w-full">
          <thead className='text-left'>
          <tr>
            <th>Name</th>
            <th>CIPR</th>
            <th>E&O (2021-22)</th>
            <th>Licensing (Regulator)</th>
            <th>Date Sponsored/Contracted</th>
            <th>Beneva</th>
            <th>Beneva, La Cap, DI</th>
            <th>DI Code</th>
            <th>Fundserv Code</th>
            <th>Serenia Life</th>
            <th>Production LOI</th>
            <th>APEXA Profile</th>
            <th>IDC Contract</th>
            <th>B2B</th>
            <th>21st Century</th>
            <th>Allianz</th>
            <th>Dest Travel</th>
            <th>Termination Date</th>
          </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.Name}</td>
                {Object.entries(item).map(([key, value]) => {
                  if (key !== 'Name') {
                    const isLink = isUrl(value);
                    const cellColor = colorMap[value] || '';
                    return (
                      <td key={key} className={`${cellColor}`}>
                        {isLink ? (
                          <Link href={value}>
                              <small>🔗</small>
                          </Link>
                        ) : (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateField(index, key, e.target.value)}
                            className={`${cellColor}` + " w-full"}
                            disabled={key === 'Name'}
                          />
                        )}
                      </td>
                    );
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </>
  );
}

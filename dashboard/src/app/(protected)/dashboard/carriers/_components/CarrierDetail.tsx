'use client'
import React, { useState, useEffect } from 'react';
import { CarrierType, DocumentType } from '@/types/carrier';
import { motion } from 'framer-motion';

const DocumentDisplay = ({ carrier }: { carrier: CarrierType }) => {
  const documents: DocumentType[] = carrier.documents;
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentType[]>(documents);
  const [searchTerm, setSearchTerm] = useState('');
  const [productTypes, setProductTypes] = useState<Set<string>>(new Set());
  const [documentTypes, setDocumentTypes] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    productType: new Set<string>(),
    documentType: new Set<string>(),
    category: new Set<string>(),
  });

  useEffect(() => {
    const newProductTypes = new Set<string>();
    const newDocumentTypes = new Set<string>();
    const newCategories = new Set<string>();

    documents.forEach((doc) => {
      if (doc.documentType) newDocumentTypes.add(doc.documentType);
      if (doc.category) newCategories.add(doc.category);
      if (Array.isArray(doc.productType)) {
        doc.productType.forEach((type) => {
          if (type.name) newProductTypes.add(type.name);
        });
      }
    });

    setProductTypes(newProductTypes);
    setDocumentTypes(newDocumentTypes);
    setCategories(newCategories);
    applyFilters();
  }, [documents, filters, searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'productType' | 'documentType' | 'category') => {
    const newFilters = { ...filters };
    console.log(filters)
    if (event.target.checked) {
      newFilters[type].add(event.target.value);
    } else {
      newFilters[type].delete(event.target.value);
    }
    console.log(newFilters)
    setFilters(newFilters);
  };

  const applyFilters = () => {
    let result = documents;
  
    if (searchTerm) {
      result = result.filter((doc) => doc.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
  
    const filterKeys = Object.keys(filters) as Array<keyof typeof filters>;
    result = result.filter((doc) =>
      filterKeys.every((key) => {
        if (filters[key].size > 0) {
          if (key === 'productType') {
            // Assuming doc.productType is an array of objects with a 'name' property
            return Array.isArray(doc.productType) && doc.productType.some((productType: { name: string }) => filters[key].has(productType.name));
          } else {
            // Handle other filters as before
            return filters[key].has(doc[key]);
          }
        }
        return true;
      })
    );
  
    setFilteredDocuments(result);
  };
  console.log(documents)
  console.log(productTypes)
  return (
    <div className="mx-auto p-4">
      <div className="flex flex-row justify-end">
        <input
          type="search"
          className="mt-2 mb-4 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Search documents..."
          onChange={handleSearchChange}
          value={searchTerm}
        />
      </div>
      <div className='flex flex-row gap-8 my-3'>
        <div className='flex flex-col'>
          <h3 className='text-title-md mb-4 font-satoshi'>Filters</h3>
          <div className="space-y-4">
            <div>
              <h4 className='font-semibold mt-4'>Product Type</h4>
              {Array.from(productTypes).map((type) => (
                <div key={type} className="mt-2">
                  <label className='flex items-center space-x-2'>
                    <input className='accent-primary rounded' type="checkbox" value={type} onChange={(e) => handleFilterChange(e, 'productType')} />
                    <span className='text-body'>{type}</span>
                  </label>
                </div>
              ))}
            </div>
            <div>
              <h4 className='font-semibold mt-4'>Document Type</h4>
              {Array.from(documentTypes).map((type) => (
                <div key={type} className="mt-2">
                  <label className='flex items-center space-x-2'>
                    <input className='accent-primary rounded' type="checkbox" value={type} onChange={(e) => handleFilterChange(e, 'documentType')} />
                    <span className='text-body'>{type}</span>
                  </label>
                </div>
              ))}
            </div>
            <div>
              <h4 className='font-semibold mt-4'>Category</h4>
              {Array.from(categories).map((category) => (
                <div key={category} className="mt-2">
                  <label className='flex items-center space-x-2'>
                    <input className='accent-primary rounded' type="checkbox" value={category} onChange={(e) => handleFilterChange(e, 'category')} />
                    <span className='text-body'>{category}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4"> {/* Adjusted the gap here */}
          {filteredDocuments.map((doc, index) => (
            <motion.div key={index} className="flex flex-col justify-center items-center px-4 py-0 max-h-[4rem] border border-stroke rounded bg-white shadow-card"
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.1 + Number(index) * 0.1, duration: 0.4 }}
            >
              <a href={doc.htmlLink} target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-secondary">
                <h5 className="text-md text-black">
                  {doc.title}
                </h5>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentDisplay;

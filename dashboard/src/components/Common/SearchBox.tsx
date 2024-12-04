import React, { useState, useEffect } from 'react';

interface SearchBoxProps {
  label: string;
  onSearch: (term: string) => void;
  onSelect: (item: any) => void;
  results: any[];
  isEditable?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  label,
  onSearch,
  onSelect,
  results = [],
  isEditable = true
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(inputValue);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue, onSearch]);

  const handleSelect = (item: any) => {
    setSelectedItem(item);
    setInputValue(`${item.firstName} ${item.lastName}`);
  };

  const handleConfirm = () => {
    if (selectedItem) {
      onSelect(selectedItem);
    }
  };

  return (
    <div className="search-box">
      <input
        type="text"
        placeholder={`Search ${label}...`}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={!isEditable}
        className="w-full p-2 border rounded-md"
      />
      {results.length > 0 && (
        <ul className="mt-2 max-h-72 overflow-y-auto border rounded-md">
          {results.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item)}
              className={`p-2 hover:bg-gray-100 cursor-pointer ${
                selectedItem === item ? 'bg-blue-100' : ''
              }`}
            >
              {item.firstName} {item.lastName}
            </li>
          ))}
        </ul>
      )}
      {inputValue && results.length === 0 && (
        <p className="mt-2 text-gray-500">No results found.</p>
      )}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedItem}
          className={`px-4 py-2 rounded-md ${
            selectedItem
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default SearchBox;
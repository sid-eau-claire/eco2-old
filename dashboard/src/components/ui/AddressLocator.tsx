import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Address = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type AddressLocatorProps = {
  onAddressSelect: (address: string, mapUrl: string) => void;
};

const AddressLocator: React.FC<AddressLocatorProps> = ({ onAddressSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setAddresses([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ca`);
      const data = await response.json();
      setAddresses(data);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error fetching address options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  };

  const handleAddressSelect = (address: Address) => {
    setInputValue(address.display_name);
    setShowDropdown(false);
    const mapUrl = `https://www.openstreetmap.org/?mlat=${address.lat}&mlon=${address.lon}&zoom=15`;
    onAddressSelect(address.display_name, mapUrl);
  };

  return (
    <div className="relative w-full">
      <Input
        type="text"
        placeholder="Enter address"
        value={inputValue}
        onChange={handleInputChange}
        className="w-full"
      />
      {isLoading && (
        <Loader2 className="absolute right-2 top-2 h-5 w-5 animate-spin text-gray-400" />
      )}
      {showDropdown && addresses.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded-md shadow-lg">
          {addresses.map((address) => (
            <li
              key={address.place_id}
              onClick={() => handleAddressSelect(address)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {address.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressLocator;
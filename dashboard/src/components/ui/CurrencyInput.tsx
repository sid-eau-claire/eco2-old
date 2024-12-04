import React, { useState, useEffect, forwardRef } from 'react';
import { Input } from "@/components/ui/input"

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string | number;
  onChange: (value: string | number) => void;
}

const CurrencyInput: React.ForwardRefRenderFunction<HTMLInputElement, CurrencyInputProps> = (
  { value, onChange, onBlur, disabled, ...props }, 
  ref
) => {
  const [isFocused, setIsFocused] = useState(false);
  const [numericValue, setNumericValue] = useState<number>(0);

  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      setNumericValue(Number(value));
    } else {
      setNumericValue(0);
    }
  }, [value]);

  const formatCurrency = (val: number): string => {
    if (isNaN(val) || val === 0) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    e.target.value = numericValue.toString();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue)) {
      setNumericValue(numValue);
      onChange(numValue);
    } else {
      setNumericValue(0);
      onChange(0);
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    setNumericValue(parseFloat(rawValue) || 0);
    onChange(rawValue);
  };

  const displayValue = isFocused ? (numericValue === 0 ? '' : numericValue.toString()) : formatCurrency(numericValue);

  return (
    <Input
      {...props}
      ref={ref}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
    />
  );
};

export default forwardRef(CurrencyInput);
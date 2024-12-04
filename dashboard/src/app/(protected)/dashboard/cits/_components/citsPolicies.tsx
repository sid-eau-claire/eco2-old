import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { citsGetPolicies } from '../_actions/cits';

const CITSPolicies = ({ citsClientId }: { citsClientId: string }) => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [filterTerm, setFilterTerm] = useState('');
  const [filterColumn, setFilterColumn] = useState('pol_number');

  useEffect(() => {
    const fetchPolicies = async () => {
      const fetchedPolicies = await citsGetPolicies(citsClientId);
      setPolicies(fetchedPolicies);
    };
    fetchPolicies();
  }, [citsClientId]);

  const requestSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedPolicies = () => {
    const sortedPolicies = [...policies];
    if (sortConfig.key) {
      sortedPolicies.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortedPolicies;
  };

  const getFilteredPolicies = () => {
    return getSortedPolicies().filter(policy =>
      policy[filterColumn].toString().toLowerCase().includes(filterTerm.toLowerCase())
    );
  };

  const renderSortIcon = (columnName: string) => {
    if (sortConfig.key === columnName) {
      return sortConfig.direction === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    }
    return null;
  };

  return (
    <div className="p-0">
      <div className="flex flex-row justify-between items-center mb-4">
        <h2 className="text-lg font-bold">CITS Policies</h2>
        <div className="flex items-center space-x-2">
          <Select
            value={filterColumn}
            onValueChange={setFilterColumn}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pol_number">Policy Number</SelectItem>
              <SelectItem value="line_of_business">Line of Business</SelectItem>
              <SelectItem value="product_type">Product Type</SelectItem>
              <SelectItem value="carrier_code">Carrier Code</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search policies..."
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => requestSort('pol_number')} className="cursor-pointer">
              Policy Number {renderSortIcon('pol_number')}
            </TableHead>
            <TableHead onClick={() => requestSort('line_of_business')} className="cursor-pointer">
              Line of Business {renderSortIcon('line_of_business')}
            </TableHead>
            <TableHead onClick={() => requestSort('product_type')} className="cursor-pointer">
              Product Type {renderSortIcon('product_type')}
            </TableHead>
            <TableHead onClick={() => requestSort('carrier_code')} className="cursor-pointer">
              Carrier Code {renderSortIcon('carrier_code')}
            </TableHead>
            <TableHead onClick={() => requestSort('policy_status')} className="cursor-pointer">
              Status {renderSortIcon('policy_status')}
            </TableHead>
            <TableHead onClick={() => requestSort('eff_date')} className="cursor-pointer">
              Effective Date {renderSortIcon('eff_date')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getFilteredPolicies().map((policy) => (
            <TableRow key={policy.id}>
              <TableCell>{policy.pol_number}</TableCell>
              <TableCell>{policy.line_of_business}</TableCell>
              <TableCell>{policy.product_type}</TableCell>
              <TableCell>{policy.carrier_code}</TableCell>
              <TableCell>{policy.policy_status}</TableCell>
              <TableCell>{new Date(policy.eff_date).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CITSPolicies;
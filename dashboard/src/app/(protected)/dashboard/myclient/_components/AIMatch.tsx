import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertCircle, Info, FileText } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import Fuse from 'fuse.js';

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  email: string | null;
  title: string | null;
  company: string | null;
  prefix: string | null;
  dateOfBirth: string | null;
  mobilePhone: string | null;
  homePhone: string | null;
  address: {
    address: string | null
    city: string | null
    provinceId: string | null
    countryId: string | null
  } | null
  clientType: string | null;
  houseHoldType: string | null;
  houseHoldName: string | null;
  backgroundInformation: string | null;
  maritialStatus: string | null;
  smokingStatus: string | null;
  netWorth: number | null;
}

type MatchResult = {
  client1: Client;
  client2: Client;
  score: number;
  reasons: string[];
}

interface AIMatchProps {
  clients: Client[];
  onMerge: (selectedRecords: string[]) => void;
}

const fieldLabels: Record<keyof Client | 'address.address' | 'address.city', string> = {
  id: 'ID',
  firstName: 'First Name',
  lastName: 'Last Name',
  middleName: 'Middle Name',
  email: 'Email',
  title: 'Title',
  company: 'Company',
  prefix: 'Prefix',
  dateOfBirth: 'Date of Birth',
  mobilePhone: 'Mobile Phone',
  homePhone: 'Home Phone',
  address: 'Address',
  'address.address': 'Street Address',
  'address.city': 'City',
  clientType: 'Client Type',
  houseHoldType: 'Household Type',
  houseHoldName: 'Household Name',
  backgroundInformation: 'Background Information',
  maritialStatus: 'Marital Status',
  smokingStatus: 'Smoking Status',
  netWorth: 'Net Worth',
};

const AIMatch: React.FC<AIMatchProps> = ({ clients, onMerge }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<string[]>([]);
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [comparisonPair, setComparisonPair] = useState<MatchResult | null>(null);

  const getFullName = (client: Client) => {
    return `${client.firstName} ${client.middleName || ''} ${client.lastName}`.trim().toLowerCase();
  };

  const calculateDateDifference = (dob1: string | null, dob2: string | null): number | null => {
    if (!dob1 || !dob2) return null;
    const date1 = parseISO(dob1);
    const date2 = parseISO(dob2);
    return Math.abs(differenceInDays(date1, date2));
  };

  const matchResults = useMemo(() => {
    console.log('Calculating match results...');
    console.log('Number of clients:', clients.length);

    const nameOptions = {
      includeScore: true,
      threshold: 0.6,
      keys: ['firstName', 'lastName', 'middleName']
    };

    const fuse = new Fuse(clients.map(client => ({
      ...client,
      firstName: client.firstName.toLowerCase(),
      lastName: client.lastName.toLowerCase(),
      middleName: client.middleName?.toLowerCase() || '',
    })), nameOptions);

    const results: MatchResult[] = [];
    clients.forEach((client1, index) => {
      const nameMatches = fuse.search(getFullName(client1));
      
      nameMatches.forEach(match => {
        const client2 = match.item;
        if (client1.id !== client2.id) {
          const reasons = [];
          let nameScore = (1 - (match.score || 0)) * 0.9; // Max 90% for name similarity

          // Exact name match check (case-insensitive)
          const isExactNameMatch = 
            client1.firstName.toLowerCase() === client2.firstName.toLowerCase() &&
            client1.lastName.toLowerCase() === client2.lastName.toLowerCase() &&
            (client1.middleName || '').toLowerCase() === (client2.middleName || '').toLowerCase();

          if (isExactNameMatch) {
            nameScore = 0.9; // 90% for exact name match
            reasons.push('Exactly same name (case-insensitive)');
          } else if (nameScore > 0.7) {
            reasons.push('Very similar names');
          } else if (nameScore > 0.5) {
            reasons.push('Somewhat similar names');
          }

          // Date of Birth Score
          let dobScore = 0; // Default score for different birthdays
          const dateDifference = calculateDateDifference(client1.dateOfBirth, client2.dateOfBirth);
          if (dateDifference !== null) {
            if (dateDifference === 0) {
              dobScore = 0.9; // 90% for identical date of birth
              reasons.push('Identical date of birth');
            } else {
              reasons.push(`Different date of birth (${dateDifference} days difference)`);
            }
          } else {
            reasons.push('Missing date of birth information');
          }

          // Email Score
          let emailScore = 0;
          if (client1.email && client2.email && 
              client1.email.toLowerCase() === client2.email.toLowerCase()) {
            emailScore = 0.8;
            reasons.push('Identical email');
          }

          // Phone Score
          let phoneScore = 0;
          if (client1.mobilePhone && client2.mobilePhone && client1.mobilePhone === client2.mobilePhone) {
            phoneScore = 0.8;
            reasons.push('Identical mobile phone');
          } else if (client1.homePhone && client2.homePhone && client1.homePhone === client2.homePhone) {
            phoneScore = 0.8;
            reasons.push('Identical home phone');
          }

          // Calculate final score
          let finalScore = Math.max(nameScore, dobScore, emailScore, phoneScore);

          // Check for 100% match condition
          if (isExactNameMatch && dateDifference === 0) {
            finalScore = 1; // 100% match
            reasons.push('Exact name match (case-insensitive) and identical date of birth');
          }

          // Debug logging
          console.log(`Comparing ${client1.firstName} ${client1.lastName} with ${client2.firstName} ${client2.lastName}`);
          console.log(`Scores - Name: ${nameScore}, DOB: ${dobScore}, Email: ${emailScore}, Phone: ${phoneScore}`);
          console.log(`Final Score: ${finalScore}`);

          // Include all results with a score higher than 0.5
          if (finalScore > 0.5) {
            results.push({
              client1,
              client2,
              score: finalScore,
              reasons,
            });
          }
        }
      });
    });

    console.log(`Total match results: ${results.length}`);
    return results.sort((a, b) => b.score - a.score);
  }, [clients]);

  const handleMerge = () => {
    onMerge(selectedPair);
    setIsOpen(false);
  };

  const openComparisonDialog = (result: MatchResult) => {
    setComparisonPair(result);
    setComparisonDialogOpen(true);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={() => setIsOpen(true)}
              className="bg-indigo-600 hover:text-whiten text-white hover:bg-indigo-800"
            >
              <Brain className="mr-2 h-4 w-4" />
              AI Match
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Find potential duplicate clients using AI matching</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-indigo-700">AI Match Results</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto">
            {matchResults.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-2">Client 1 name and email</TableHead>
                    <TableHead className="py-2">Client 2 name and email</TableHead>
                    <TableHead className="py-2">Match Score</TableHead>
                    <TableHead className="py-2">Reasons</TableHead>
                    <TableHead className="py-2">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchResults.map((result, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="py-1 max-w-[15rem]">
                        <div className="font-medium">{getFullName(result.client1)}</div>
                        <div className="text-sm text-gray-500">{result.client1.email}</div>
                      </TableCell>
                      <TableCell className="py-1 max-w-[15rem]">
                        <div className="font-medium">{getFullName(result.client2)}</div>
                        <div className="text-sm text-gray-500">{result.client2.email}</div>
                      </TableCell>
                      <TableCell className="py-1">
                        <Badge variant={result.score > 0.8 ? "default" : "secondary"} className="text-xs">
                          {(result.score * 100).toFixed(2)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1">
                        <div className="flex space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <ul className="list-disc pl-4">
                                  {result.reasons.map((reason, idx) => (
                                    <li key={idx}>{reason}</li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => openComparisonDialog(result)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="py-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPair([result.client1.id, result.client2.id])}
                          className={selectedPair.includes(result.client1.id) && selectedPair.includes(result.client2.id) 
                            ? 'bg-green-200 hover:bg-green-300' 
                            : 'hover:bg-green-100'}
                        >
                          Select for Merge
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="mx-auto h-12 w-12 text-yellow-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No matches found</h3>
                <p className="mt-1 text-sm text-gray-500">There are no potential duplicate clients detected.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
            <Button onClick={handleMerge} disabled={selectedPair.length !== 2}>Merge Selected</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={comparisonDialogOpen} onOpenChange={setComparisonDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Client Comparison</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            {comparisonPair && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Client 1</TableHead>
                    <TableHead>Client 2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(fieldLabels).map((key) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{fieldLabels[key as keyof typeof fieldLabels]}</TableCell>
                      <TableCell>
                        {key === 'address.address' 
                          ? comparisonPair.client1.address?.address || 'N/A'
                          : key === 'address.city'
                            ? comparisonPair.client1.address?.city || 'N/A'
                            : comparisonPair.client1[key as keyof Client]?.toString() || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {key === 'address.address' 
                          ? comparisonPair.client2.address?.address || 'N/A'
                          : key === 'address.city'
                            ? comparisonPair.client2.address?.city || 'N/A'
                            : comparisonPair.client2[key as keyof Client]?.toString() || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setComparisonDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIMatch;
          
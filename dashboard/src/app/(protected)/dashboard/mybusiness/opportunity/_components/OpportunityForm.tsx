// File: OpportunityForm.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Users, FileText, ListChecks, LayoutDashboard, ChevronDown, ChevronUp } from 'lucide-react';

interface OpportunityFormProps {
  opportunityData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => void;
  handlePlanningOptionsChange: (selectedOptions: string) => void;
  clients: any[];
  setShowAddRecord: (show: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
}

const OpportunityForm: React.FC<OpportunityFormProps> = ({ 
  opportunityData, 
  handleInputChange, 
  handlePlanningOptionsChange, 
  clients, 
  setShowAddRecord, 
  setDeleteDialogOpen 
}) => {
  const [expanded, setExpanded] = useState({
    client: true,
    description: true,
    planningOptions: true,
    details: true,
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const Section: React.FC<{ title: string; icon: React.ReactNode; name: keyof typeof expanded; children: React.ReactNode }> = ({ title, icon, name, children }) => (
    <div className="border-b pb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection(name)}>
        <div className="flex items-center">
          {icon}
          <h2 className="text-lg font-semibold ml-2">{title}</h2>
        </div>
        {expanded[name] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      {expanded[name] && <div className="mt-2">{children}</div>}
    </div>
  );

  const planningOptionsChoices = [
    { value: 'Life Insurance Solutions', label: 'Life Insurance Solutions' },
    { value: 'Retirement Planning', label: 'Retirement Planning' },
    { value: 'Kid Education', label: 'Kid Education' }
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className='text-xl font-semibold'>Opportunity</h3>
      </CardHeader>
      <CardContent>
        <Section title="Client" icon={<Users size={18} />} name="client">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select 
                  onValueChange={(value) => handleInputChange({ target: { name: 'clientId', value } })}
                  value={opportunityData.clientId?.toString() || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.firstName} {client.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>
                Select a client for this opportunity
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Section>
        <Section title="Description" icon={<FileText size={18} />} name="description">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Textarea
                  name="description"
                  value={opportunityData.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className="mt-2"
                />
              </TooltipTrigger>
              <TooltipContent>
                Provide a description for this opportunity
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Section>
        <Section title="Planning Options" icon={<ListChecks size={18} />} name="planningOptions">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select 
                  onValueChange={(value) => handlePlanningOptionsChange(value)}
                  value={opportunityData.planningOptions || ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select planning options" />
                  </SelectTrigger>
                  <SelectContent>
                    {planningOptionsChoices.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>
                Select planning options for this opportunity
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Section>
        <Section title="Details" icon={<LayoutDashboard size={18} />} name="details">
          <div className="space-y-2 mt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select onValueChange={(value) => handleInputChange({ target: { name: 'type', value } })} value={opportunityData.type}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select opportunity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Investment">Investment</SelectItem>
                      <SelectItem value="Affiliate">Affiliate</SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  Select the type of opportunity
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select onValueChange={(value) => handleInputChange({ target: { name: 'status', value } })} value={opportunityData.status}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select opportunity status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prospect">Prospect</SelectItem>
                      <SelectItem value="Discovery">Discovery</SelectItem>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="Plan Ready">Plan Ready</SelectItem>
                      <SelectItem value="Pending Close">Pending Close</SelectItem>
                      <SelectItem value="Paper Work">Paper Work</SelectItem>
                      <SelectItem value="In The Mill">In The Mill</SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  Select the current status of the opportunity
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    type="number"
                    name="estAmount"
                    value={opportunityData.estAmount}
                    onChange={handleInputChange}
                    placeholder="Estimated Amount"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  Enter the estimated amount for this opportunity
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select onValueChange={(value) => handleInputChange({ target: { name: 'intent', value } })} value={opportunityData.intent}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select intent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Stuck">Stuck</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  Select the intent for this opportunity
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </Section>
        <div className="bg-background p-4 border-t flex flex-col justify-center items-center space-y-4">
          <Button type="submit" className="w-[10rem] bg-success">Save Opportunity</Button>
          <Button type="button" className="w-[10rem] bg-orange-500" onClick={() => setShowAddRecord(false)}>
            Cancel
          </Button>
          {opportunityData.id && opportunityData.status === 'Prospect' && (
            <Button type="button" className="w-[10rem] bg-destructive" onClick={() => setDeleteDialogOpen(true)}>
              Delete Opportunity
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityForm;
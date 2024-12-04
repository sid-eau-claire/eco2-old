import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, User, Mail, Phone, Building, Users, Tag, Heart, DollarSign, Briefcase, Info, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Client, Province } from './types';
import { updateClient } from '../_actions/client';
import { get } from 'lodash';

interface PersonDetailsProps {
  client: Client;
  provinces: Province[];
  onUpdateSuccess: () => void;
}

export default function PersonDetails({ client, provinces, onUpdateSuccess }: PersonDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' });

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      ...client,
      dateOfBirth: client.dateOfBirth ? new Date(client.dateOfBirth) : undefined,
    }
  });

  const clientType = watch('clientType');

  const onSubmit = async (data: any) => {
    const formattedData = {
      ...data,
      dateOfBirth: data.dateOfBirth ? format(new Date(data.dateOfBirth), 'yyyy-MM-dd') : null,
      netWorth: isNaN(data.netWorth) ? 0 : Number(data.netWorth),
      email: data.email || null,
      address: {
        ...data.address,
        provinceId: data.address.provinceId === '' ? null : data.address.provinceId
      }
    };

    try {
      await updateClient(client.id, formattedData);
      setDialogContent({
        title: 'Success',
        description: 'Client information has been successfully updated.'
      });
      setDialogOpen(true);
      setIsEditing(false);
      onUpdateSuccess();
    } catch (error) {
      console.error('Error updating client:', error);
      setDialogContent({
        title: 'Error',
        description: 'Failed to update client information. Please try again.'
      });
      setDialogOpen(true);
    }
  };

  const LabelWithTooltip = ({ icon: Icon, label, tooltip }: { icon: React.ElementType, label: string, tooltip: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Label>{label}</Label>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderField = (name: string, label: string, icon: React.ElementType, tooltip: string, type: string = "text") => {
    return (
      <div className="space-y-2">
        <LabelWithTooltip icon={icon} label={label} tooltip={tooltip} />
        <Controller
          name={name as any}
          control={control}
          rules={{ required: `${label} is required` }}
          render={({ field, fieldState: { error } }) => 
            isEditing ? 
              <Input {...field} type={type} /> : 
              <Input value={field.value || ''} readOnly />
          }
        />
        {get(errors, name) && (
          <p className="text-red-500">{get(errors, `${name}.message`) as unknown as string}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {renderField("firstName", "First Name", User, "Enter the client's first name")}
        {renderField("middleName", "Middle Name", User, "Enter the client's middle name (optional)")}
        {renderField("lastName", "Last Name", User, "Enter the client's last name")}
        {renderField("prefix", "Prefix", User, "Enter the client's prefix (e.g., Mr., Mrs., Dr.)")}
        {renderField("email", "Email", Mail, "Enter the client's email address", "email")}
        {renderField("homePhone", "Home Phone", Phone, "Enter the client's home phone number")}
        {renderField("address.mobilePhone", "Mobile Phone", Phone, "Enter the client's mobile phone number")}
        {renderField("address.address", "Address", MapPin, "Enter the client's street address")}
        {renderField("address.city", "City", MapPin, "Enter the client's city")}

        <div className="space-y-2">
          <LabelWithTooltip icon={MapPin} label="Province" tooltip="Select the client's province" />
          <Controller
            name="address.provinceId"
            control={control}
            render={({ field }) => 
              isEditing ? (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province.id} value={province.id}>{province.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={provinces.find(p => p.id === client.address?.provinceId)?.name || ''} readOnly />
              )
            }
          />
        </div>

        {renderField("address.postalCode", "Postal Code", MapPin, "Enter the client's postal code")}

        <div className="space-y-2">
          <LabelWithTooltip icon={MapPin} label="Country" tooltip="Select the client's country" />
          <Controller
            name="address.countryId"
            control={control}
            render={({ field }) => 
              isEditing ? (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Canada</SelectItem>
                    <SelectItem value="2">Canada</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={client.address?.countryId === '1' || client.address?.countryId === '2' ? 'Canada' : ''} readOnly />
              )
            }
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={Users} label="Client Type" tooltip="Select the client type" />
          <Controller
            name="clientType"
            control={control}
            render={({ field }) => 
              isEditing ? (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="person">Person</SelectItem>
                    <SelectItem value="household">Household</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={client.clientType} readOnly />
              )
            }
          />
        </div>

        {clientType === 'household' && (
          <div className="space-y-2">
            <LabelWithTooltip icon={Users} label="Household Name" tooltip="Select the household member type" />
            <Controller
              name="houseHoldName"
              control={control}
              render={({ field }) => 
                isEditing ? (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select household member type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="father">Father</SelectItem>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="son">Son</SelectItem>
                      <SelectItem value="daughter">Daughter</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={client.houseHoldName || ''} readOnly />
                )
              }
            />
          </div>
        )}

        {renderField("company", "Company", Building, "Enter the client's company name")}
        {renderField("title", "Title", Briefcase, "Enter the client's job title")}

        <div className="space-y-2">
          <LabelWithTooltip icon={Info} label="Background Information" tooltip="Enter any relevant background information about the client" />
          <Controller
            name="backgroundInformation"
            control={control}
            render={({ field }) => 
              isEditing ? 
                <Textarea {...field} /> : 
                <Textarea value={client.backgroundInformation || ''} readOnly />
            }
          />
        </div>

        {renderField("tags", "Tags", Tag, "Enter tags related to the client (comma-separated)")}

        <div className="space-y-2">
          <LabelWithTooltip icon={Heart} label="Marital Status" tooltip="Select the client's marital status" />
          <Controller
            name="maritialStatus"
            control={control}
            render={({ field }) => 
              isEditing ? (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={client.maritialStatus || ''} readOnly />
              )
            }
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={CalendarIcon} label="Date of Birth" tooltip="Select the client's date of birth" />
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => 
              isEditing ? (
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date);
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <Input value={client.dateOfBirth ? format(new Date(client.dateOfBirth), 'PPP') : ''} readOnly />
              )
            }
          />
        </div>

        {renderField("netWorth", "Net Worth", DollarSign, "Enter the client's net worth", "number")}

        {isEditing ? (
          <div className="flex space-x-2 pt-4">
            <Button type="submit">Save Changes</Button>
            <Button type="button" onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
        )}
      </form>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>{dialogContent.description}</DialogDescription>
          </DialogHeader>
          <Button onClick={() => {
            setDialogOpen(false);
            if (dialogContent.title === 'Success') {
              // Optionally refresh the data or perform any other action on success
            }
          }}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
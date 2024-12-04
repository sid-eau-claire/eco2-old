'use client'
import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { createClient, getProvinces } from '../_actions/client' // Adjust the import path as needed
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, User, Mail, Phone, Building, Users, Tag, Heart, DollarSign, Briefcase, Info, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import Address from '@/components/ui/Address' // Adjust the import path as needed
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { set } from 'js-cookie'

interface AddClientProps {
  onClose: () => void
  profileId: string
  setRefresh: (refresh: number) => void 
}

interface Province {
  id: string;
  name: string;
}

export default function AddClient({ onClose, profileId, setRefresh }: AddClientProps) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' })
  
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      lastName: '',
      firstName: '',
      netWorth: 0,
      homePhone: '',
      email: '',
      clientType: 'person',
      prefix: '',
      gender: null,
      company: '',
      title: '',
      houseHoldName: '',
      backgroundInformation: '',
      tags: '',
      maritialStatus: '',
      middleName: '',
      dateOfBirth: '',
      address: {
        address: '',
        city: '',
        provinceId: '',
        postalCode: '',
        countryId: '2',
        mobilePhone: ''
      }
    }
  });

  const clientType = watch('clientType');

  useEffect(() => {
    const fetchProvinces = async () => {
      const fetchedProvinces = await getProvinces()
      setProvinces(fetchedProvinces)
    }
    fetchProvinces()
  }, [])

  const onSubmit = async (data: any) => {
    const formattedData = {
      ...data,
      dateOfBirth: data.dateOfBirth ? format(new Date(data.dateOfBirth), 'yyyy-MM-dd') : null,
      netAmount: isNaN(data.netWorth) ? 0 : data.netWorth,
      email: data.email || null,
      address: {
        ...data.address,
        provinceId: data.address.provinceId === '' ? null : data.address.provinceId
      }
    };

    try {
      const response = await createClient({ ...formattedData, profileId }, profileId);
      console.log('Client created:', response);
      if (response.status == 200) {
        setDialogContent({
          title: 'Success',
          description: 'Client has been successfully added.'
        });
        setDialogOpen(true);
      } else {
        setDialogContent({
          title: 'Error',
          description: `Failed to add client. Please try again. ${response.errorMessage}`
        });
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('Error creating client:', error);
      setDialogContent({
        title: 'Error',
        description: 'Failed to add client. Please try again.'
      });
      setDialogOpen(true);
    }
    setRefresh(Math.random());
  };

  const handleAddressSelect = (address: string, mapUrl: string) => {
    const addressParts = address.split(', ')
    setValue('address.address', addressParts[0])
    setValue('address.city', addressParts[1])
    setValue('address.postalCode', addressParts[addressParts.length - 2])
    setValue('address.countryId', '2') // Assuming Canada

    const provinceName = addressParts[addressParts.length - 3]
    const province = provinces.find(p => p.name.toLowerCase() === provinceName.toLowerCase())
    if (province) {
      setValue('address.provinceId', province.id)
    }
  }

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
  )

  return (
    <ScrollArea className="h-[100vh] w-full pl-0 pb-36 pt-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
        <div className="space-y-2">
          <LabelWithTooltip icon={User} label="First Name" tooltip="Enter the client's first name" />
          <Controller
            name="firstName"
            control={control}
            rules={{ required: "First name is required" }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={User} label="Middle Name" tooltip="Enter the client's middle name (optional)" />
          <Controller
            name="middleName"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={User} label="Last Name" tooltip="Enter the client's last name" />
          <Controller
            name="lastName"
            control={control}
            rules={{ required: "Last name is required" }}
            render={({ field }) => <Input {...field} />}
          />
          {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={User} label="Prefix" tooltip="Enter the client's prefix (e.g., Mr., Mrs., Dr.)" />
          <Controller
            name="prefix"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </div>
        {/* New Gender Select Field */}
        <div className="space-y-2">
          <LabelWithTooltip icon={User} label="Gender" tooltip="Select the client's gender" />
          <Controller
            name="gender"
            control={control}
            render={({ field }) => 
              (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              )}
          />
        </div>        

        <div className="space-y-2">
          <LabelWithTooltip icon={Mail} label="Email" tooltip="Enter the client's email address" />
          <Controller
            name="email"
            control={control}
            render={({ field }) => <Input {...field} type="email" />}
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={Phone} label="Home Phone" tooltip="Enter the client's home phone number" />
          <Controller
            name="homePhone"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </div>
        <div className="space-y-2">
          <LabelWithTooltip icon={Phone} label="Mobile Phone" tooltip="Enter the client's mobile phone number" />
          <Controller
            name="address.mobilePhone"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </div>        

        <div className="space-y-2">
          <LabelWithTooltip icon={MapPin} label="Address" tooltip="Enter the client's street address" />
          <Address onAddressSelect={handleAddressSelect} />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={MapPin} label="City" tooltip="Enter the client's city" />
          <Controller
            name="address.city"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={MapPin} label="Province" tooltip="Select the client's province" />
          <Controller
            name="address.provinceId"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {provinces.find(p => p.id === field.value)?.name || "Select a province"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={MapPin} label="Postal Code" tooltip="Enter the client's postal code" />
          <Controller
            name="address.postalCode"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={MapPin} label="Country" tooltip="Select the client's country" />
          <Controller
            name="address.countryId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Canada</SelectItem>
                  <SelectItem value="2">Canada</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={Users} label="Client Type" tooltip="Select the client type" />
          <Controller
            name="clientType"
            control={control}
            defaultValue="individual"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">individual</SelectItem>
                  <SelectItem value="household">household</SelectItem>
                  <SelectItem value="organization">organization</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {clientType === 'household' && (
          <div className="space-y-2">
            <LabelWithTooltip icon={Users} label="Household Name" tooltip="Select the household member type" />
            <Controller
              name="houseHoldName"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
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
              )}
            />
          </div>
        )}

        <div className="space-y-2">
          <LabelWithTooltip icon={Building} label="Company" tooltip="Enter the client's company name" />
          <Controller
            name="company"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={Briefcase} label="Title" tooltip="Enter the client's job title" />
          <Controller
            name="title"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={Info} label="Background Information" tooltip="Enter any relevant background information about the client" />
          <Controller
            name="backgroundInformation"
            control={control}
            render={({ field }) => <Textarea {...field} />}
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={Tag} label="Tags" tooltip="Enter tags related to the client (comma-separated)" />
          <Controller
            name="tags"
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={Heart} label="Marital Status" tooltip="Select the client's marital status" />
          <Controller
            name="maritialStatus"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={CalendarIcon} label="Date of Birth" tooltip="Select the client's date of birth" />
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
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
                      field.onChange(date ? date.toISOString() : '')
                      setIsCalendarOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        </div>

        <div className="space-y-2">
          <LabelWithTooltip icon={DollarSign} label="Net Worth" tooltip="Enter the client's net worth" />
          <Controller
            name="netWorth"
            control={control}
            render={({ field }) => <Input {...field} type="number" />}
          />
        </div>        
        <div className="flex space-x-2 pt-4">
          <Button type="submit">Add Client</Button>
          <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
        </div>
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
              onClose();
            }
          }}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  )
}                        
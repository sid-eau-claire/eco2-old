'use client'
import React, { useEffect, useRef, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { getCarriers, getProvinces, getClients } from '../_actions/retrievedata';
import { MdAddCircle, MdSearch } from "react-icons/md";
import { IoCloseCircle } from "react-icons/io5";
import { SearchBox } from '@/components/Common';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const CarrierApplicant = ({ form, currentStep, setCurrentStep, markComplete, isEditable, advisor }: { form: any, currentStep: number, setCurrentStep: any, markComplete: any, isEditable?: boolean, advisor: string }) => {
  const { control, setValue, watch, formState: { errors } } = form;
  const formData = watch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [carriers, setCarriers] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [clients, setClients] = useState([]);
  const [logoUrl, setLogoUrl] = useState('/images/eauclaire/ECO_Logo_Golden.svg');
  const [isComplete, setIsComplete] = useState(false);
  const [isCarrierComplete, setIsCarrierComplete] = useState(false);
  const completionRef = useRef(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'applicants'
  });
  const insuredAnnuitantWatchFields = fields.map((field, index) => watch(`applicants[${index}].isInsuredAnnuitant`));

  // State for search
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentApplicantIndex, setCurrentApplicantIndex] = useState(0);

  useEffect(() => {
    const fetchCarriers = async () => {
      const response = await getCarriers();
      setCarriers(response as any);
    };
    const fetchProvinces = async () => {
      const response = await getProvinces();
      setProvinces(response);
    };
    const fetchClients = async () => {
      const response = await getClients(advisor);
      setClients(response as any);
    };
    fetchCarriers();
    fetchProvinces();
    fetchClients();    
  }, []);

  useEffect(() => {
    setIsCarrierComplete(formData?.appInfo?.carrierId && formData?.appInfo?.appNumber && formData?.appInfo?.provinceId && formData?.appInfo?.type)
    const applicants = formData.applicants || [];
    const allFieldsFilled = applicants.every((applicant: any) => 
      applicant.firstName && applicant.lastName && applicant.dateOfBirth && 
      (applicant.gender === 'male' || applicant.gender === 'female')
    );
    const allAffiliateFieldsFilled = applicants.every((applicant: any) => 
      applicant.firstName && applicant.lastName && applicant.email && applicant.phone
    );    
    const hasOwner = applicants.some((applicant: any) => applicant.isOwner);
    let hasInsuredAnnuitant = applicants.some((applicant: any) => applicant.isInsuredAnnuitant);
    if (formData?.appInfo?.carrierName == 'Brownstone Asset Management') {
      hasInsuredAnnuitant = true;
    }
    const isComplete = allFieldsFilled && hasOwner && hasInsuredAnnuitant && isCarrierComplete

    if ((isComplete || allAffiliateFieldsFilled) && !completionRef.current) {
      completionRef.current = true;
      formData.applicants?.forEach((applicant: any, index: number) => {
        if (!applicant.gender || applicant.gender == null ) {
          setValue(`applicants[${index}].gender`, 'notprovided');
        }
      })      
      markComplete(currentStep, true);
    } else if ((!isComplete && !allAffiliateFieldsFilled) && completionRef.current) {
      completionRef.current = false;
      markComplete(currentStep, false);
    }
  }, [formData, currentStep, markComplete, setValue]);

  useEffect(() => {
    if (provinces.length > 0 && formData?.appInfo?.provinceId) {
      setValue('appInfo.provinceId', formData.appInfo.provinceId, { shouldValidate: true });
    }
  }, [provinces, formData?.appInfo?.provinceId, setValue]); 

  useEffect(() => {
    if (carriers.length > 0 && formData?.appInfo?.carrierId) {
      setValue('appInfo.carrierId', formData.appInfo.carrierId, { shouldValidate: true });
      setValue('appInfo.carrierName', (carriers.find(({ id }) => id == formData.appInfo.carrierId) as any)?.carrierName, { shouldValidate: true });
    }
    const carrier: any = carriers.find(({ id }) => id == formData.appInfo.carrierId);
    if (carrier?.photo?.url) {
      setLogoUrl(carrier?.photo?.url);
    } else {
      setLogoUrl('/images/eauclaire/ECO_Logo_Golden.svg');
    }    
  }, [carriers, formData?.appInfo?.carrierId, setValue]);

  const handleSearch = (term: string) => {
    console.log('searching for', term); 
    if (term.length > 2) {
      const results = clients.filter((client: any) =>
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleClientSelect = (client: any) => {
    setValue(`applicants[${currentApplicantIndex}].firstName`, client.firstName);
    setValue(`applicants[${currentApplicantIndex}].lastName`, client.lastName);
    setValue(`applicants[${currentApplicantIndex}].dateOfBirth`, client.dateOfBirth);
    setValue(`applicants[${currentApplicantIndex}].gender`, client.gender.toLowerCase());
    setValue(`applicants[${currentApplicantIndex}].clientId`, client.id);
    setSearchTerm('');
    setSearchResults([]);
    setDialogOpen(false);  // Close the dialog after selection
  };
  // console.log('formData', formData);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data :any) => console.log(data))}>
        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-6">
            <FormField
              control={control}
              name="appInfo.carrierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrier</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                    <SelectTrigger className="max-w-[12rem]">
                      <SelectValue placeholder="Select Carrier" />
                    </SelectTrigger>
                    <SelectContent className='z-9999'>
                      {carriers.map((carrier: { id: number | string, carrierName: string }) => (
                        <SelectItem key={carrier.id} value={carrier.id.toString()}>{carrier.carrierName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="appInfo.appNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Number</FormLabel>
                  <FormControl>
                    <Input {...field} className="max-w-[12rem]" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="appInfo.policyAccountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{formData?.caseType == 'Insurance' ? 'Policy Number' : 'Account Number'}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="appInfo.provinceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Province</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Province" />
                    </SelectTrigger>
                    <SelectContent className='z-9999'>
                      {provinces.map((province:{ id: number | string, name: string }) => (
                        <SelectItem key={province.id} value={province.id.toString()}>{province.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="appInfo.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className='z-9999'>
                      <SelectItem value="Electronic">Electronic</SelectItem>
                      <SelectItem value="First Piece of Business (FPB)">First Piece of Business (FPB)</SelectItem>
                      <SelectItem value="Paper">Paper</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        {isCarrierComplete && (
          <Card className="mt-4">
            <CardContent className="p-6">
              {fields.map((field, index) => (
                <Card key={field.id} className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4 items-center relative">
                      {(!formData.applicants[index].clientId || formData.applicants[index].clientId === null) && (
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {setCurrentApplicantIndex(index); setDialogOpen(true);}}
                            >
                              <MdSearch className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Search Client</DialogTitle>
                            </DialogHeader>
                            <SearchBox
                              label="Client"
                              onSearch={handleSearch}
                              onSelect={handleClientSelect}
                              results={searchResults}
                              isEditable={isEditable}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                      <FormField
                        control={control}
                        name={`applicants[${index}].clientId`}
                        render={({ field }) => <input type="hidden" {...field} />}
                      />
                      {(formData.applicants[index].clientId && formData.applicants[index].clientId !== null) && (
                        <>
                          <FormField
                            control={control}
                            name={`applicants[${index}].firstName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} readOnly={!isEditable} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name={`applicants[${index}].lastName`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} readOnly={!isEditable} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          {(formData?.caseType == "Insurance" || formData?.caseType == "Investment") && (
                            <>
                              <FormField
                                control={control}
                                name={`applicants[${index}].dateOfBirth`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Date of Birth</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} readOnly={!isEditable} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={control}
                                name={`applicants[${index}].gender`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <SelectTrigger className="w-[6rem]">
                                        <SelectValue placeholder="Select" />
                                      </SelectTrigger>
                                      <SelectContent className='z-9999'>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="notprovided">Not Provided</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </>
                          )}
                        </>
                      )}
                      {(formData?.caseType == "Insurance" || formData?.caseType == "Investment") && formData.applicants[index].clientId && (
                        <>
                          <FormField
                            control={control}
                            name={`applicants[${index}].isOwner`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Owner?</FormLabel>
                              </FormItem>
                            )}
                          />
                          {formData?.appInfo?.carrierName != 'Brownstone Asset Management' && (
                            <FormField
                              control={control}
                              name={`applicants[${index}].isInsuredAnnuitant`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel>{formData?.caseType == "Insurance" ? "Is Insured ?" : "Is Annuitant?"}</FormLabel>
                                </FormItem>
                              )}
                            />
                          )}
                        </>
                      )}
                      {insuredAnnuitantWatchFields && insuredAnnuitantWatchFields[index] && formData?.caseType == "Insurance" && (
                        <FormField
                          control={control}
                          name={`applicants[${index}].smoker`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel>Smoking?</FormLabel>
                            </FormItem>
                          )}
                        />
                      )}
                      {(formData?.caseType == "Affiliate") && (
                        <>
                          <FormField
                            control={control}
                            name={`applicants[${index}].email`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name={`applicants[${index}].phone`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input type="tel" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name={`applicants[${index}].gender`}
                            render={({ field }) => (
                              <FormItem className="hidden">
                                <Select onValueChange={field.onChange} defaultValue={field.value || 'notprovided'}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className='z-9999'>
                                    <SelectItem value="notprovided">Not Provided</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                      <div className='absolute top-[-1rem] right-[-1rem]'>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-destructive"
                        >
                          <IoCloseCircle className="h-8 w-8" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  append({ firstName: '', lastName: '', dateOfBirth: null, gender: '', isInsuredAnnuitant: false, isOwner: false, smoker: false });
                }}
                className="text-primary"
              >
                <MdAddCircle className="h-8 w-8" />
              </Button>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
};

export default CarrierApplicant;
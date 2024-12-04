'use client'
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { State, City } from 'country-state-city';
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { FaCheck } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Applying = ({ invitation }: { invitation: any }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState(invitation?.step || 1);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', message: '', redirect: '' });

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      // Profile fields
      firstName: invitation?.inviteFirstName || '',
      lastName: invitation?.inviteLastName || '',
      middleName: invitation?.inviteMiddleName || '',
      nickName: invitation?.inviteNickName || '',
      dateOfBirth: invitation?.inviteDateOfBirth || '',
      mobilePhone: invitation?.invitePhoneNo || '',
      homePhone: '',
      officePhone: '',
      homeAddress: {
        province: invitation?.inviteHomeProvince || '',
        city: invitation?.inviteHomeCity || '',
        address: invitation?.inviteHomeAddress || '',
      },
      mailAddress: {
        province: invitation?.inviteMailProvince || '',
        city: invitation?.inviteMailCity || '',
        address: invitation?.inviteMailAddress || '',
      },
      creditScore: '',
      previousCompany: invitation?.invitePreviousCompany || '',
      advisorDuration: '',
      
      // Invitation fields
      inviteLicenseStatus: invitation?.inviteLicenseStatus || '',
      inviteCreditRating: invitation?.inviteCreditRating || '',
      inviteStandards: invitation?.inviteStandards || false,
      inviteAdvisorYear: invitation?.inviteAdvisorYear || false,
      inviteExamResults: null,
      inviteCurrentLicense: null,
      
      isSameAddress: true,
      status: invitation?.status || 'new',
      step: invitation?.step || 1,
    }
  });

  const isSameAddress = watch('isSameAddress');
  const licenseStatus = watch('inviteLicenseStatus');
  const creditRating = watch('inviteCreditRating');

  const stateData = State.getStatesOfCountry('CA').map(state => ({
    value: state.isoCode,
    label: state.name
  }));

  useEffect(() => {
    if (isSameAddress) {
      setValue('mailAddress', watch('homeAddress'));
    }
  }, [isSameAddress, watch('homeAddress'), setValue]);

  const onSubmit = async (data: any) => {
    try {
      // Implement your submission logic here
      console.log(data);
      setDialogContent({
        title: 'Application Updated',
        message: 'Your application has been successfully updated.',
        redirect: ''
      });
      setShowDialog(true);
    } catch (error) {
      console.error('Error updating application:', error);
      setDialogContent({
        title: 'Error',
        message: 'An error occurred while updating your application. Please try again.',
        redirect: ''
      });
      setShowDialog(true);
    }
  };

  const handleNext = () => {
    setActiveTab((prev: any) => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setActiveTab((prev: any) => Math.max(prev - 1, 1));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    if (e.target.files && e.target.files[0]) {
      setValue(field, e.target.files[0].name);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Tabs value={activeTab.toString()} onValueChange={(value) => setActiveTab(parseInt(value))}>
        <TabsList>
          <TabsTrigger value="1">Personal Information</TabsTrigger>
          <TabsTrigger value="2">Pre-screening</TabsTrigger>
          <TabsTrigger value="3">License Information</TabsTrigger>
        </TabsList>

        <TabsContent value="1">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Enter your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...register("firstName", { required: "First name is required" })} />
                  {errors.firstName && <p className="text-red-500">{errors.firstName.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...register("lastName", { required: "Last name is required" })} />
                  {errors.lastName && <p className="text-red-500">{errors.lastName.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input id="middleName" {...register("middleName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickName">Nickname</Label>
                  <Input id="nickName" {...register("nickName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobilePhone">Mobile Phone</Label>
                  <Input id="mobilePhone" {...register("mobilePhone")} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Home Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name="homeAddress.province"
                    control={control}
                    rules={{ required: "Province is required" }}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label htmlFor="homeProvince">Province</Label>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a province" />
                          </SelectTrigger>
                          <SelectContent>
                            {stateData.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.homeAddress?.province && <p className="text-red-500">{errors.homeAddress.province.message as string}</p>}
                      </div>
                    )}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="homeCity">City</Label>
                    <Input id="homeCity" {...register("homeAddress.city", { required: "City is required" })} />
                    {errors.homeAddress?.city && <p className="text-red-500">{errors.homeAddress.city.message as string}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeAddress">Address</Label>
                  <Input id="homeAddress" {...register("homeAddress.address", { required: "Address is required" })} />
                  {errors.homeAddress?.address && <p className="text-red-500">{errors.homeAddress.address.message as string}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isSameAddress"
                  checked={isSameAddress}
                  onCheckedChange={(checked: any) => setValue('isSameAddress', checked)}
                />
                <label
                  htmlFor="isSameAddress"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mailing address is the same as home address
                </label>
              </div>

              {!isSameAddress && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Mailing Address</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                      name="mailAddress.province"
                      control={control}
                      rules={{ required: "Province is required" }}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label htmlFor="mailProvince">Province</Label>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a province" />
                            </SelectTrigger>
                            <SelectContent>
                              {stateData.map((state) => (
                                <SelectItem key={state.value} value={state.value}>
                                  {state.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.mailAddress?.province && <p className="text-red-500">{errors.mailAddress.province.message as string}</p>}
                        </div>
                      )}
                    />
                    <div className="space-y-2">
                      <Label htmlFor="mailCity">City</Label>
                      <Input id="mailCity" {...register("mailAddress.city", { required: "City is required" })} />
                      {errors.mailAddress?.city && <p className="text-red-500">{errors.mailAddress.city.message as string}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mailAddress">Address</Label>
                    <Input id="mailAddress" {...register("mailAddress.address", { required: "Address is required" })} />
                    {errors.mailAddress?.address && <p className="text-red-500">{errors.mailAddress.address.message as string}</p>}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="button" onClick={handleNext}>Next</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="2">
          <Card>
            <CardHeader>
              <CardTitle>Pre-screening Information</CardTitle>
              <CardDescription>Please provide your license and credit information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteLicenseStatus">License Status</Label>
                <Controller
                  name="inviteLicenseStatus"
                  control={control}
                  rules={{ required: "License status is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select license status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No license - studying for exam">No license - studying for exam</SelectItem>
                        <SelectItem value="No license - recently pass exam">No license - recently pass exam</SelectItem>
                        <SelectItem value="License - transfer">License - transfer</SelectItem>
                        <SelectItem value="No intention to get license">No intention to get license</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.inviteLicenseStatus && <p className="text-red-500">{errors.inviteLicenseStatus.message as string}</p>}
              </div>

              {licenseStatus === "No license - recently pass exam" && (
                <div className="space-y-2">
                  <Label htmlFor="inviteExamResults">Upload Exam Results</Label>
                  <Input id="inviteExamResults" type="file" onChange={(e) => handleFileUpload(e, 'inviteExamResults')} />
                </div>
              )}

              {licenseStatus === "License - transfer" && (
                <div className="space-y-2">
                  <Label htmlFor="inviteCurrentLicense">Upload Current License</Label>
                  <Input id="inviteCurrentLicense" type="file" onChange={(e) => handleFileUpload(e, 'inviteCurrentLicense')} />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="inviteCreditRating">Credit Rating</Label>
                <Controller
                  name="inviteCreditRating"
                  control={control}
                  rules={{ required: "Credit rating is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select credit rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Above 650">Above 650</SelectItem>
                        <SelectItem value="Between 650 and 500">Between 650 and 500</SelectItem>
                        <SelectItem value="Below 500">Below 500</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.inviteCreditRating && <p className="text-red-500">{errors.inviteCreditRating.message as string}</p>}
              </div>

              {(creditRating === "Above 650" || creditRating === "Between 650 and 500") && (
                <div className="space-y-2">
                  <Label htmlFor="inviteStandards">Confirm Standards</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inviteStandards"
                      {...register("inviteStandards")}
                    />
                    <label
                      htmlFor="inviteStandards"
                      className="text-sm font-medium leading-none"
                    >
                      I confirm that:
                    </label>
                  </div>
                  <ul className="list-disc pl-5 text-sm">
                    <li>I do not have outstanding collection accounts</li>
                    <li>I am not indebted to any other MGA</li>
                    <li>I have no history of bankruptcy or consumer proposals</li>
                    <li>I have no pending or unresolved criminal charges</li>
                  </ul>
                </div>
              )}

              {licenseStatus === "License - transfer" && (creditRating === "Above 650" || creditRating === "Between 650 and 500") && (
                <div className="space-y-2">
                  <Label htmlFor="advisorDuration">Years as Advisor</Label>
                  <Input
                    id="advisorDuration"
                    type="number"
                    {...register("advisorDuration", { min: 0, valueAsNumber: true })}
                  />
                  {errors.advisorDuration && <p className="text-red-500">{errors.advisorDuration.message as string}</p>}
                </div>
              )}

              { Number(watch("advisorDuration")) > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="previousCompany">Previous Company</Label>
                  <Input
                    id="previousCompany"
                    {...register("previousCompany")}
                    placeholder="e.g. EAU CLAIRE PARTNERS"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" onClick={handlePrevious}>Previous</Button>
              <Button type="button" onClick={handleNext}>Next</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="3">
          <Card>
            <CardHeader>
              <CardTitle>License Information</CardTitle>
              <CardDescription>Please provide your license details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add license information fields here */}
              <p>License information form fields will be added here based on specific requirements.</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" onClick={handlePrevious}>Previous</Button>
              <Button type="submit">Submit Application</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>{dialogContent.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => {
              setShowDialog(false);
              if (dialogContent.redirect) {
                router.push(dialogContent.redirect);
              }
            }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default Applying;                    
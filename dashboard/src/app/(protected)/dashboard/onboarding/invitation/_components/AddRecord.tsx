import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { State } from 'country-state-city';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { createInvitation } from '../_actions/invitation';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AddRecord = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const stateData = State.getStatesOfCountry('CA').map(state => ({
    value: state.isoCode,
    displayValue: state.name,
  }));

  const [formData, setFormData] = useState({
    inviteName: '',
    inviteEmail: '',
    invitePhoneNo: '',
    inviteHomeProvince: '',
    inviteLicenseStatus: '',
    inviter: session?.user?.data?.id
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.data?.profile == null) {
      toast.error('Please complete your profile first!');
      router.push('/dashboard/profile/createprofile');
    }
  }, [session, router]);

  const licenseStatusOptions = [
    "No license - studying for exam",
    "No license - recently pass exam",
    "License - transfer",
    "No intention to get license"
  ];

  const formatPhoneNumber = (value: string) => {
    if (!value || value === '+1 (' || value === '+1') return value;
    if (value.length === 1) {
      value = '+1 (' + value;
    } else {
      value = '+1 (' + value.replace(/[^\d]/g, '').slice(1);
    }
    const phoneNumberDigits = value.replace(/[^\d]/g, '').slice(1);
    if (phoneNumberDigits.length < 4) return value;
    if (phoneNumberDigits.length < 7) return `+1 (${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3)}`;
    return `+1 (${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3, 6)}-${phoneNumberDigits.slice(6, 10)}`;
  };

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = (phone: string) => /^(\+1\s?)?(\(\d{3}\)|\d{3})[-\s]?\d{3}[-\s]?\d{4}$/.test(phone);

  const handleChange = (name: string, value: string) => {
    if (name === 'invitePhoneNo') {
      value = formatPhoneNumber(value);
    }
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));
    setError(null); // Clear error when user makes changes
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inviterId = session?.user?.data?.id;
    const newFormData = { ...formData, inviter: inviterId };
    const result: any = await createInvitation(newFormData);
    if (result.status === 200) {
      toast.success('Invitation sent successfully!');
      onClose();
    } else {
      if (result.errorMessage === "This attribute must be unique") {
        setError('This email has already been invited.');
      } else if (result.error && result.error.details && result.error.details.errors) {
        const errorMessage = result.error.details.errors[0]?.message || 'An error occurred';
        setError(errorMessage);
      } else {
        setError('Failed to send invitation. Please try again later.');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitation Form</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="inviteName">Name of invitee</Label>
            <Input
              id="inviteName"
              required
              value={formData.inviteName}
              onChange={(e) => handleChange('inviteName', e.target.value)}
              placeholder="Enter first name"
            />
          </div>
          
          {formData.inviteName && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Label htmlFor="inviteEmail">Email</Label>
              <Input
                id="inviteEmail"
                required
                type="email"
                value={formData.inviteEmail}
                onChange={(e) => handleChange('inviteEmail', e.target.value)}
                placeholder="Enter email address"
              />
            </motion.div>
          )}

          {isEmailValid(formData.inviteEmail) && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Label htmlFor="invitePhoneNo">Phone Number</Label>
              <Input
                id="invitePhoneNo"
                required
                value={formData.invitePhoneNo}
                onChange={(e) => handleChange('invitePhoneNo', e.target.value)}
                placeholder="+1 (XXX) XXX-XXXX"
              />
            </motion.div>
          )}

          {isPhoneValid(formData.invitePhoneNo) && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Label htmlFor="inviteHomeProvince">Home Province/Territory</Label>
              <div id="inviteHomeProvince">
                <Select
                  value={formData.inviteHomeProvince}
                  onValueChange={(value) => handleChange('inviteHomeProvince', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Province/Territory" />
                  </SelectTrigger>
                  <SelectContent className="z-9999">
                    {stateData.map((province) => (
                      <SelectItem key={province.value} value={province.value}>
                        {province.displayValue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {formData.inviteHomeProvince && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Label htmlFor="inviteLicenseStatus">License Status</Label>
              <div id="inviteLicenseStatus">
                <Select
                  value={formData.inviteLicenseStatus}
                  onValueChange={(value) => handleChange('inviteLicenseStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select License Status" />
                  </SelectTrigger>
                  <SelectContent className="z-9999">
                    {licenseStatusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </CardContent>
        
        <CardFooter>
          <motion.div
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {formData.inviteLicenseStatus && (
              <Button className="w-full" type="submit">
                Invite to join Eau Claire One
              </Button>
            )}
          </motion.div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddRecord;
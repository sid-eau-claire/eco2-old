'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOKRSettings, updateOKRSettings } from '../_actions/settings';

interface OKRSetting {
  year: number;
  month: number;
  allowedSettingTarget: boolean;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const OKRSettings: React.FC = () => {
  const [settings, setSettings] = useState<OKRSetting[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await getOKRSettings();
        console.log('OKR setting response', response);

        if (response && response.data && response.data.OKRMonthTargetSettings) {
          // The settings are directly in response.data.OKRMonthTargetSettings
          setSettings(response.data.OKRMonthTargetSettings);
        } else {
          console.log('Unexpected response structure:', response);
          setSettings([]);
        }
      } catch (error) {
        console.error('Failed to fetch OKR settings:', error);
        setSettings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleYearChange = (year: string) => {
    setSelectedYear(parseInt(year));
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(months.indexOf(month));
  };

  const handleAllowedSettingTargetChange = (allowed: boolean) => {
    const existingSettingIndex = settings.findIndex(
      s => s.year === selectedYear && s.month === selectedMonth
    );

    if (existingSettingIndex !== -1) {
      const newSettings = [...settings];
      newSettings[existingSettingIndex].allowedSettingTarget = allowed;
      setSettings(newSettings);
    } else {
      setSettings([...settings, { year: selectedYear, month: selectedMonth, allowedSettingTarget: allowed }]);
    }
  };

  const handleRemoveSetting = (year: number, month: number) => {
    setSettings(settings.filter(s => !(s.year === year && s.month === month)));
  };

  const handleSave = async () => {
    try {
      await updateOKRSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save OKR settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const currentSetting = settings.find(s => s.year === selectedYear && s.month === selectedMonth);
  const isAllowed = currentSetting ? currentSetting.allowedSettingTarget : false;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>OKR Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="year-select">Year</Label>
            <Select onValueChange={handleYearChange} value={selectedYear.toString()}>
              <SelectTrigger id="year-select">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(5)].map((_, i) => {
                  const year = (new Date().getFullYear() + i - 2).toString();
                  return (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="month-select">Month</Label>
            <Select onValueChange={handleMonthChange} value={months[selectedMonth]}>
              <SelectTrigger id="month-select">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="allowed-setting-target"
            checked={isAllowed}
            onCheckedChange={handleAllowedSettingTargetChange}
          />
          <Label htmlFor="allowed-setting-target">
            Allow setting target for {months[selectedMonth]} {selectedYear}
          </Label>
        </div>
        {/* <Button className="mt-6 w-full" onClick={handleSave}>Save Settings</Button> */}

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Allowed Settings</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Allowed</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings
                .sort((a, b) => a.year - b.year || a.month - b.month)
                .map((setting, index) => (
                  <TableRow key={index}>
                    <TableCell>{setting.year}</TableCell>
                    <TableCell>{months[setting.month]}</TableCell>
                    <TableCell>{setting.allowedSettingTarget ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemoveSetting(setting.year, setting.month)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        <Button className="mt-6 w-full" onClick={handleSave}>Save Settings</Button>
        
      </CardContent>
    </Card>
  );
};

export default OKRSettings;
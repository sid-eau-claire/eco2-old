'use client'
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Qualifications: React.FC = () => {
  return (
    <Card className="h-full bg-red-800 text-white">
      <CardHeader>
        <CardTitle className="text-2xl">RED CARPET GALA</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl mb-2">Qualifications</h3>
        <p>Success Round Table 2024</p>
      </CardContent>
    </Card>
  );
};

export default Qualifications;
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { User, Briefcase, Calendar, Phone } from 'lucide-react';

type ClientOverviewProps = {
  client: {
    firstName: string;
    lastName: string;
    occupation: string;
    dateOfBirth: string;
    homePhone: string;
  };
};

const ClientOverview: React.FC<any> = ({ client }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2" />
          Client Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span className="font-semibold">{client.firstName} {client.lastName}</span>
          </p>
          <p className="flex items-center">
            <Briefcase className="mr-2 h-4 w-4" />
            <span>{client.occupation}</span>
          </p>
          <p className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{new Date(client.dateOfBirth).toLocaleDateString()}</span>
          </p>
          <p className="flex items-center">
            <Phone className="mr-2 h-4 w-4" />
            <span>{client.homePhone}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientOverview;
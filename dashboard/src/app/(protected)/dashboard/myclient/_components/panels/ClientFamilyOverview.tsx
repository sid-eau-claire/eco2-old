import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Users, User } from 'lucide-react';

type ClientFamilyOverviewProps = {
  cases: any[];
};

const ClientFamilyOverview: React.FC<ClientFamilyOverviewProps> = ({ cases }) => {
  const familyMembers = React.useMemo(() => {
    const members = new Set();
    cases.forEach(c => {
      c.applicants.forEach((a: any) => {
        members.add(`${a.firstName} ${a.lastName}`);
      });
    });
    return Array.from(members);
  }, [cases]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2" />
          Family Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {familyMembers.map((member, index) => (
            <li key={index} className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>{member as any}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ClientFamilyOverview;
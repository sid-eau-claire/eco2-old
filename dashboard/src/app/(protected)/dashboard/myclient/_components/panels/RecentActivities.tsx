import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { Client} from './../types'

type Activity = {
  type: string;
  startDate: string;
  notes: string;
};

type Opportunity = {
  activities: Activity[];
};

// type Client = {
//   activities?: Activity[];
// };

type RecentActivitiesProps = {
  opportunities: Opportunity[];
  client?: Client;
};

const RecentActivities: React.FC<RecentActivitiesProps> = ({ opportunities, client }) => {
  // Consolidate activities from opportunities and client
  const allActivities = [
    ...opportunities.flatMap(o => o.activities),
    ...(client?.activities || [])
  ];

  // Sort activities by start date in descending order
  const sortedActivities = allActivities
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5);  // Get the 5 most recent activities

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {sortedActivities.map((activity, index) => (
            <li key={index} className="flex items-start">
              <Clock className="mr-2 h-4 w-4 mt-1" />
              <div>
                <p className="font-medium">{activity.type}</p>
                <p className="text-sm text-gray-500">
                  {new Date(activity.startDate).toLocaleString()}
                </p>
                <p className="text-sm">{activity.notes}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
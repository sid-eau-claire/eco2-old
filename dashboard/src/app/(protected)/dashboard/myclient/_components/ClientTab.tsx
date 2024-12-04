import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FaUserCircle, FaClipboardList, FaNetworkWired } from 'react-icons/fa'
import { TabView, Tab } from '@/components/TabView'
import ClientDetails from './ClientDetails'
import ClientActivity from './ClientActivity'
import ClientRelated from './ClientRelated'
import ClientOverview from './panels/ClientOverview'
import BusinessMetrics from './panels/BusinessMetrics'
import CaseSummary from './panels/CaseSummary'
import OpportunityTracker from './panels/OpportunityTracker'
import RecentActivities from './panels/RecentActivities'
import ProductMix from './panels/ProductMix'
import ClientFamilyOverview from './panels/ClientFamilyOverview'
import PerformanceIndicators from './panels/PerformanceIndicators'

export default function ClientTab({ client, provinces, opportunities, newCases, onUpdateSuccess, setRefresh, profileId, currentMetrics }: 
  { client:any , provinces:any, opportunities:any, newCases:any, onUpdateSuccess:any, setRefresh:any, profileId:any, currentMetrics:any }
) {
  const [activeTab, setActiveTab] = useState(1);

  const ClientInfoTab = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FaUserCircle className="mr-2" />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh]">
            <ClientDetails 
              client={client} 
              provinces={provinces} 
              onUpdateSuccess={onUpdateSuccess}
            />
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FaClipboardList className="mr-2" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh]">
            <ClientActivity client={client} opportunities={opportunities} setRefresh={setRefresh} />
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FaNetworkWired className="mr-2" />
            Related
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh]">
            <ClientRelated 
              client={client} 
              opportunities={opportunities} 
              newCases={newCases}
              profileId={profileId}
            />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const BusinessInsightTab = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <ClientOverview client={client} />
      <BusinessMetrics cases={newCases} />
      <CaseSummary cases={newCases} />
      <OpportunityTracker opportunities={opportunities} />
      <RecentActivities opportunities={opportunities} client={client}/>
      <ProductMix cases={newCases} />
      <ClientFamilyOverview cases={newCases} />
      <PerformanceIndicators currentMetrics={currentMetrics} />
    </div>
  );

  const tabs = [
    {
      id: 1,
      title: 'Client Information',
      // Component: <Tab><p>hello</p></Tab>,
      Component: <Tab><ClientInfoTab /></Tab>,
      accessControl: { roles: ['Superuser', 'Advisor', 'Poweruser'], appRoles: [] }
    },
    {
      id: 2,
      title: 'Business Insight',
      Component: <Tab><BusinessInsightTab /></Tab>,
      accessControl: { roles: ['Superuser', 'Advisor', 'Poweruser'], appRoles: [] }
    },
  ];

  return (
    <TabView menu={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
  );
}
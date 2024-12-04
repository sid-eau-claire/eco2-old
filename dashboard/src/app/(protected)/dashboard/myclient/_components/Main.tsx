'use client'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import ClientInfo from "./ClientInfo"
import { useState, useEffect } from "react"
import { PageContainer } from "@/components/Containers"
import { Client } from './types'
import { getClient } from "../_actions/client"
import ClientList from './ClientList'
import UpComingBirthdaysList from './panels/UpComingBirthdaysList'
import ClientAgeDistribution from './panels/ClientAgeDistribution'
import OccupationAnalysis from './panels/OccupationAnalysis'
import GeographicDistribution from './panels/GeographicDistribution'
import ClientAcquisitionTimeline from './panels/ClientAcquisitionTimeline';
import ContactMethodPreference from './panels/ContactMethodPreference';
import NetWorthOverview from './panels/NetWorthOverview';
import ClientTypeDistribution from './panels/ClientTypeDistribution';
import SmokingStatusOverview from './panels/SmokingStatusOverview';
import ClientRetentionDashboard from './panels/ClientRententionDashboard';
import { TabView, Tab } from '@/components/TabView'
import { Loader } from '@/components/Common'

export default function Main({ profileId }: { profileId: string }) {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)
  const [activeTab, setActiveTab] = useState(1);
  const [refreshTab, setRefreshTab] = useState(1);
  const switchTab = (tabIndex: number) => { setActiveTab(tabIndex); }

  const Panel = () => (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="h-[400px]"><UpComingBirthdaysList clients={clients} /></div>
      <div className="h-[400px]"><ClientAgeDistribution clients={clients} /></div>
      <div className="h-[400px]"><OccupationAnalysis clients={clients} /></div>
      <div className="h-[400px]"><GeographicDistribution clients={clients} /></div>
      <div className="h-[400px]"><ClientAcquisitionTimeline clients={clients} /></div>
      <div className="h-[400px]"><ContactMethodPreference clients={clients} /></div>
      <div className="h-[400px]"><NetWorthOverview clients={clients} /></div>
      <div className="h-[400px]"><ClientTypeDistribution clients={clients} /></div>
      <div className="h-[400px]"><SmokingStatusOverview clients={clients} /></div>
      <div className="h-[400px]"><ClientRetentionDashboard clients={clients} /></div>
    </div>
  );

  const tabs = [
    {
      id: 1,
      title: 'Client contact',
      Component: <Tab><ClientList clients={clients} setSelectedPerson={setSelectedPerson} setRefresh={setRefresh} profileId={profileId} /></Tab>,
      accessControl: { roles: ['Superuser', 'Advisor', 'Poweruser'], appRoles: [] }
    },
    {
      id: 2,
      title: 'Business Insight',
      Component: <Tab><Panel /></Tab>,
      accessControl: { roles: ['Superuser', 'Advisor', 'Poweruser'], appRoles: [] }
    },
  ];

  useEffect(() => {
    async function fetchClients() {
      try {
        const fetchedClients = await getClient(profileId)
        setClients(fetchedClients)
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [profileId, refresh])

  return (
    <PageContainer pageName="My Clients">
      <TabView menu={tabs} activeTab={activeTab} setActiveTab={setActiveTab}/>
      <Sheet open={!!selectedPerson} onOpenChange={(open) => !open && setSelectedPerson(null)}>
        <SheetContent side="right" className="w-fit md:min-w-[90vw] min-w-full pt-[0.8rem] h-full overflow-y-auto">
          <SheetTitle>Person Details</SheetTitle>
          <SheetDescription>
            Detailed information about the selected person.
          </SheetDescription>
          {selectedPerson && (
            <ClientInfo personId={selectedPerson} onClose={() => setSelectedPerson(null)} profileId={profileId} />
          )}
        </SheetContent>
      </Sheet>
    </PageContainer>
  )
}

'use client'
import React, {useEffect, useState}from 'react'
import {TabView, Tab} from '@/components/TabView'
import { PageContainer } from '@/components/Containers'
import Personal from './Personal'
import Team from './Team'
import OKRDashboard from './OKRDashboard';
import OKRTeam from './OKRTeam';
import Overview from './Overview'
import {accessWithAuth} from '@/lib/isAuth'
import { set } from 'js-cookie'

const Performance =  ({profileId}:{profileId: string}) => {
  const [rankValue, setRankValue] = useState<any>(null)
  useEffect(() => {
    const fetchRank = async () => {
      const session = await accessWithAuth()
      setRankValue(session?.user?.data?.profile?.rankId?.rankValue)
    }
    fetchRank()
  }, [])
  const [activeTab, setActiveTab] = useState(1);
  const [refreshTab, setRefreshTab] = useState(1);
  const switchTab = (tabIndex: number) => {setActiveTab(tabIndex);}
  const tabs = [
    { id: 1, title: 'Overview', 
      Component: (<Tab><Overview profileId={profileId}/></Tab>),
      accessControl: {roles: ['Superuser', 'Advisor', 'Poweruser'], appRoles: []}
    },    
    { id: 2, title: 'Personal KPI', 
      Component: (<Tab><Personal profileId={profileId}/></Tab>),
      accessControl: {roles: ['Superuser', 'Advisor', 'Poweruser'], appRoles: []}
    },
    { id: 3, title: 'Team KPI', 
      Component: (<Tab><Team profileId={profileId}/></Tab>),
      accessControl: {roles: ['Superuser', 'Advisor', 'Poweruser'], appRoles: []}
    },
    { id: 4, title: 'OKR Monitoring', 
      Component: (<Tab><OKRDashboard advisor={Number(profileId)}/></Tab>),
      accessControl: {roles: ['Superuser', 'Advisor', 'Poweruser'], appRoles: []}
    },
  ];
  // If the user is managing partner
  if (rankValue == 2000) { 
    tabs.push(
      { id: 5, title: 'OKR Approval', 
        Component: (<Tab><OKRTeam/></Tab>),
        accessControl: {roles: ['Superuser', 'Advisor', 'Poweruser'], appRoles: []}
      }
    )
  }
  // console.log('rankValue', rankValue) 
  return (
    <>
      <PageContainer pageName='Performance'>
        <TabView menu={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </PageContainer>
    </>
  )
}

export default Performance
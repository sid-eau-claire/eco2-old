'use client'
import React, {useState}from 'react'
import {TabView, Tab} from '@/components/TabView'
import { PageContainer } from '@/components/Containers'
import  CommissionDistribution  from './CommissionDistribution'
import LoadCitsClientData from './LoadCitsClientData'
import {Notification} from './Notification'
import OKRSettings from './OKRSettings'
import { access } from 'fs'


const commission = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [refreshTab, setRefreshTab] = useState(1);
  const switchTab = (tabIndex: number) => {setActiveTab(tabIndex);} 
  const tabs = [
    // { id: 1, title: 'Just In', Component: (<Tab><JustIn refreshTab={refreshTab} setRefreshTab={setRefreshTab}/></Tab>),},
    { id: 1, title: 'Commission Distribution', 
      Component: (<Tab><CommissionDistribution/></Tab>),
      accessControl: {roles: ['Superuser']}
    },
    // { id: 2, title: 'Menu', 
    //   Component: (<Tab><div>Hello</div></Tab>),
    //   accessControl: {roles: ['Superuser']}
    // },
    { id: 3, title: 'CITS client', 
      Component: (<Tab><LoadCitsClientData/></Tab>),
      accessControl: {roles: ['Superuser']}
    },
    { id: 4, title: 'OKR Target Setting', 
      Component: (<Tab><OKRSettings/></Tab>),
      accessControl: {roles: ['Superuser']}
    },
    { id: 5, title: 'Notification', 
      Component: (<Tab><Notification/></Tab>),
      accessControl: {roles: ['Superuser']}
    },

  ];  
  return (
    <>
      <PageContainer pageName='Administration Settings'>
        <TabView menu={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </PageContainer>
    </>
  )
}

export default commission
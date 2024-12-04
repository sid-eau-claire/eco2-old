'use client'
import React, {useState}from 'react'
import {TabView, Tab} from '@/components/TabView'
import { PageContainer } from '@/components/Containers'
import { access } from 'fs'
import ListRecord from './ListRecord'
import ConfirmSettle from './ConfirmSettle'

const commission = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [refreshTab, setRefreshTab] = useState(1);
  const switchTab = (tabIndex: number) => {setActiveTab(tabIndex);} 
  const tabs = [
    { 
      id: 1, 
      title: 'Pending Review', 
      Component: <Tab><ListRecord status="Pending Review" refreshTab={refreshTab} setRefreshTab={setRefreshTab}/></Tab>,
      accessControl: { roles: ['Superuser', 'InternalStaff'], appRoles: ['newcaseEdit'] } 
    },
    { 
      id: 2, 
      title: 'UW/Processing', 
      Component: <Tab><ListRecord status="UW/Processing" refreshTab={refreshTab} setRefreshTab={setRefreshTab}/></Tab>,
      accessControl: { roles: ['Superuser', 'InternalStaff'], appRoles: ['newcaseEdit'] } 
    },
    { 
      id: 3, 
      title: 'UW/Approved', 
      Component: <Tab><ListRecord status="UW/Approved" refreshTab={refreshTab} setRefreshTab={setRefreshTab}/></Tab>,
      accessControl: { roles: ['Superuser', 'InternalStaff'], appRoles: ['newcaseEdit'] } 
    },
    { 
      id: 4, 
      title: 'Pending Pay', 
      Component: <Tab><ListRecord status="Pending Pay" refreshTab={refreshTab} setRefreshTab={setRefreshTab}/></Tab>,
      accessControl: { roles: ['Superuser', 'InternalStaff'], appRoles: ['newcaseEdit'] } 
    },
    { 
      id: 5, 
      title: 'Confirm Settle', 
      Component: <Tab><ConfirmSettle status='Paid Settled' refreshTab={refreshTab} setRefreshTab={setRefreshTab}/></Tab>,
      accessControl: { roles: ['Superuser', 'InternalStaff'], appRoles: ['newcaseEdit'] } 
    },    
    { 
      id: 6, 
      title: 'Paid & Settled', 
      Component: <Tab><ListRecord status='Paid Settled' refreshTab={refreshTab} setRefreshTab={setRefreshTab}/></Tab>,
      accessControl: { roles: ['Superuser', 'InternalStaff'], appRoles: ['newcaseEdit'] } 
    },
    { 
      id: 7, 
      title: 'NPW', 
      Component: <Tab><ListRecord status="NPW" refreshTab={refreshTab} setRefreshTab={setRefreshTab}/></Tab>,
      accessControl: { roles: ['Superuser', 'InternalStaff'], appRoles: ['newcaseEdit'] } 
    },
    { 
      id: 8, 
      title: 'Declined/Postponed', 
      Component: <Tab><ListRecord status="Declined/Postponed" refreshTab={refreshTab} setRefreshTab={setRefreshTab}/></Tab>,
      accessControl: { roles: ['Superuser', 'InternalStaff'], appRoles: ['newcaseEdit'] } 
    },
    { 
      id: 9, 
      title: 'Lapse/Withdrawn', 
      Component: <Tab><ListRecord status="Lapse/Withdrawn" refreshTab={refreshTab} setRefreshTab={setRefreshTab}/></Tab>,
      accessControl: { roles: ['Superuser', 'InternalStaff'], appRoles: ['newcaseEdit'] } 
    },
    { 
      id: 10, 
      title: 'Unknown', 
      Component: <Tab><ListRecord status="Unknown" refreshTab={refreshTab} setRefreshTab={setRefreshTab}/></Tab>,
      accessControl: { roles: ['Superuser', 'InternalStaff'], appRoles: ['newcaseEdit'] } 
    }
  ];
  return (
    <>
      <PageContainer pageName='Business Case'>
        <TabView menu={tabs} activeTab={activeTab} setActiveTab={setActiveTab} 
          // className='w-full'
        />
      </PageContainer>
    </>
  )
}

export default commission
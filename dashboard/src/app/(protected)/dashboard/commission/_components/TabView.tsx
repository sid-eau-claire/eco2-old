'use client'
import React, {useState}from 'react'
import {TabView, Tab} from '@/components/TabView'
import { PageContainer } from '@/components/Containers'
import Payroll from './Payroll'
import ListCommission from './ListCommission'
import JustIn from './JustIn'
import CurrentPay from './CurrentPay'
import PaymentTable from './PaymentTable'
import CompletedRecords from './CompletedRecords'
import { access } from 'fs'
import NegativeBalance from './NegativeBalance'
import EscrowAccounts from './EscrowAccounts'
import Issue from './Issue'

const commission = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [refreshTab, setRefreshTab] = useState(1);
  const switchTab = (tabIndex: number) => {setActiveTab(tabIndex);} 
  const tabs = [
    { id: 1, title: 'Just In', 
      Component: (<Tab><JustIn refreshTab={refreshTab} setRefreshTab={setRefreshTab}/></Tab>),
      accessControl: {roles: ['Superuser', 'InternalStaff'], appRoles: ['commissionEdit']}
    },
    { id: 2, title: 'Upcoming Run', 
      Component: (<Tab><CurrentPay refreshTab={refreshTab} setRefreshTab={setRefreshTab}/></Tab>),
      accessControl: {roles: ['Superuser', 'InternalStaff'], appRoles: ['commissionEdit']}
    },
    { id: 3, title: 'Payroll', 
      Component: (<Tab><Payroll refreshTab={refreshTab} setRefreshTab={setRefreshTab}/></Tab>),
      accessControl: {roles: ['Superuser', 'InternalStaff'], appRoles: ['payrollEdit']}
    },
    { id: 4, title: 'Completed Records', 
      Component: (<Tab><CompletedRecords refreshTab={refreshTab} setRefreshTab={setRefreshTab} /></Tab>),
      accessControl: {roles: ['Superuser', 'InternalStaff'], appRoles: ['commissionEdit']}
    },
    { id: 5, title: 'Issues', 
      Component: (<Tab><Issue refreshTab={refreshTab} setRefreshTab={setRefreshTab} /></Tab>),
      accessControl: {roles: ['Superuser', 'InternalStaff'], appRoles: ['commissionEdit']}
    },    
    { id: 6, title: 'Negative Balance', 
      Component: (<Tab><NegativeBalance refreshTab={refreshTab} setRefreshTab={setRefreshTab} /></Tab>),
      accessControl: {roles: ['Superuser', 'InternalStaff'], appRoles: ['payrollEdit']}
    },
    { id: 7, title: 'Escrow', 
      Component: (<Tab><EscrowAccounts refreshTab={refreshTab} setRefreshTab={setRefreshTab} /></Tab>),
      accessControl: {roles: ['Superuser', 'InternalStaff'], appRoles: ['payrollEdit']}
    },
    // Add more tabs as needed refreshData={refreshData} setRefreshData={setRefreshData}
  ];  
  return (
    <>
      <PageContainer pageName='Commission'>
        <TabView menu={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </PageContainer>
    </>
  )
}

export default commission
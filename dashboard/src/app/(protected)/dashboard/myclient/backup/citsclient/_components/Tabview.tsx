'use client'
import React,{useState} from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { PageContainer } from "@/components/Containers";
import CitsClientList from "./CitsClientList";
import ConsolidatedClientList from './ConsolidatedClientList'
import { TabView, Tab } from '@/components/TabView/TabView';
import { access } from "fs";

const Tabview = ({profileId}: {profileId: string}) => {
  const [activeTab, setActiveTab] = useState(1); // Assuming tab IDs start from 1

  // Define the content for each tab
  const tabs = [
    { id: 1, title: 'Consolidated List', 
      Component: (<Tab><ConsolidatedClientList profileId={profileId}/> </Tab>),
      accessControl: {roles: ['Advisor','Superuser', 'Poweruser']} 
    },
    { id: 2, title: 'CITS clients', 
      Component: (<Tab><CitsClientList profileId={profileId}/></Tab>),
      accessControl: {roles: ['Advisor','Superuser', 'Poweruser']} 
    },
    { id: 3, title: 'Existing investment', 
      Component: (<Tab><div>Tab 2 ipsum dolor sit amet, consectetur adipiscing elit...</div></Tab>),
      accessControl: {roles: ['Advisor']}
    },
    // { id: 3, title: 'Contact only', 
    //   Component: (<Tab>{contacts != undefined && (<ClientList contacts={contacts} tags={tags} />)}</Tab>),
    //   accessControl: {roles: ['Advisor']}
    // },
  ];
  

  return (
    <>
      <PageContainer pageName="My Clients">
        <TabView menu={tabs} activeTab={activeTab} />
      </PageContainer>
    </>
  );
};

export default Tabview

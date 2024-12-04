import ClientList from "../citsclient/_components/CitsClientList";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import  {query}  from '@/lib/db';
import CitsClientList from "../citsclient/_components/CitsClient";
import TabView from "../citsclient/_components/Tabview";
import {normalize } from '@/lib/format'
import {canAccess} from '@/lib/isAuth'
import {redirect} from 'next/navigation'

type request = {
  searchParams: {
    pageLimit: number;
    advisor: number;
  },
  params: {
    advisor: string;
  }
}

const advisor = async (request: request) => {
  const profileId = request?.params?.advisor;

  if (!await canAccess(['Superuser', 'Advisor', 'Poweruser'], )) {
    console.log('You are not allowed to access')
    redirect('/dashboard/error')
  }

  if (!await canAccess(['Advisor', 'Poweruser'],[], Number(profileId))) {
    console.log('You are not allowed to access')
    redirect('/dashboard/error')
  }


  return (
    <>
        <TabView profileId={profileId}/>
    </>
  );
};

export default advisor;

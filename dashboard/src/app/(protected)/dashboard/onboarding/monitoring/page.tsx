
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableOne from "./TableOne";
import axios from "axios";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Tables Page | Next.js E-commerce Dashboard Template",
  description: "This is Tables page for TailAdmin Next.js",
  // other metadata
};
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"



const TablesPage = async () => {
  let result = null;
  const session = await getServerSession(authOptions as any)
  try {
    const inviter = (session as { user: { data: { id: string } } })?.user?.data?.id;
    result = await axios.get(`${process.env.STRAPI_BACKEND_URL}/api/invitations?populate=*&filters[inviter][id][$eq]=${inviter}`,{
      headers: {
        'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
      }
    })
    console.log('result', result.data.data)
  } catch (error) {
    console.log('error', error)
  }

  return (
    <>
      <Breadcrumb pageName="Onboarding Status" />

      <div className="flex flex-col gap-10">
        <TableOne data={result?.data?.data} />
      </div>
    </>
  );
};

export default TablesPage;

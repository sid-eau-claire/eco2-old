import TabView from '../_components/TabView'
import { canAccess } from '@/lib/isAuth'
import { redirect } from 'next/navigation'

const page = async ({ params }: { params: { advisor: string } }) => {
  const profileId = params.advisor;
  if (!canAccess(['Superuser', 'Advisor', 'Poweruser'])) {
    redirect('/dashboard/error');
  }
  if (!canAccess(['Advisor', 'Poweruser'],[], Number(params?.advisor))) {
    redirect('/dashboard/error');
  }  
  
  return (
    <>
      {/* <p>hello</p> */}
      <TabView profileId={profileId}/>
    </>
  )
}

export default page

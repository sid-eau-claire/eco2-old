import React from 'react'
import ListRecord from '../../_components/ListRecord'
import { canAccess, accessWithAuth } from '@/lib/isAuth'
import { redirect } from 'next/navigation'

const page = async ({ params }: { params: { advisor: string, cases: string } }) => {
  const advisor = params.advisor;
  // Decode and parse the `cases` string into an array of numbers
  const cases = params.cases ? decodeURIComponent(params.cases) : '';
  let caseArray = [];
  
  // if (cases.startsWith('[') && cases.endsWith(']')) {
  if (cases)  {
    const newCases = '[' + cases + ']';
    try {
      caseArray = JSON.parse(newCases);
    } catch (error) {
      console.error("Failed to parse case IDs:", error);
      redirect('/dashboard/error');
    }
  }

  const session = await accessWithAuth();
  if (!canAccess(['Superuser', 'Advisor', 'Poweruser'],[], Number(advisor))) {
    redirect('/dashboard/error'); 
  }
  console.log('cases', cases); // This should log the string '[1, 2]
  console.log('caseArray', caseArray); // This should now log the array [1, 2]
  console.log('typeof caseArray', typeof caseArray); // This should log 'object'

  return (
    <>
      <ListRecord advisor={advisor} session={session} cases={caseArray} />
      {/* <AddRecord /> */}
    </>
  )
}

export default page

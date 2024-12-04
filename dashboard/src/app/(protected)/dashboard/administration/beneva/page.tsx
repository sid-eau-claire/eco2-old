// import React from 'react'
// import { parseStringPromise } from 'xml2js';
// import fs from 'fs';
// import path from 'path';


// const page = async () => {
//   // Assuming your XML data is stored in a file. Adjust the path as needed.
//   const xmlFilePath = path.resolve('./src/app/dashboard/silo/beneva', 'pending.xml');
//   const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');

//   try {
//     const result = await parseStringPromise(xmlData, { mergeAttrs: true, explicitArray: false });
//     // Extract and return the data you're interested in
//     const policyData = result.TXLife.TXLifeRequest.OLifE.Holding.map((holding: { Policy: { Life: { Coverage: any[]; }; }; }) => ({
//       ...holding.Policy,
//       CurrentAmt: holding.Policy.Life.Coverage.map((coverage: { CurrentAmt: any; }) => coverage.CurrentAmt),
//     }));
//     const partyData = result.TXLife.TXLifeRequest.OLifE.Party;
//     const relationData = result.TXLife.TXLifeRequest.OLifE.Relation;

//     console.log({ policyData, partyData, relationData });
//   } catch (err) {
//     console.error(err);
//     console.log({ error: 'Failed to parse XML data' });
//   }  
//   return (
//     <div>page</div>
//   )
// }

// export default page

import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page

'use server'
export const getRanks = async () => {
  try { 
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/ranks?filters[agencyCommissionPercentage][$gt]=0`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.STRAPI_TOKEN,
        },
      } 
    )
    const data = await response.json();
    console.log(data)
    const ranks: any[] = [];
    data.data.map((rank: any) => (
      ranks.push({
      id: rank.id,
      name: rank.attributes.name,
      agencyCommissionPercentage: rank.attributes.agencyCommissionPercentage,
    })))
    return ranks
    // Set default rank if ranks are successfully fetched
  } catch (error) {
    console.error('Error fetching ranks:', error);
  }
  return []
}
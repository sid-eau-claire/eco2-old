
import axios from "axios";
import { strapiFetch } from "./strapi";

export const findHierarchyPath = async ( parentId, childId)  => {
  let networkData = [];
  let start = 0;
  const limit = 25; // Adjust based on your API's max limit if needed
  let fetched = 0;

  do {
    // const response = await axios.get(`${process.env.STRAPI_BACKEND_URL}/api/networks?populate=*`, {
    const response = await axios.get(`${process.env.STRAPI_BACKEND_URL}/api/networks?populate[childId][populate][0]=rankId&populate[parentId][populate][0]=rankId`, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
      },
      params: {
        pagination: {
          start: start,
          limit: limit,
        },
      },
    });
    const networks = response.data.data;
    networkData = [...networkData, ...networks];
    fetched = networks.length;
    start += limit;
  } while (fetched === limit);
  // console.log('here')
  // console.log(networkData)
  // console.log(networkData[0])
  // console.log(networkData[0].attributes.childId)
  // console.log(networkData[0].attributes.parentId)
  // console.log('there')

  const buildParentChildMap = (data) => {
    const map = {};
    data.forEach((item) => {
      const { parentId, childId } = item.attributes;
      if (parentId && childId) {
        const parentIdValue = parentId?.data?.id;
        const childIdValue = childId?.data?.id;
        if (!map[parentIdValue]) {
          map[parentIdValue] = [];
        }
        map[parentIdValue].push(childIdValue);
      }
    });
    return map;
  };

  // Helper function to search for childId in the hierarchy
  const searchHierarchy = (map, currentId, targetId, path = []) => {
    if (currentId === targetId) {
      return [...path, currentId]; // Found the target
    }
    if (!map[currentId]) {
      return null; // No children, dead end
    }
    for (const childId of map[currentId]) {
      const result = searchHierarchy(map, childId, targetId, [...path, currentId]);
      if (result) {
        return result; // Found the target in a child branch
      }
    }
    return null; // Target not found in any child branch
  };

  // Building the parent-child map from the data
  const parentChildMap = buildParentChildMap(networkData);
  // console.log(parentChildMap)

  // // Searching for the hierarchy path
  const hierarchyPath = searchHierarchy(parentChildMap, parentId, childId);

  // // Formatting the result
  return hierarchyPath ? hierarchyPath.join(" > ") : "no";
}


export const getProfileImage = async (profileId) => {
  try {
    const response = await strapiFetch({
      method: 'GET',
      endpoint: `profiles/${profileId}`,
      param: '?populate=profileImage',
      normalize: true,
      options: {},
      body: null,
      header: {}
    });

    if (response.status === 200) {
      return response?.data?.profileImage?.url || null;
    } else {
      throw new Error(`Failed to fetch profile image: ${response.errorMessage}`);
    }
  } catch (error) {
    console.error('Error fetching profile image:', error);
    throw error;
  }
};

export const getProfile = async (profileId) => {
  try {
    const response = await strapiFetch({
      method: 'GET',
      endpoint: `profiles/${profileId}`,
      param: '?populate=profileImage',
      normalize: true,
      options: {cache: 'no-cache'},
      body: null,
      header: {}
    });

    if (response.status === 200) {
      return response?.data || null;
    } else {
      throw new Error(`Failed to fetch profile image: ${response.errorMessage}`);
    }
  } catch (error) {
    console.error('Error fetching profile image:', error);
    throw error;
  }
};
// File: ./src/api/citsclient/services/citsclient-custom.js

'use strict';

const JLOG = (obj) => strapi.log.debug(JSON.stringify(obj, null, 2));

async function process() {
  console.log('Entering process function');
  const results = {
    created: 0,
    updated: 0,
    skipped: 0,
    noChangeSkipped: 0,
    createdClients: []
  };
  try {
    console.log('Fetching citsclient records...');
    const citsclients = await strapi.entityService.findMany('api::citsclient.citsclient', {
      populate: ['agentIds'],
    });
    console.log(`Fetched ${citsclients.length} citsclient records`);

    for (const citsclient of citsclients) {
      console.log(`\nProcessing citsclient: ${citsclient.id}`);
      
      if (citsclient.first_name === null) {
        console.log(`Skipping citsclient ${citsclient.id} due to null first_name`);
        results.skipped++;
        continue;
      }

      const profile = await findMatchingProfile(citsclient);
      if (profile) {
        console.log(`Matching profile found: ${profile.id}`);
        const existingClient = await findExistingClient(citsclient.clientid);
        if (existingClient) {
          console.log(`Existing client found: ${existingClient.id}`);
          const newClientData = await mapCitsClientToClient(citsclient, profile);
          console.log('Comparing existing client data with new data:');
          if (await compareClientFields(existingClient, newClientData)) {
            console.log(`No changes for client: ${existingClient.id}, skipping update`);
            results.noChangeSkipped++;
          } else {
            console.log(`Updating existing client: ${existingClient.id}`);
            await updateClient(existingClient.id, citsclient, profile);
            results.updated++;
          }
        } else {
          console.log('Creating new client');
          const newClient = await createClient(citsclient, profile);
          results.created++;
          results.createdClients.push(`${newClient.firstName} ${newClient.lastName}`);
        }
      } else {
        console.log('No matching profile found, skipping');
        results.skipped++;
      }
    }
    console.log('\nProcess completed successfully');
    console.log(`Clients Created: ${results.created}`);
    console.log(`Clients Updated: ${results.updated}`);
    console.log(`Clients Skipped (no changes): ${results.noChangeSkipped}`);
    console.log(`Clients Skipped (other reasons): ${results.skipped}`);
    return results;
  } catch (error) {
    console.error('Error in process function:', error);
    throw error;
  }
}

async function findMatchingProfile(citsclient) {
  console.log(`Finding matching profile for citsclient: ${citsclient.id}`);
  const agents = citsclient.agentIds || [];
  for (const agent of agents) {
    console.log(`Searching for profile with agent: ${agent.carriercode} - ${agent.agentid}`);
    try {
      const profiles = await strapi.entityService.findMany('api::profile.profile', {
        filters: {
          externalAccount: {
            externalCode: agent.carriercode,
            account: agent.agentid,
          },
        },
        populate: ['externalAccount'],
      });

      console.log(`Found ${profiles.length} matching profiles`);
      // JLOG(profiles);

      if (profiles.length > 0) {
        const matchingProfile = profiles.find(profile => 
          profile.externalAccount.some(account => 
            account.externalCode === agent.carriercode && account.account === agent.agentid
          )
        );

        if (matchingProfile) {
          console.log(`Matching profile found: ${matchingProfile.id}`);
          return matchingProfile;
        }
      }
    } catch (error) {
      console.error(`Error finding profile for agent ${agent.carriercode} - ${agent.agentid}:`, error);
    }
  }
  console.log('No matching profile found');
  return null;
}

async function findExistingClient(clientid) {
  console.log(`Finding existing client with clientid: ${clientid}`);
  try {
    const clients = await strapi.entityService.findMany('api::client.client', {
      filters: {
        citsClientId: {
          clientid: {
            $eq: clientid
          }
        }
      },
      populate: ['address', 'address.provinceId', 'citsClientId'],
    });

    if (clients.length > 0) {
      console.log(`Existing client found: ${clients[0].id}`);
      // Ensure address is always an object with all expected properties
      clients[0].address = {
        address: clients[0].address?.address || '',
        city: clients[0].address?.city || '',
        provinceId: clients[0].address?.provinceId?.id || null,
        postalCode: clients[0].address?.postalCode || '',
        country: clients[0].address?.countryId || null,
        ...clients[0].address
      };
      return clients[0];
    }
    console.log('No existing client found');
    return null;
  } catch (error) {
    console.error('Error finding existing client:', error);
    throw error;
  }
}

async function createClient(citsclient, profile) {
  console.log(`Creating new client for citsclient: ${citsclient.id}`);
  const clientData = await mapCitsClientToClient(citsclient, profile);
  try {
    const newClient = await strapi.entityService.create('api::client.client', {
      data: {
        ...clientData,
        citsClientId: citsclient.id
      }
    });
    console.log(`New client created: ${newClient.id}`);
    return newClient;
  } catch (error) {
    console.error('Error creating new client:', error);
    console.error('Validation errors:', JSON.stringify(error.details?.errors, null, 2));
    throw error;
  }
}

async function updateClient(id, citsclient, profile) {
  console.log(`Updating client: ${id}`);
  const clientData = await mapCitsClientToClient(citsclient, profile);
  try {
    await strapi.entityService.update('api::client.client', id, {
      data: clientData
    });
    console.log(`Client updated: ${id}`);
  } catch (error) {
    console.error('Error updating client:', error);
    console.error('Validation errors:', JSON.stringify(error.details?.errors, null, 2));
    throw error;
  }
}

async function mapCitsClientToClient(citsclient, profile) {
  console.log(`Mapping citsclient data to client data for citsclient: ${citsclient.id}`);

  // Province mapping
  const provinceMapping = {
    '101': 60,
    '102': 57,
    '103': 56,
    '104': 55,
    '105': 61,
    '106': 62,
    '107': 58,
    '108': 52
  };

  // Helper function to remove extra quotes if present and handle null values
  const cleanValue = (value) => {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'string') {
      value = value.trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1);
      }
    }
    return value;
  };

  const email = cleanValue(citsclient.email_address);

  // Fetch the province
  let provinceId = null;
  if (provinceMapping[citsclient.state_code]) {
    const province = await strapi.entityService.findOne('api::province.province', provinceMapping[citsclient.state_code]);
    provinceId = province ? province.id : null;
  }

  return {
    firstName: cleanValue(citsclient.first_name),
    lastName: citsclient.last_name === null ? '' : cleanValue(citsclient.last_name),
    email: email === '' ? null : email,
    homePhone: `${cleanValue(citsclient.phone_country_code)}${cleanValue(citsclient.area_code)}${cleanValue(citsclient.dial_number)}`,
    dateOfBirth: cleanValue(citsclient.birth_date),
    clientType: 'person',
    prefix: '',
    company: '',
    title: '',
    middleName: '',
    backgroundInformation: '',
    tags: '',
    maritialStatus: '',
    profileId: profile.id,
    occupation: cleanValue(citsclient.occupation),
    address: {
      address: cleanValue(citsclient.line1),
      city: cleanValue(citsclient.city),
      provinceId: provinceId,
      postalCode: cleanValue(citsclient.zip),
      countryId: cleanValue(citsclient.country_code) || null,
    },
    smokingStatus: 0,
    deleted: false,
    mergedTo: null,
  };
}

async function compareClientFields(existingClient, newClientData) {
  const fieldsToCompare = [
    'firstName', 'lastName', 'email', 'homePhone', 'dateOfBirth', 'occupation',
    'address.address', 'address.city', 'address.provinceId', 'address.postalCode', 'address.countryId'
  ];

  console.log('Comparing client fields:');
  let allFieldsMatch = true;

  for (const field of fieldsToCompare) {
    let existingValue, newValue;

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      existingValue = existingClient[parent] ? existingClient[parent][child] : undefined;
      newValue = newClientData[parent] ? newClientData[parent][child] : undefined;
    } else {
      existingValue = existingClient[field];
      newValue = newClientData[field];
    }

    // Special handling for provinceId
    if (field === 'address.provinceId') {
      if (existingValue && typeof existingValue === 'object') {
        existingValue = existingValue.id;
      }
    }

    // Convert to string for comparison, but treat null/undefined/empty string as null
    const existingValueNormalized = (existingValue === null || existingValue === undefined || existingValue === '') ? null : String(existingValue).trim();
    const newValueNormalized = (newValue === null || newValue === undefined || newValue === '') ? null : String(newValue).trim();

    if (existingValueNormalized !== newValueNormalized) {
      console.log(`Field ${field} differs:`);
      console.log(`  Existing: "${existingValueNormalized}" (${typeof existingValue})`);
      console.log(`  New:      "${newValueNormalized}" (${typeof newValue})`);
      allFieldsMatch = false;
    }
  }

  console.log(`All fields match: ${allFieldsMatch}`);
  return allFieldsMatch;
}

module.exports = {
  process,
  findMatchingProfile,
  findExistingClient,
  createClient,
  updateClient,
  mapCitsClientToClient,
  compareClientFields
};
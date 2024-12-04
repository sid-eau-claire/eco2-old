// import fs from 'fs/promises';
'use server'
export async function updateProfileImage(formProfileData: FormData, profileId: string) {
  // const file = formData.get('profileImage') as File;
  // const id = formData.get('id') as string;
  // const documentHash = formData.get('documentHash') as string;
  // console.log(file);
  console.log(formProfileData);
  console.log(profileId);
  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/myprofile/${profileId}`, {
      method: 'PUT',
      headers: {
        // 'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        'Cache-Control': 'no-cache',
      },
      body: formProfileData,
    });
    if (!response.ok) throw new Error('Failed to save document interaction');
    const responseData = await response.json();
    // console.log(responseData);
  } catch (error) {
    console.error('Error saving document interaction:', error);
  }
  // await saveFile(file, documentHash);
  
}

// async function saveFile(file: File, documentHash: string) {
//   const data = await file.arrayBuffer();
//   console.log(data);
//   // await fs.appendFile(`./public/${documentHash}.pdf`, Buffer.from(data));
//   return;
// }



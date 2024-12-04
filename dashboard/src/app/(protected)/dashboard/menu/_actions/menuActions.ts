'use server'
export async function getMenu() {
  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/menus?populate=*`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching menu:', error);
    return null;
  }
}

// Update menu data on the server
export async function updateMenu(menuData: any) {
  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/menus`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
      },
      body: JSON.stringify({ data: menuData })
    });
    if (!response.ok) {
      throw new Error('Failed to update');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating menu:', error);
    return null;
  }
}

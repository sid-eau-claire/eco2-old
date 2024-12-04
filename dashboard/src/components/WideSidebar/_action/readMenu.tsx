'use server'

import { normalize } from '@/lib/format';
import { accessWithAuth } from '@/lib/isAuth';
import { redirect } from "next/navigation";

type TransformMenuItem = {
  roles: string[];
  children: TransformMenuItem[];
}

function transformRoles(menu: any): any {
  return {
    ...menu,
    roles: menu.roles.map((role: any) => role.role),
    children: menu.children?.map((child: any) => transformRoles(child)) || []
  };
}

export const readMenu = async () => {
  try {
    const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/menus?populate[roles]=*&populate[appRoles]=*&populate[children][populate]=*&populate[parent]=*filters[parent][null]=true&sort=order:asc`, {
      // const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/menus?populate[roles]=*&populate[appRoles]=*&populate[children][populate]=*&populate[parent]=*&filters[parent][null]=true&filters[isActive]=true&sort=order:asc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
      },
      next: { revalidate: 60, tags: ['menus'] },
    });
    const responseJson = await response.json();
    const data = await normalize(responseJson);
    const transformedMenuItems = data.map((item: TransformMenuItem) => transformRoles(item));
    return transformedMenuItems;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const isPathAllow = async (pathName: string, menuItems: any) => {
  const session = await accessWithAuth();
  const matchingItem = menuItems.find((item: any) => item.href === pathName);
  if (matchingItem) {
    if (matchingItem.roles.includes(session.user.data.role.name)) {
      console.log('role is found');
    } else {
      console.log('role is not found');
      redirect('/error')
    }
  } else {
    console.log('No matching menu item found for the path');
    redirect('/error')
  }
};
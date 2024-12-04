'use server'
import {canAccess} from '@/lib/isAuth';
type AccessControl = {
  roles: string[];
  appRoles?: string[];
  profileId?: number | null;
}

// ({
//   roles: string[];
//   appRoles?: string[];
//   profileId?: number | null;
// } | undefined)[]


export const canAccessTab = async (accessControls: any[]) => {
  const promises = accessControls.map(accessControl => 
      canAccess(accessControl.roles, accessControl.appRoles, accessControl.profileId)
  );
  const results = await Promise.all(promises);
  console.log(results); // This will be an array of booleans
  return results;
}
// const filteredMenu = menu.filter(item => {
//   if (item.accessControl) {
//     return canAccess(item?.accessControl?.roles, item?.accessControl?.appRoles, item?.accessControl?.profileId);
//   } else {
//     return true;
//   }
// });


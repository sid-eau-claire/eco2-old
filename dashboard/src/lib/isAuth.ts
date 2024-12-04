'use server'
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, usePathname } from "next/navigation";
import { normalize } from "path";
import { FaLessThanEqual } from "react-icons/fa6";
import { profile } from "console";
type Session = {
  user: {
    name: string;
    email: string;
    image: string;
    accessToken: string;
    data: any
  };
  expires: string;

}

// Just check if user is authenticated with access Token.
export const accessWithAuth = async () =>  {
  const session: Session | null = await getServerSession(authOptions as any);
  // console.log('session', session)
  if (session?.user?.accessToken) {
    return session;
  } else {
    redirect('/auth/login')
    console.log('no access token')
  }
}

// Based on the roles, appRoles and ProfileId, check if the user is authenticated.
export const isMe = async (roles: string[], appRoles?: string[], profileId?: number | null) =>  {
  const session: Session & { user?: { data?: { profile?: { id?: any, rank?: { id?: any } }, role?: {name: string}} } } | null  = await getServerSession(authOptions as any);
  const sessionUserProfileId = session?.user?.data?.profile?.id as any;
  const sessionUserRole = session?.user?.data?.role?.name as any;
  const sessionUserAppRoles = session?.user?.data?.profile?.appRoles as any;
  // console.log(sessionUserRole)
  const found = roles.some(role => sessionUserRole == role)
  // let found = false
  // roles.map(role => {
  //   if (sessionUserRole == role) {
  //     found = true
  //     return found
  //   } else {
  //     found = false
  //   }
  // })
  return found
}

// Based on the roles, appRoles and ProfileId, check if the user is authenticated.
export const canAccess = async (roles: string[], appRoles?: string[], profileId?: number | null) =>  {
  const session: Session & { user?: { data?: { profile?: { id?: any, rank?: { id?: any } }, role?: {name: string}} } } | null  = await getServerSession(authOptions as any);
  const sessionUserProfileId = session?.user?.data?.profile?.id as any;
  const sessionUserRole = session?.user?.data?.role?.name as any;
  const sessionUserAppRoles = session?.user?.data?.profile?.appRoles as any;
  let found = false
  let roleFound = false
  let appRoleFound = false
  let profileIdFound = false
  let appRoleExist = false
  let profileIdExist = false
  // console.log('sessionUserRole', sessionUserRole)
  // console.log('sessionUserAppRoles', sessionUserAppRoles)
  // console.log('profileId', profileId)
  // console.log('roles', roles)
  // console.log('appRoles', appRoles)
  // console.log('sessionUserProfileId', sessionUserProfileId)
  // If Superuser is found, return true
  if (sessionUserRole == 'Superuser') {
    return true
  }
  roleFound = roles.some(role => sessionUserRole == role)
  if (roleFound && appRoles && appRoles.length > 0) {
    appRoleExist = true
    appRoleFound = appRoles.some(appRole => sessionUserAppRoles.some((sessionAppRole: any) => sessionAppRole.name == appRole))
  }
  if (profileId) {
    profileIdExist = true
    profileIdFound = profileId ? sessionUserProfileId == profileId : true
  }
  return roleFound && (!appRoleExist || appRoleFound) && (!profileIdExist || profileIdFound)
}

// export const canAccess = async (roles: string[], appRoles?: string[], profileId?: number | null) =>  {
//   const session: Session & { user?: { data?: { profile?: { id?: any, rank?: { id?: any } }, role?: {name: string}} } } | null  = await getServerSession(authOptions as any);
//   const sessionUserProfileId = session?.user?.data?.profile?.id as any;
//   const sessionUserRole = session?.user?.data?.role?.name as any;
//   const sessionUserAppRoles = session?.user?.data?.profile?.appRoles as any;
//   let found = false

//   // If Superuser is found, return true
//   if (sessionUserRole == 'Superuser') {
//     return true
//   }
//   found = roles.some(role => sessionUserRole == role)

//   // if appRoles is provided, check if the user has the appRoles
//   if (found && appRoles) {
//     found = appRoles.some(appRole => sessionUserAppRoles.some((sessionAppRole: any) => sessionAppRole.name == appRole))
//   }
//   // if profileId is provided, check if the user has the profileId
//   if (profileId) {
//     if (sessionUserProfileId == profileId) {
//       found = true
//     } else {
//       found = false
//     }
//   }
//   return found
// }


// export const isPathAuth = async (pathName: string) =>  {
//   const session: Session & { user?: { data?: { profile?: { id?: any, rank?: { id?: any } }, role?: {name: string}} } } | null  = await getServerSession(authOptions as any);
//   const sessionUserProfileId = session?.user?.data?.profile?.id as any;
//   const sessionUserRole = session?.user?.data?.role?.name as any;
//   // const pathName = usePathname();

//   try {
//     const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/menus?filters[href][$eq]=${pathName}&populate=roles`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
//       },
//       cache: 'no-cache',
//     })
//     const responseData = await response.json()
//     const data = await normalize(responseData.data)
//     return data
//     console.log(JSON.stringify(data, null, 2))
//   } catch (error) {
//     console.log(error)
//   }
//   return true
// }
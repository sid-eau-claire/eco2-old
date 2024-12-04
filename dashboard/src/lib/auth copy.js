import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcryptjs';

export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export const authOptions = {
  providers: [
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //   authorization: {
    //     params: {
    //       scope: 'https://www.googleapis.com/auth/calendar.events openid profile email',
    //       prompt: 'consent',
    //       access_type: 'offline',
    //       response_type: 'code'
    //     }
    //   }
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: [
            'https://www.googleapis.com/auth/calendar.events', // Access to calendar events
            'https://www.googleapis.com/auth/gmail.readonly', // View email messages and settings
            'https://www.googleapis.com/auth/gmail.send', // Send email on your behalf
            'https://www.googleapis.com/auth/drive', // Full access to Google Drive
            'https://www.googleapis.com/auth/userinfo.profile', // View user's profile information
            'https://www.googleapis.com/auth/userinfo.email', // View user's email address
            'https://www.googleapis.com/auth/contacts', // See and edit your contacts
            'https://www.googleapis.com/auth/admin.directory.user.readonly' // See organization's GSuite directory
          ].join(' '),
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),    
    CredentialsProvider({
      name: 'Sign in with Email',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const fetch_url = `${process.env.STRAPI_BACKEND_URL}/api/auth/local`;
        const params = {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identifier: credentials.email,
            password: credentials.password
          })
        };
        let response = await fetch(fetch_url, params);
        const result = await response.json();
        if (result.error) {
          throw new Error(result.error.message);
        }
        if (result.user.email === credentials.email) {
          return { user: result.user, jwt: result.jwt, email: result.user.email };
        }
        return false;
      }
    }),
  ],
  database: process.env.NEXT_PUBLIC_DATABASE_URL,
  pages: {
    error: '/auth/error',
    signIn: '/auth/login',
    signOut: '/auth/logout',
  },
  callbacks: {
    async session({ session, token, user }) {
      session.user.accessToken = token.accessToken || token.jwt;
      session.user.data = token?.data;
      session.user.googleAccessToken = token?.googleAccessToken || null;
      session.error = token.error;
      return session;
    },
    async jwt({ token, account, user }) {
      // For credentials provider
      if (user?.jwt) {
        token.jwt = user.jwt;
      }
      // For Google provider
      if (account?.provider === 'google') {
        token.email = user.email;
        token.jwt = account.id_token;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.googleAccessToken = account.access_token;
      }

      // If the token is about to expire, refresh it
      if (token.expiresAt && Date.now() >= token.expiresAt * 1000 - 60000) {
        try {
          const response = await fetch('https://oauth2.googleapis.com/token', {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID,
              client_secret: process.env.GOOGLE_CLIENT_SECRET,
              grant_type: 'refresh_token',
              refresh_token: token.refreshToken,
            }),
            method: 'POST',
          });

          const tokens = await response.json();

          if (!response.ok) throw tokens;

          token.accessToken = tokens.access_token;
          token.expiresAt = Math.floor(Date.now() / 1000 + tokens.expires_in);
          token.googleAccessToken = tokens.access_token;
        } catch (error) {
          console.error('Error refreshing access token', error);
          token.error = "RefreshAccessTokenError";
        }
      }

      // Retrieve data from Strapi backend and store it in the token for ranks, profile, etc.
      if (!token?.data) {
        // Fetch user data
        const userData = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/users?filters[email][$eq]=${token?.email}&populate=profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
          }
        });
        if (userData.ok) {
          const data = await userData.json();
          token.data = data[0];
        }

        // Fetch profile data
        const profileData = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/profiles?filters[id][$eq]=${token?.data?.profile?.id}&populate[externalAccount]=*&populate[appRoles]=*&populate[profileImage]=*`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
          }
        });
        if (profileData.ok) {
          const profile = await profileData.json();
          token.data.profile = profile?.data[0]?.attributes;
          token.data.profile.id = profile?.data[0]?.id;
        }        

        // Fetch rank data
        const rankData = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/profiles?filters[id][$eq]=${token?.data?.profile?.id}&populate=rankId`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
          }
        });
        if (rankData.ok) {
          const rank = await rankData.json();
          token.data.profile.rankId = rank?.data[0]?.attributes?.rankId?.data?.attributes;
        }
      }
      return token;
    },
    // Check if the user is allowed to sign in
    async signIn({ user, account }) {
      // Using Google provider
      if (account.provider === "google") {
        const email = user.email;
        // Check if the user comes from authorized email domain(s)
        const isAllowedToSignIn = email.endsWith('@eauclairepartners.com');
        if (!isAllowedToSignIn) {
          return false
        } else {
          return true;
        }
        // Check if the user is blocked from signing in strapi
      }
      
      // Check if the user has a profile in the database
      const userResponse = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/users?filters[email][$eq]=${user?.email}&populate=profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
        }
      });
      if (userResponse.ok) {
        const responseData = await userResponse.json();
        if (responseData.length === 1 && responseData[0].profile != null) {
          return true;
        } else {
          console.log('No user profile is found');
        }
      }

      // Only allow users with emails in invitation
      const response = await fetch(`${process.env.STRAPI_BACKEND_URL}/api/invitations?filters[inviteEmail][$eq]=${user?.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
        }
      });
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.length === 1 && responseData?.data[0]?.attributes?.inviteEmail === user?.email) {
          return true;
        } else {
          throw new Error('You are not invited to use this application');
        }
      }
      return false;
    }
  },
  async redirect({ url, baseUrl }) {
    return baseUrl;
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token.${process.env.NODE_ENV}`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: 'ack-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  }
};
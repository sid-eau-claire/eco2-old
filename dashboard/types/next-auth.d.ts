// next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  /**
   * Extending session to have the accessToken attribute
   */
  interface Session {
    user: {
      accessToken?: string;
      data?: any;
      // You can include other properties here
    } & DefaultSession['user'];
  }
}

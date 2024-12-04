import React from 'react';
import Head from 'next/head';
// import NextAuthLayout from '@/components/NextAuthLayout';
const Layout = ({ children }) => {

  return (
    <>
      {/* <Head>
        <title>Authentication page</title>
      </Head>
      <main> */}
        {children}
      {/* </main> */}
    </>
  );
};

export default Layout;

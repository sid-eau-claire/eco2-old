"use client"
import NextAuthProvider from '@/context/NextAuthProvider';

export default function clientlayout({children}) {
  return (
    <>
      <NextAuthProvider>
        {children}
      </NextAuthProvider>
    </>
  );
}
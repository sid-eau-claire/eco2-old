'use client'
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";

const CheckPasswordEmail: React.FC = () => {
  const router: any = useRouter();
  const email = router.query?.email as string || '';

  return (
    <div className="rounded-sm border border-stroke bg-whiten shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-wrap items-center">
        <motion.div className="hidden w-full xl:block xl:w-1/2 bg-cover min-h-screen"
          style={{ backgroundImage: 'url(/images/eauclaire/background.png)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        />
        <motion.div className="w-full min-h-screen flex flex-col justify-center xl:w-1/2 xl:border-l-2 border-stroke dark:border-strokedark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="w-full max-w-md mx-auto p-8 bg-white shadow-2xl rounded-lg">
            <motion.div className="flex justify-center mb-12"
              initial={{ scale: 0 }}
              animate={{ scale: 1.1 }}
              transition={{ delay: 1.1, duration: 0.5, type: 'spring', stiffness: 100 }}
            >
              <Image src="/images/eauclaire/ECO_Logo_Golden.svg" alt="Company Logo" width={150} height={150} style={{width: '50%', height: 'auto'}} />
            </motion.div>
            <motion.h2 className="mb-6 text-2xl font-bold text-black dark:text-white text-center"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              Check Your Email
            </motion.h2>
            <motion.p className="mb-8 text-center text-gray-600"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            >
              We've sent a password reset link to:
              <br />
              <strong>{email}</strong>
              <br /><br />
              Click the link in the email to reset your password.
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              <Link href="/auth/login" className="block w-full text-center py-3 rounded-lg bg-primary text-white hover:bg-opacity-90 transition duration-300">
                Back to Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckPasswordEmail;
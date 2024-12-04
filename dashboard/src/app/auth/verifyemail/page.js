// pages/thank-you.js
'use client'
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const ThankYouPage = () => {
  const router = useRouter();

  return (
    <motion.div
      className="bg-gray-100 min-h-screen flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0, duration: 1 }}
    >
      <div className="max-w-md p-8 bg-white shadow-md rounded-md">
        <h1 className="text-xl font-semibold mb-4">Thank you for registering!</h1>
        <motion.p
          className="text-sm text-gray-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 1 }}
        >
          Your Eau Claire account has been successfully created. Please check your email inbox and click the verification link to activate your account.
        </motion.p>

        <button
          className="w-full bg-p2/80 text-black py-2 rounded-md hover:bg-p2 focus:outline-none"
          onClick={() => router.push('/')}
        >
          Go to Home
        </button>
      </div>
    </motion.div>
  );
};

export default ThankYouPage;

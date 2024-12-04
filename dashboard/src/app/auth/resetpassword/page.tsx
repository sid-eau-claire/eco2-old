// app/auth/resetpassword/page.tsx

'use client'

import React, { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { motion } from "framer-motion";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import LoadingButton from '@/components/Button/LoadingButton'
import { resetPassword } from '../_actions/resetTokenInStrapi';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setIsPasswordVisible((prevState) => !prevState);
    } else {
      setIsConfirmPasswordVisible((prevState) => !prevState);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPassword(code as string, password, confirmPassword);
      if (result.success) {
        router.push('/auth/login');
      } else {
        setErrorMessage(result.error || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error("Unexpected error in handleSubmit:", error);
      setErrorMessage('An unexpected error occurred. Please try again later.');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    passwordInputRef.current?.focus();
  }, []);

  return (
    <>
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
              <motion.h2 className="mb-3 text-2xl font-bold text-black dark:text-white"
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                Reset Your Password
              </motion.h2>
              <motion.div className="mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0, duration: 0.1 }}
              >
                <label className="mb-2 block font-medium text-black dark:text-white">New Password</label>
                <div className="relative">
                  <motion.input
                    ref={passwordInputRef}
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="Enter your new password"
                    className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    autoFocus
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  />
                  <span className="absolute right-3 top-3 text-lg cursor-pointer"
                    onClick={() => togglePasswordVisibility('password')}
                  >
                    {isPasswordVisible ? <IoMdEye /> : <IoMdEyeOff />}
                  </span>
                </div>
              </motion.div>
              <motion.div className="mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.1 }}
              >
                <label className="mb-2 block font-medium text-black dark:text-white">Confirm New Password</label>
                <div className="relative">
                  <motion.input
                    ref={confirmPasswordInputRef}
                    type={isConfirmPasswordVisible ? "text" : "password"}
                    placeholder="Confirm your new password"
                    className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSubmit()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  />
                  <span className="absolute right-3 top-3 text-lg cursor-pointer"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    {isConfirmPasswordVisible ? <IoMdEye /> : <IoMdEyeOff />}
                  </span>
                </div>
              </motion.div>
              <div className="mb-4">
                <LoadingButton
                  onClick={handleSubmit}
                  // isLoading={isLoading}
                >
                  Reset Password
                </LoadingButton>
              </div>
              {errorMessage && (
                <motion.div className="text-danger mb-4 flex flex-row justify-between items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0, duration: 0.5 }}
                >
                  <motion.span className="text-danger"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    {errorMessage}
                  </motion.span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
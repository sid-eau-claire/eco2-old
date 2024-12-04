// app/auth/signin/page.tsx

'use client'
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { MdOutlineMailOutline } from "react-icons/md";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { FcGoogle } from 'react-icons/fc';
import LoadingButton from '@/components/Button/LoadingButton'
import { generateResetToken } from '../_actions/resetTokenInStrapi';
import { profileExisted } from '../_actions/profileExisted';
import showTokenInConsole  from '../_actions/showTokenInConsole';
import { sendMail } from "@/lib/gmailService";
import {accessCodeEmailContent} from './code.js'

const SignIn: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const emailInputRef = useRef<HTMLInputElement>(null)
  const verifyButtonRef = useRef<HTMLButtonElement>(null)
  const signInButtonRef = useRef<HTMLButtonElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)
  const codeInputRefs = useRef(Array(6).fill(null));
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState(new Array(6).fill(""));
  const [generateVerificationCode, setGenerateVerificationCode] = useState('')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const generateRandomDigit = (position: number) => position === 0 ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 10);

  const handleVerificationCodeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if ((e.key === 'Backspace' || e.key === 'ArrowLeft') && index > 0) {
      e.preventDefault();
      const newVerificationCode = [...verificationCode];
      newVerificationCode[index - 1] = '';
      setVerificationCode(newVerificationCode);
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const validateEmail = (email: string) => {
    setEmail(email);
    const re = /\S+@\S+\.\S+/;
    if (re.test(email)) {
      setIsValidEmail(true);
    } else {
      setIsValidEmail(false);
    }
  }

  const handleResetPassword = async () => {
    setShowResetConfirm(true);
  };

  const confirmResetPassword = async () => {
    setShowResetConfirm(false);
    setIsLoading(true);
    try {
      console.log("Generating reset token for email:", email);
      const result:any = await generateResetToken(email);
      console.log("Generate reset token result:", result);

      if (result.success) {
        const resetLink = process.env.NEXT_PUBLIC_RESET_LINK;
        await sendMail(
          email,
          "Reset Your Password",
          `Please use the following link to reset your password: ${resetLink}?code=${result.token}`,
          `<p>Please click <a href="${resetLink}?code=${result.token}">here</a> to reset your password.</p>`
        );
        router.push(`/auth/checkpasswordemail?email=${email}`);
      } else {
        console.error("Failed to generate reset token:", result.error);
        setErrorMessage(result.error || 'Failed to generate reset token. Please try again later.');
      }
    } catch (error) {
      console.error("Unexpected error in confirmResetPassword:", error);
      setErrorMessage('An unexpected error occurred. Please try again later.');
    }
    setIsLoading(false);
  };

  const handleEmailConfirm = async () => {
    const response = await profileExisted(email);
    if (!response) {
      setErrorMessage('Email is not registered!!');
      return;
    }
    setErrorMessage('');
    const randomCode = verificationCode.map((_, index) => generateRandomDigit(index).toString());
    const codeString = randomCode.join("");
    setGenerateVerificationCode(codeString);
    sendMail(email, "Verification token for accessing EAU CLAIRE ONE", 'Verification Code', accessCodeEmailContent(codeString));

    showTokenInConsole(email + ":" + codeString)
    setShowVerification(true);
    codeInputRefs.current[0]?.focus();
  };
  
  const handleEmailVerification = async (code: string) => {
    setErrorMessage('');
    setIsLoading(true);
    if (generateVerificationCode === code) {
      setEmailVerified(true);
    } else {
      setErrorMessage('Invalid verification code.');
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session]);

  const handleSubmit = async () => {
    setErrorMessage('');
    const response = await signIn('credentials', { redirect: false, email: email, password: password})
    if (response && response.error) {
      setErrorMessage(response.error);
    } else {
      router.push('/dashboard')
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValidEmail) {
      handleEmailConfirm();
    }
  }

  const handleVerificationCodeChange = (index: number, value: string) => {
    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = value;
  
    if (index < 5 && value) {
      codeInputRefs.current[index + 1]?.focus();
    } else if (index === 5) {
      const codeString = newVerificationCode.join("");
      handleEmailVerification(codeString);
    }
    setVerificationCode(newVerificationCode);
  };

  function togglePasswordVisibility(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsPasswordVisible((prevState) => !prevState);
  }
  
  useEffect(() => {
    emailInputRef.current?.focus();
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
                Welcome back!
              </motion.h2>
              <motion.div className="mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3, duration: 0.5 }}
              >
                <label className="mb-2 block font-medium text-black dark:text-white">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  ref={emailInputRef} 
                  className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  value={email}
                  onChange={(e) => validateEmail(e.target.value)}
                  onKeyDown={handleKeyPress} 
                />
                <button
                  className="flex items-center justify-center mt-4 w-full rounded-lg bg-white border border-stroke p-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => { signIn('google') }}
                >
                  <FcGoogle className="mr-2" size={24} />
                  <span className="font-medium">Sign in with Google</span>
                </button>
              </motion.div>
              {!emailVerified && showVerification && (
                <>
                  <motion.div className="mb-4 flex flex-col justify-between gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0, duration: 0.3 }}
                  >
                    <label className="mb-2 block font-medium text-black dark:text-white">Verification Code</label>
                    <div className='flex justify-center items-center gap-2'>
                      {verificationCode.map((code, index) => (
                        <motion.input
                          key={index}
                          type="text"
                          maxLength={1}
                          className="w-10 h-10 rounded-lg border border-strokedark bg-transparent text-center outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                          value={code}
                          onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleVerificationCodeKeyPress(e, index)}
                          ref={(el) => codeInputRefs.current[index] = el}
                          autoFocus={index === 0}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 + index * 0.05, duration: 0.2 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </>
              )}

              {!showVerification && isValidEmail && (
                <div className="mb-4">
                  <LoadingButton
                    onClick={handleEmailConfirm}
                  >
                    Confirm Email
                  </LoadingButton>
                </div>
              )}

              {emailVerified && (
                <>
                  <motion.div className="mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0, duration: 0.1 }}
                  >
                    <label className="mb-2 block font-medium text-black dark:text-white">Password</label>
                    <div className="relative">
                      <motion.input
                        ref={passwordInputRef}
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full rounded-lg border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSubmit()}
                        autoFocus
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                      />
                      <span className="absolute right-3 top-3 text-lg cursor-pointer"
                        onClick={togglePasswordVisibility}
                      >
                        {isPasswordVisible ? <IoMdEye /> : <IoMdEyeOff />}
                      </span>
                    </div>
                  </motion.div>
                  <div className="mb-4">
                    <LoadingButton
                      ref={signInButtonRef}
                      onClick={handleSubmit}
                    >
                      Sign In
                    </LoadingButton>
                  </div>
                  <Link href="#" onClick={handleResetPassword} className="flex flex-row justify-end">
                    <motion.span className="text-blue-500 text-sm cursor-pointer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        whileHover={{ scale: 1.05, color: '#f00'}}
                      >
                        Forgot Password?
                    </motion.span>                  
                  </Link>
                </>
              )}
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

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Confirm Password Reset</h3>
            <p>Are you sure you want to reset your password?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={confirmResetPassword}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignIn;
'use client'
import React, {useState, useEffect} from "react";
import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {motion} from "framer-motion";
import { MdOutlineMailOutline } from "react-icons/md";
import { IoMdEye,IoMdEyeOff } from "react-icons/io";
import { FaGoogle} from 'react-icons/fa';
import Email from "next-auth/providers/email";
import {login} from "./../_actions/localauth";
import { sign } from "crypto";

const SignIn: React.FC = () => {
  const { data: session } = useSession();  
  const router = useRouter();
  const [popup, setPopUp] = useState(false)
  const [provider, setProvider] = useState('')
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  useEffect(() => {
    if (session != null) {
      router.push("/dashboard");
    }
  }, [session]);
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };
  const handleSubmit = async () => {
    setErrorMessage('');
    // console.log(response)
    // e.preventDefault();
    // const response = await login({ credentials: formData });
    // console.log('response', response);
    // console.log(response)
    const response  = await signIn('credentials', { redirect: false, email: formData.email, password: formData.password})
    console.log('here')
    console.log(response)
    if (response && response.error) {
      setErrorMessage(response.error);
    }
  };
  function togglePasswordVisibility(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsPasswordVisible((prevState) => !prevState);
  }
  // console.log('session', session)
  return (
    <>
      {/* <Breadcrumb pageName="Sign In" /> */}

      <div className="rounded-sm border border-stroke bg-whiten shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          <motion.div className="hidden w-full xl:block xl:w-1/2 bg-cover min-h-screen"
            style={{backgroundImage: 'url(/images/eauclaire/background.png)'}}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          />
          <motion.div className="w-full min-h-screen flex flex-col justify-center border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            hello
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SignIn;

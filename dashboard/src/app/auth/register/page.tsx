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

const SignIn: React.FC = () => {
  const { data: session } = useSession();  
  const router = useRouter();
  const [popup, setPopUp] = useState(false)
  const [provider, setProvider] = useState('')
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
    // e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });
    console.log('result', result)
    if (result && result.ok) {
      router.replace('/');
      return;
    } else {
      // toast.error('Login failure!!' , {
      //   position: 'bottom-left',
      //   autoClose: 2000, // milliseconds
      //   hideProgressBar: false,
      //   closeOnClick: true,
      //   pauseOnHover: true,
      //   draggable: true,
      //   progress: undefined,
      // })
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

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
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
            <div className="w-full max-w-xl mx-auto p-4 sm:p-12.5 xl:p-17.5">
              <motion.div className="flex flex-row justify-center items-center mb-12"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1, duration: 0.5, type: 'spring', stiffness: 100 }}
              >
                <Image src="/images/eauclaire/ECO_Logo_Golden.svg" alt="Company Logo" className="w-[18rem]" width="100" height="100"/>
              </motion.div>
              <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-title">
                Welcome to Eau Claire One
              </h2>
              <div className="mb-4 text-black text-md ">
                <p>In order to access the resources and services of the Eau Claire website, you need to register an account with us first.</p>
                <p>You can create your Eau Claire account using one of the following methods:</p>
              </div>
              <div>
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                    <span className="absolute right-4 top-4">
                      <MdOutlineMailOutline className="text-2xl"/>
                    </span>
                  </div>
                </div>

                <div className="mb-10">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={isPasswordVisible ? "text" : "password"} 
                      placeholder="6+ Characters, 1 Capital letter and 1 number"
                      className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      onChange={(e) => handleChange('password', e.target.value)}
                    />
                    <span className="absolute right-4 top-4 text-2xl cursor-pointer "
                      onClick={(e: React.MouseEvent<HTMLDivElement>) => togglePasswordVisibility(e)}
                    >
                      {isPasswordVisible ? ( <IoMdEye className="text-gray-600" />) : <IoMdEyeOff className="text-gray-600" />}
                    </span>
                  </div>
                </div>

                <div className="mb-1">
                  <input
                    type="submit"
                    value="Register account in Eau Claire One"
                    onClick={()=>{handleSubmit()}}
                    className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
                  />
                </div>

                <div className="my-6 text-center border-solid  ">OR</div>
                
                <button className="flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray p-3 hover:bg-opacity-50 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50"
                  onClick={() => {signIn('google')}}
                >
                  <span>
                    <img src="/images/logo/google.svg"/>
                  </span>
                  Register with Google
                </button>

                {/* <div className="mt-6 text-center">
                  <p>
                    Don’t have any account?{" "}
                    <Link href="/auth/signup" className="text-primary">
                      Sign Up
                    </Link>
                  </p>
                </div> */}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SignIn;

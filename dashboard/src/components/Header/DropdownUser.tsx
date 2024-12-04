import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {FaUser} from 'react-icons/fa6';
import { MdOutlineSettings, MdExitToApp } from "react-icons/md";
import {motion} from "framer-motion";
import { clearCookiesData } from "@/components/CookieState";
import { getProfileImage } from "@/lib/network";

const DropdownUser = ({session}: {session: any}) => {
  // const { data: update } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentProfileImage, setCurrentProfileImage] = useState<string | null>(null);

  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });
  useEffect(() => {
    const fetchProfileImage = async (id: string) => {
      const response = await getProfileImage(id)
      setCurrentProfileImage(response)
      // console.log('profileImage', response)
      return response;
    }
    fetchProfileImage(session?.user?.data?.profile?.id)
  }, []);  
  return (
    <div className="relative">
      <Link
        ref={trigger}
        onClick={() => {setDropdownOpen(!dropdownOpen); }}
        className="flex items-center gap-4"
        href="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {session?.user?.data?.profile?.nickname || session?.user?.data?.profile?.firstName + " " + session?.user?.data?.profile?.lastName}
          </span>
          {/* <span className="block text-xs">{session.user.data.profile?.rank.replace(/\s*\(.*?\)/, '')}</span> */}
          {/* <span className="block text-xs">{session.user.data?.profile?.rankId?.name} {session.user.data?.role?.name == 'Superuser' ? ' (Super User)' : ''}</span> */}
        </span>

        <motion.span className="h-10 w-10 rounded-full"
          whileHover={{ scale: 1.1, x: 10 }}
          transition={{ duration: 0.3 }}
        >
        <Image
          className="rounded-full"
          width={112}
          height={112}
          src={`/images/user/user-${Math.floor(Math.random() * 14).toString().padStart(2, '0')}.png`}
          alt="User"
        />
        </motion.span>
      </Link>

      {/* <!-- Dropdown Start --> */}
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-[-1] mt-2 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${
          dropdownOpen === true ? "block" : "hidden"
        }`}
      >
        <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
          <motion.li
            whileHover={{ scale: 1.1, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              className="flex justify-start items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              href={`/dashboard/profile/${session?.user?.data?.profile?.id}`}
              onClick={()=> setDropdownOpen(false)}
            >
              <FaUser className="text-2xl" />
              My Profile
            </Link>
          </motion.li>
          <motion.li
            whileHover={{ scale: 1.1, x: 10 }}
            transition={{ duration: 0.3 }}          
          >
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              onClick={()=> setDropdownOpen(false)}
            >
              <MdOutlineSettings className="text-2xl" />
              Account Settings
            </Link>
          </motion.li>
        </ul>
        <motion.button className="flex items-center gap-3.5 py-4 px-6 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
          onClick={()=>{signOut();setDropdownOpen(false);clearCookiesData();signOut()}}
          whileHover={{ scale: 1.1, x: 10 }}
          transition={{ duration: 0.3 }}
        >
          <MdExitToApp className="text-2xl" />
          Log Out
        </motion.button>
      </div>
      {/* <!-- Dropdown End --> */}
    </div>
  );
};

export default DropdownUser;

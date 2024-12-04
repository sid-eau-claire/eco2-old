import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import SidebarLinkGroup from './SidebarLinkGroup';
import Image from 'next/image';
import { color, motion } from "framer-motion";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { menuItems } from "@/components/MenuItems";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  session: any;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen, session }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);
  const [showText, setShowText] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(62.5);
  const toggleShowText = () => {
    setShowText(!showText);
    setSidebarWidth(sidebarWidth === 62.5 ? 24 : 62.5);
  };

  let storedSidebarExpanded = "true";
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector("body")?.classList.add("sidebar-expanded");
    } else {
      document.querySelector("body")?.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  const handleMenuClick = (menuId: string) => {
    if (openMenu === menuId) {
      setOpenMenu(null); // Close the current menu
    } else {
      setOpenMenu(menuId); // Open the new menu and close others
      setTimeout(() => {
        if (sidebar.current) {
          const sidebarHeight = sidebar.current.clientHeight;
          const scrollToPosition = sidebarHeight * 0.2; // 20% of sidebar height
          sidebar.current.scrollTop = scrollToPosition;
        }
      }, 300); // Adjust the delay as needed      
    }
  };
  return (
    <motion.aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-9999 flex h-screen w-${sidebarWidth} flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      initial={{ opacity: 0}}
      animate={{ opacity: 1}}
      transition={{delay: 0.2, duration: 0.8, type: "spring", stiffness: 100 }}
      onMouseOver={()=>{setShowText(true); setSidebarWidth(62.5); }}    
    >
      {/* Sidebar Header */}
      <motion.div className="flex items-center justify-between gap-2 px-2 py-2 lg:py-3"
        whileHover={{ scale: 1.05}}
        transition={{delay: 0, duration: 0.3, type: "spring", stiffness: 100 }}
      >
        <Link href="/dashboard"
          className='flex flex-row justify-start items-center gap-2.5 mt-0'
        >
          <Image
            className='cursor-pointer ml-0' 
            width={36}
            height={36}
            src={"/images/eauclaire/logo.svg"}
            alt="Logo"
          />
          {showText && (
            <Image
              width={120}
              height={36}
              src={"/images/eauclaire/logo-name.svg"}
              alt="Logo"
            />
          )}
        </Link>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </motion.div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-2  px-0 lg:mt-4 lg:px-0">
          {/* <!-- Menu Group --> */}
          <div>
            {showText && (
              <div className="flex flex-row justify-between items-center mb-4 cursor-pointer text-2xl">
                <h3 className="text-lg font-semibold text-bodydark2 cursor-pointer ml-4"
                >
                  Menu
                </h3>
                <TbLayoutSidebarLeftCollapse
                  className={`text-2xl text-bodydark2 cursor-pointer mr-2 scale-105`}
                  onClick={()=>{setOpenMenu(null);toggleShowText()}}
                />
              </div>
            )}

          {/* Render Main Menu Items */}
          <ul className="mb-6 flex flex-col gap-1.5">
            {menuItems.filter(filterItem => filterItem.roles.includes(session.user.data.role.name)).map((item, index) => (
              <SidebarLinkGroup
                key={index}
                activeCondition={item.href.startsWith(pathname)}
                isOpen={openMenu === `menu-${index}`} // Check if this menu should be open
                onToggle={() => handleMenuClick(`menu-${index}`)} // Handle menu toggle                
              >
                {(handleClick, open) => (
                  <motion.div
                    id={index.toString()}
                    initial={{ x: -50}}
                    animate={{ x: 0}}
                    transition={{delay: (0.4 + 0.05 * index) , duration: 0.4, type: "spring", stiffness: 100 }}
                  >
                    <Link href={item.href}
                      className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                        (item.href.startsWith(pathname) && pathname != '/dashboard')  && "bg-graydark dark:bg-meta-4"
                      }`}
                      onClick={(e) => {
                        console.log('item.href: ', item.href);
                        if (item.children) {
                          sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                          e.preventDefault();
                        } 
                      }}                      
                    >
                      {/* Icon and Text */}
                        <motion.span
                          className={showText ? `text-lg` : `text-xl`}
                        >
                          {item.icon}
                        </motion.span>
                        {showText && <motion.div whileHover={{scale: 1.05 }} transition={{duration: 0.5, type: "spring", stiffness: 100}}>{item.name}</motion.div>}
                        {showText && item.children && (
                          <svg
                            className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${
                              open && "rotate-180"
                            }`}
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                              fill=""
                            />
                          </svg>                        
                        )}
                    </Link>
                    {/* Render Submenu Items */}
                    <div className={`translate transform overflow-hidden ${
                      !open && "hidden"  }`}
                    >
                      <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                        {item.children && item.children.filter(filterSubItem => filterSubItem.roles.includes(session.user.data.role.name)).map((subItem, subIndex) => (
                          <Link key={subIndex} href={subItem.href}
                            className={` group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white ${
                              (item.href.startsWith('/dummy')) && "text-white"
                            } `}                      
                          >
                            <motion.li
                              initial={{ opacity: 0, x: -50, }}
                              whileInView={{ opacity: 1, x: 0}}
                              transition={{delay: (0.05 * subIndex) , duration: 0.2 }}
                              // className={`text-${color} `}
                            >
                              {showText && subItem.name}
                            </motion.li>
                          </Link>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </SidebarLinkGroup>
            ))}
          </ul>
          </div>
        </nav>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

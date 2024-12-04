import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { readMenu, isPathAllow } from './_action/readMenu';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as RxIcons from 'react-icons/rx';
import * as FaIcons from 'react-icons/fa6';
import * as MdIcons from 'react-icons/md';
import * as GrIcons from 'react-icons/gr';
import * as TbIcons from 'react-icons/tb';
import SidebarLinkGroup from './SidebarLinkGroup';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  session: any;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen, session }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [showText, setShowText] = useState(false);
  const expandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [activeMenu, setActiveMenu] = useState<any>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      const response = await readMenu();
      setMenuItems(response);
    }
    fetchMenu();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setSidebarOpen]);

  const handleMouseEnter = () => {
    if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
    expandTimeoutRef.current = setTimeout(() => setShowText(true), 100);
  };

  const handleMouseLeave = () => {
    if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
    expandTimeoutRef.current = setTimeout(() => setShowText(false), 100);
  };

  const handleMenuClick = async (menuId: string, item: any) => {
    if (item.children && item.children.length > 0) {
      setOpenMenu(openMenu === menuId ? null : menuId);
    } else {
      await isPathAllow(item.href, menuItems);
      router.push(item.href.replace('/<id>', `/${session?.user?.data?.id}`));
    }
    setActiveMenu(menuId);
  };

  const getIcon = (iconName: string, size?: number) => {
    const iconParts = iconName?.split(/(?=[A-Z])/);
    const iconPrefix = iconParts?.[0];
    const IconComponent = 
      iconPrefix === 'Rx' ? RxIcons[iconName as keyof typeof RxIcons] :
      iconPrefix === 'Fa' ? FaIcons[iconName as keyof typeof FaIcons] :
      iconPrefix === 'Md' ? MdIcons[iconName as keyof typeof MdIcons] :
      iconPrefix === 'Gr' ? GrIcons[iconName as keyof typeof GrIcons] :
      iconPrefix === 'Tb' ? TbIcons[iconName as keyof typeof TbIcons] :
      RxIcons.RxDashboard;

    return IconComponent ? <IconComponent className={twMerge(`h-6 w-6 `, size ? `h-${size} w=${size}` : '' )} /> : <RxIcons.RxDashboard className="h-6 w-6" />;
  };

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(session?.user?.data?.role?.name) &&
    (item.appRoles.length === 0 ||
      item.appRoles.some((menuAppRole: any) => 
        session?.user?.data?.profile?.appRoles.find((appRole: any) => appRole.name === menuAppRole.name)
      )
    ) &&
    !item?.parent
  );

  const sidebarVariants = {
    open: { width: "240px", transition: { duration: 0.3, ease: "easeInOut" } },
    closed: { width: "64px", transition: { duration: 0.3, ease: "easeInOut" } }
  };

  const textVariants = {
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    hidden: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  const submenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      }
    }
  };

  const submenuItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <TooltipProvider>
      <motion.aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col overflow-hidden bg-black text-white shadow-lg 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:translate-x-0`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        variants={sidebarVariants}
        animate={showText ? "open" : "closed"}
        initial={false}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 h-16">
            <Link href="/dashboard" className="flex items-center space-x-2 overflow-hidden">
              <Image
                width={32}
                height={32}
                src="/images/eauclaire/logo.svg"
                alt="Logo"
              />
              <AnimatePresence>
                {showText && (
                  <motion.span
                    className="text-2xl font-semibold whitespace-nowrap"
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    Eau Claire One 
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-gray-800"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {getIcon('RxHamburgerMenu')}
            </Button>
          </div>

          <ScrollArea className="flex-grow">
            <nav className="space-y-1 p-2">
              <ul className="list-none pl-0 space-y-1">
                {filteredMenuItems.map((item, index) => (
                  <motion.li
                    key={index}
                    variants={menuItemVariants}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                  >
                    <SidebarLinkGroup
                      activeCondition={pathname.startsWith(item.href)}
                      isOpen={openMenu === `menu-${index}`}
                      onToggle={() => handleMenuClick(`menu-${index}`, item)}
                    >
                      {(handleClick, open) => (
                        <div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={activeMenu === `menu-${index}` ? "secondary" : "ghost"}
                                className={`w-full rounded-none ${showText ? 'justify-start px-4' : 'justify-center px-2'} text-white hover:bg-white hover:text-black ${activeMenu === `menu-${index}` ? 'bg-gray-800' : ''}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleClick();
                                }}
                              >
                                <span className={`flex items-center ${showText ? 'justify-start' : 'justify-center'} w-full`}>
                                  {getIcon(item.icon, 8)}
                                  <AnimatePresence>
                                    {showText && (
                                      <motion.span
                                        className="ml-2"
                                        variants={textVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                      >
                                        {item.name}
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                </span>
                              </Button>
                            </TooltipTrigger>
                          </Tooltip>
                          <AnimatePresence>
                            {open && item.children && item.children.length > 0 && showText && (
                              <motion.ul
                                className="ml-7 mt-1 space-y-1 list-none pl-0 bg-gray-900 overflow-hidden"
                                variants={submenuVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                              >
                                {item.children.filter((subItem: any) => 
                                  subItem.roles.includes(session.user.data.role.name) && subItem.isActive &&
                                  (subItem.appRoles.length === 0 ||
                                    subItem.appRoles.some((menuAppRole: any) => 
                                      session?.user?.data?.profile?.appRoles.find((appRole: any) => appRole.name === menuAppRole.name)
                                    )
                                  )
                                ).map((subItem: any, subIndex: number) => (
                                  <motion.li
                                    key={subIndex}
                                    variants={submenuItemVariants}
                                  >
                                    <Link
                                      href={subItem.href.replace('/<id>', `/${session?.user?.data?.profile?.id}`)}
                                      className={`flex items-center py-2 px-4 text-sm hover:bg-white hover:text-black ${
                                        pathname === subItem.href ? 'bg-gray-800' : ''
                                      }`}
                                    >
                                      {getIcon(subItem.icon, 4)}
                                      <span className="ml-2">{subItem.name}</span>
                                    </Link>
                                  </motion.li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </SidebarLinkGroup>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </ScrollArea>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default Sidebar;
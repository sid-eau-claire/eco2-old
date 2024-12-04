import {
  FaUser, FaBusinessTime, FaGlobe, FaSitemap, FaBullhorn,
  FaUserPlus, FaGraduationCap, FaHandshake,
} from 'react-icons/fa6';
import { RxDashboard } from "react-icons/rx";
import { MdOutlineBusinessCenter } from "react-icons/md";
import { FaPeopleRobbery } from "react-icons/fa6";
import { MdRule } from "react-icons/md";
import { FaChalkboardTeacher, FaTools, FaCommentDollar } from "react-icons/fa";
import { CgFileDocument } from "react-icons/cg";

const iconMap = {
  FaTools: <FaTools />,
  FaHandshake: <FaHandshake />,
  // ... map the rest of your icons
};


export const menuItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <RxDashboard />,
    roles: ['Advisor', 'Superuser'] 
  },
  // {
  //   name: 'My Account',
  //   href: '/dashboard/myaccount',
  //   icon: <FaUser />,
  //   roles: ['Authenticated','Advisor'],
  //   children: [
  //     { name: 'Profile', href: '/dashboard/profile', roles: ['Advisor','Authenticated'] },
  //     { name: 'Contact Information', href: '/dashboard/myaccount',  roles: ['Advisor'] },
  //     { name: 'Profile Image', href: '/dashboard/myaccount', roles: ['Advisor'] },
  //     { name: 'Designated Beneficiary', href: '/dashboard/myaccount', roles: ['Advisor'] },
  //     { name: 'Banking Information', href: '/dashboard/myaccount', roles: ['Advisor'] },
  //     { name: 'Errors & Omissions', href: '/dashboard/myaccount', roles: ['Advisor'] },
  //     { name: 'Licensing & Contracting', href: '/dashboard/myaccount', roles: ['Advisor'] },
  //     { name: 'Tax Documents', href: '/dashboard/myaccount', roles: ['Advisor'] },
  //     { name: 'Subscription', href: '/dashboard/myaccount', roles: ['Advisor'] },
  //     { name: 'Administrative', href: '/dashboard/myaccount', roles: ['Advisor'] },
  //     { name: 'Roles & Permissions', href: '/dashboard/myaccount',  roles: ['Advisor'] },
  //   ],
  // },
  {
    name: 'My Client',
    href: '/dashboard/myclient/<id>',
    icon: <FaPeopleRobbery />,
    roles: ['Advisor','Superuser'],
  },
  {
    name: 'My Opportunity',
    href: '/dashboard/myopportunity/',
    icon: <FaCommentDollar />,
    roles: ['Advisor','Superuser'],
  },  
  {
    name: 'My Business',
    href: '/dashboard/mybusiness',
    icon: <MdOutlineBusinessCenter />,
    roles: ['Advisor','Superuser'],
    children: [
      { name: 'Pipeline', href: '/dashboard/mybusiness',  roles: ['Advisor','Superuser']  },
      { name: 'Personal KPI', href: '/dashboard/mybusiness', roles: ['Advisor','Superuser'] },
      { name: 'Team KPI', href: '/dashboard/mybusiness', roles: ['Advisor','Superuser'] },
      { name: 'Cash Flow', href: '/dashboard/mybusiness/cashflow/<id>',  roles: ['Advisor','Superuser'] },
      { name: 'Case Archive', href: '/dashboard/mybusiness',roles: ['Advisor','Superuser'] },
      { name: 'Projections', href: '/dashboard/mybusiness',  roles: ['Advisor','Superuser'] },
      { name: 'Business Plan', href: '/dashboard/mybusiness', roles: ['Advisor','Superuser'] },
      { name: 'Advancement', href: '/dashboard/mybusiness', roles: ['Advisor','Superuser'] },
      { name: 'Escrow', href: '/dashboard/mybusiness',  roles: ['Advisor','Superuser']},
      { name: 'Debit / Credit', href: '/dashboard/mybusiness', roles: ['Advisor','Superuser'] },
    ],
  },
  // Guidelines Menu
  {
    name: 'Guidelines',
    href: '/dashboard/guidelines',
    icon: <MdRule />,
    roles: ['Advisor','Superuser'],
    // children: [
    //   { name: 'Revenue Sharing', href: '/dashboard/guidelines/article/revenueSharing', roles: ['Advisor','all'] },
    //   { name: 'Advancement', href: '/dashboard/guidelines/article/advancement', roles: ['Advisor','all'] },
    //   { name: 'Advisor Compliance', href: '/dashboard/guidelines/article/advisorCompliance', roles: ['Advisor','all'] },
    //   { name: 'Brand & Marketing', href: '/dashboard/guidelines/article/brandMarketing', roles: ['Advisor','all'] },
    //   { name: 'E&O Renewal', href: '/dashboard/guidelines/article/eoRenewal', roles: ['Advisor','all'] },
    //   { name: 'CE Credits (Annual Filing)', href: '/dashboard/guidelines/article/ceCredits', roles: ['Advisor','all'] },
    //   { name: 'New Business', href: '/dashboard/guidelines/article/newBusiness', roles: ['Advisor','all'] },
    //   { name: 'Compensation', href: '/dashboard/guidelines/article/compensation', roles: ['Advisor','all'] },
    //   { name: 'Operations Team', href: '/dashboard/guidelines/article/operationsTeam', roles: ['Advisor','all'] },
    //   { name: 'Communication Guide', href: '/dashboard/guidelines/article/communicationGuide', roles: ['Advisor','all'] }
    // ]
  },
  // Resources Menu
  {
    name: 'Resources',
    href: '/dashboard/resources',
    icon: <FaBusinessTime />,
    roles: ['Advisor','Superuser'],
    children: [
      { name: 'New Business & Compliance', href: '/dashboard/resources', roles: ['Advisor'] },
      { name: 'Contact Info', href: '/dashboard/resources', roles: ['Advisor'] },
      { name: 'Wallpapers', href: '/dashboard/resources', roles: ['Advisor'] },
    ],
  },
  // Carriers Menu
  {
    name: 'Carriers',
    href: '/dashboard/carriers',
    icon: <FaGlobe />,
    roles: ['Advisor','Superuser'],
    // children: [
    //   { name: 'Beneva', href: '/dashboard/carriers', roles: ['Advisor'] },
    //   { name: 'Foresters Financial', href: '/dashboard/carriers', roles: ['Advisor'] },
    //   { name: 'Canada Protection Plan', href: '/dashboard/carriers', roles: ['Advisor'] },
    //   { name: 'All Others', href: '/dashboard/carriers', roles: ['Advisor'] },
    // ],
  },
  // My Network Menu
  {
    name: 'My Network',
    href: '/dashboard/mynetwork/<id>',
    icon: <FaSitemap />,
    roles: ['Advisor','Superuser'],
    // children: [
    //   { name: 'List', href: '/dashboard/mynetwork', roles: ['Advisor'] },
    //   { name: 'Network Tree', href: '/dashboard/mynetwork', roles: ['Advisor'] },
    //   { name: 'List all members', href: '/dashboard/mynetwork', roles: ['Advisor'] },
    //   { name: 'Network tree (all members)', href: '/dashboard/mynetwork', roles: ['Advisor'] },
    // ],
  },
  // Training Menu
  {
    name: 'Training',
    href: '/dashboard/training',
    icon: <FaChalkboardTeacher />,
    roles: ['Advisor','Superuser'],
    children: [
      { name: 'Live Webinars', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Business Dev.', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Agency Dev.', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Term Life', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Whole Life', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Universal Life', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Disability Plans', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Critical Illness', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Health & Dental', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Investments', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Plans for Kids', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Business Solutions', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Case Processing', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Home Care (LTC)', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Travel & SuperVisa', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Simplified Life', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Recommended Watch', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Crossover Virtual', href: '/dashboard/training', roles: ['Advisor'] },
      { name: 'Private Wealth', href: '/dashboard/training', roles: ['Advisor'] }
    ]
  },
  // Marketing Menu
  {
    name: 'Marketing',
    href: '/dashboard/marketing',
    icon: <FaBullhorn />,
    roles: ['Advisor','Superuser'],
    children: [
      { name: 'Marketing Kit', href: '/dashboard/marketing', roles: ['Advisor'] },
      { name: 'Social Media', href: '/dashboard/marketing', roles: ['Advisor'] },
      { name: 'Advisor Website', href: '/dashboard/marketing', roles: ['Advisor'] },
      { name: 'Company Profile', href: '/dashboard/marketing', roles: ['Advisor'] },
      { name: 'Advisor Profile', href: '/dashboard/marketing', roles: ['Advisor'] },
      { name: 'Social Media Ad', href: '/dashboard/marketing', roles: ['Advisor'] },
      { name: 'Shop', href: '/dashboard/marketing', roles: ['Advisor'] }
    ]
  },
  // Onboarding Menu
  {
    name: 'Onboarding',
    href: '/dashboard/onboarding',
    icon: <FaUserPlus />,
    roles: ['Advisor','Superuser'],
    children: [
      { name: 'Invitation', href: '/dashboard/onboarding/invitation', roles: ['Advisor'] },
      { name: 'Monitoring', href: '/dashboard/onboarding/monitoring', roles: ['Advisor'] },
      // { name: 'My Application', href: '/dashboard/onboarding/applying', roles: ['Authenticated'] },
    ],
  },
  {
    name: 'Contracting',
    href: '/dashboard/contracting',
    icon: <CgFileDocument />,
    roles: ['Advisor','Superuser'],
    children: [
      { name: 'Life & Seg Funds', href: '/dashboard/contracting/lifesegfunds', roles: ['Advisor','Superuser'] },
      { name: 'Travel & Health', href: '/dashboard/contracting/travelhealth', roles: ['Advisor','Superuser'] },
      { name: 'Health Savings Account ', href: '/dashboard/contracting/hsa', roles: ['Advisor','Superuser'] },
      { name: 'Lending', href: '/dashboard/contracting/lending', roles: ['Advisor','Superuser'] },
      { name: 'Status', href: '/dashboard/contracting/status', roles: ['Advisor'] },
    ],
  },  
  {
    name: 'Education',
    href: '/dashboard/education',
    icon: <FaGraduationCap />,
    roles: ['Advisor','Superuser'],
    children: [
      { name: 'Debt Management', href: '/dashboard/education', roles: ['Advisor'] },
      { name: 'Income Protection', href: '/dashboard/education', roles: ['Advisor'] },
      { name: 'Savings & Retirement', href: '/dashboard/education', roles: ['Advisor'] },
      { name: 'Child Education Savings', href: '/dashboard/education', roles: ['Advisor'] },
      { name: 'Legal Services', href: '/dashboard/education', roles: ['Advisor'] }
    ]
  },
  {
    name: 'Affiliates',
    href: '/dashboard/affiliates',
    icon: <FaHandshake />,
    roles: ['Advisor','Superuser','affiliateMarketer'],
    children: [
      { name: 'Mortgage', href: '/dashboard/affiliates', roles: ['Advisor','affiliateMarketer'] },
      { name: 'Debt Solutions', href: '/dashboard/affiliates', roles: ['Advisor','affiliateMarketer'] },
      { name: 'Legal Services & Wills', href: '/dashboard/affiliates', roles: ['Advisor','affiliateMarketer'] },
      { name: 'Home/Auto/Commercial', href: '/dashboard/affiliates', roles: ['Advisor','affiliateMarketer'] },
      { name: 'Accounting/Bookkeeping', href: '/dashboard/affiliates', roles: ['Advisor','affiliateMarketer'] },
      { name: 'Foreign Exchange', href: '/dashboard/affiliates', roles: ['Advisor','affiliateMarketer'] },
      { name: 'Group Benefits', href: '/dashboard/affiliates', roles: ['Advisor','affiliateMarketer'] }
    ]
  },
  {
    name: 'Commission',
    href: '/dashboard/commission',
    icon: <FaTools />,
    roles: ['Superuser'],
    // children: [
    //   { name: 'Beneva', href: '/dashboard/administration/beneva', roles: ['Superuser'] },
    //   { name: 'Upload Commission Logs', href: '/dashboard/administration/commission/upload', roles: ['Superuser'] },
    //   { name: 'List Commission Logs', href: '/dashboard/administration/commission/list', roles: ['Superuser'] },
    //   { name: 'Beneva', href: '/dashboard/administration', roles: ['Superuser'] },
    // ]
  }         
]
'use client'
import Image from "next/image";
import {motion} from "framer-motion";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { useState } from "react";
import Popup from '@/components/Popup/PopupImage';

type Invitation = {
  attributes: {
    inviteCurrentLicense: any;
    inviteExamResults: any;
    inviteName: string;
    inviteEmail: string;
    CIPR: string;
    eoLicense: string;
    licensing: string;
    dateSponsoredOrContracted: string;
    // Add other properties here as needed
  };
}

const TableOne = ({data}: {data: Array<Invitation>}) => {
  const [url, setUrl] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const handleOpenPopup = () => {setShowPopup(true);};
  const handleClosePopup = () => {setShowPopup(false);};
  console.log(data)
  return (
    <motion.div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{delay: 0.2, duration: 1 }}
    >
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Your team
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Name
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              email
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Exam results
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              License
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              E&O 
            </h5>
          </div>
        </div>

        {data && data.map((invitation, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-5 ${
              key === data.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
            key={key}
          >
            <div className="flex items-center justify-center p-2.5 xl:p-5">
              {/* <Image src={invitation?.attributes?.logo} alt="Brand" width={48} height={48} /> */}
              {invitation.attributes.inviteName}
            </div>
            <div className="flex items-center justify-center p-2.5 xl:p-5" >
              <p className="hidden text-black dark:text-white sm:block">
                {invitation.attributes.inviteEmail}
              </p>
            </div>
              {invitation.attributes.inviteExamResults.data != null && (
                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <span className="text-sm font-medium text-black dark:text-white cursor-pointer hover:scale-110"
                    onClick={()=>{setUrl(`${process.env.STRAPI_BACKEND_URL}${invitation.attributes.inviteExamResults.data.attributes.url}`);setShowPopup(true)}}
                  >
                    <IoDocumentAttachOutline size={'1.8rem'} />  
                  </span>
                </div>
              )}
              {invitation.attributes.inviteCurrentLicense.data != null && (
                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <span className="text-sm font-medium text-black dark:text-white cursor-pointer hover:scale-105"
                    onClick={()=>{setUrl(invitation.attributes.inviteCurrentLicense.data.attributes.url);setShowPopup(true)}}
                  >
                    <IoDocumentAttachOutline size={'1.8rem'} />  
                  </span>
                </div>
              )}
              {/* {invitation.attributes.inviteeoLicense.data != null ? (
                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <span className="text-sm font-medium text-black dark:text-white">
                    <IoDocumentAttachOutline size={'1.8rem'} />  
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center p-2.5 xl:p-5">
                  <span className="text-sm font-medium text-black dark:text-white">
                  
                  </span>
                </div>
              )} */}

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
            </div>
          </div>
        ))}
      </div>
      <Popup 
        // url={url + '&Broker_UserName=' + encodeURIComponent(nameInLicense).replaceAll("^\"|\"$", "") +  '&Broker_Email=' + emailForLicense.replaceAll("^\"|\"$", "")  }
        url={url}
        isVisible={showPopup} 
        onClose={handleClosePopup}
      />    
    </motion.div>
  );
};

export default TableOne;

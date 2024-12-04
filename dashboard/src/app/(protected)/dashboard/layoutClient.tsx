"use client";
import "@/app/styles/globals.css";
import "@/app/styles/data-tables-css.css";
import { useState, useEffect } from "react";
import WideSidebar from "@/components/WideSidebar";
import Header from "@/components/Header";
import {motion} from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
// import 'react-quill/dist/quill.snow.css';
// import 'quilljs/dist/quill.snow.css';


export default function RootLayout({children, session}:{children: React.ReactNode, session: any}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // console.log(session)
  return (
    <motion.div className="dark:bg-boxdark-2  dark:text-bodydark"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <WideSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          session={session}
        />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* <!-- ===== Header Start ===== --> */}
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            session={session}
          />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <motion.main
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{delay: 1.3,  duration: 0.6 }}
          >
            <div className="mx-auto max-w-screen-2xl p-4 md:p-4 2xl:p-10">
              {children}
            </div>
          </motion.main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <div className="fixed bottom-4 right-4 z-9999">
        <button className="p-2 bg-primary rounded-full text-white" onClick={toggleChat}>
          Chat
        </button>
        {isChatVisible && (
          <ChatComponent isVisible={isChatVisible} toggleVisibility={toggleChat} topic="Chat" />
           <MainContainer>
             <ChatContainer>
               <MessageList />
               <MessageInput placeholder="Type message here" />
             </ChatContainer>
           </MainContainer>
        )}
      </div>       */}
    </motion.div>
  );
}

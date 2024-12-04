'use client'
import "@/app/styles/globals.css";
import "@/app/styles/data-tables-css.css";
import NextAuthLayout from '@/components/NextAuthLayout';
import { FiMessageSquare } from "react-icons/fi"; // Assuming you're using react-icons for the chat icon
// import { ChatProvider } from "@/context/ChatContext";

// For Google Analytics

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;
import GoogleAnalyticsComponent from "./goolgeAnalytics"
export default function RootLayout({children}: {children: React.ReactNode;}) {

  // const { isChatVisible, chatTopic, chatRecordId } = useChat();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="robots" content="follow, index" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body suppressHydrationWarning={true}>
        <GoogleAnalyticsComponent/>
        {/* <ChatProvider> */}
          <NextAuthLayout>
            {children}
            {/* {isChatVisible && <SimpleChat topic={chatTopic} recordId={chatRecordId} />} */}
          </NextAuthLayout>
        {/* </ChatProvider> */}
      </body>
    </html>
  );
}

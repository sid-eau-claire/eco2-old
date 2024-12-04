// Use client-side
"use client";

import React from 'react';
import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DropdownDefault from "@/components/Dropdowns/DropdownDefault";

// ChatMessage type
type ChatMessageType = {
  imgSrc: string;
  name: string;
  message: string;
};

type ChatProps = {
  chatList: ChatMessageType[];
};

// Chat component
const ChatBox: React.FC<ChatProps> = ({ chatList }) => {
    return (
        <div className="flex h-full flex-col border-l border-stroke dark:border-strokedark xl:w-3/4">
            {/* Chat Box */}
            <div className="sticky flex items-center justify-between border-b border-stroke px-6 py-4.5 dark:border-strokedark">
                <div className="flex items-center">
                    <div className="mr-4.5 h-13 w-full max-w-13 overflow-hidden rounded-full">
                        <Image
                            src="/images/user/user-01.png"
                            alt="avatar"
                            width={52}
                            height={52}
                            className="h-full w-full object-cover object-center"
                        />
                    </div>
                    <div>
                        <h5 className="font-medium text-black dark:text-white">
                            Dynamic User
                        </h5>
                        <p className="text-sm">Reply to message</p>
                    </div>
                </div>
                <div>
                    <DropdownDefault />
                </div>
            </div>
            <div className="no-scrollbar max-h-full space-y-3.5 overflow-auto px-6 py-7.5">
                {chatList.map((chat, index) => (
                    <div key={index} className="max-w-125">
                        <p className="mb-2.5 text-sm font-medium">{chat.name}</p>
                        <div className="mb-2.5 rounded-2xl rounded-tl-none bg-gray py-3 px-5 dark:bg-boxdark-2">
                            <p>{chat.message}</p>
                        </div>
                        <p className="text-xs">Time</p>
                    </div>
                ))}
            </div>
            {/* Message input area */}
            <div className="sticky bottom-0 border-t border-stroke bg-white py-5 px-6 dark:border-strokedark dark:bg-boxdark">
                {/* Input form here */}
            </div>
        </div>
    );
};

// Messages component
const Messages: React.FC = () => {
    const chatList: ChatMessageType[] = [
        {
            imgSrc: "/images/user/user-03.png",
            name: "Henry Dholi",
            message: "I came across your profile and...",
        },
        // Add more chat messages here
    ];

    return (
        <>
            <Breadcrumb pageName="Messages" />
            <div className="h-[calc(100vh-186px)] overflow-hidden sm:h-[calc(100vh-174px)]">
                <div className="h-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:flex">
                    {/* Left panel for chat list or other content */}
                    <ChatBox chatList={chatList} />
                </div>
            </div>
        </>
    );
};

export default ChatBox

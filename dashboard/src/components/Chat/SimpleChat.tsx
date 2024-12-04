// components/SimpleChat.tsx
import React from 'react';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from "@chatscope/chat-ui-kit-react";
// import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

// Assuming IMessage is the interface required by the Message component
interface IMessage {
  message: string;
  sentTime: string;
  sender: string;
  // Add other fields as required by the library's message model
}

interface SimpleChatProps {
  topic: string | null;
  recordId: string | null;
}


const SimpleChat: React.FC<SimpleChatProps> = ({ topic, recordId }) => {
  const message1: IMessage = {
    message: "Hello, this is a test message!",
    sentTime: "just now",
    sender: "John Doe"
  };

  const message2: IMessage = {
    message: "And this is a reply.",
    sentTime: "just now",
    sender: "Jane Doe"
  };

  return (
    <div className="p-4 h-[80vh] max-w-[500px] mx-auto">
      <MainContainer>
        <ChatContainer>
          <MessageList>
            <Message model={message1 as any} />
            <Message model={message2 as any} />
          </MessageList>
          <MessageInput placeholder="Type message here" />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default SimpleChat;

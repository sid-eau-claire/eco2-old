'use client'
import React, { useState, useEffect } from 'react';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, ConversationHeader } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import io from 'socket.io-client';

interface ChatComponentProps {
  isVisible: boolean;
  toggleVisibility: () => void;
  topic: string;
  department: string;
  user: string; // Assume you pass the user's identifier as a prop
}

interface IMessage {
  id: string;
  sender: string;
  content: string;
  // Add other relevant fields
}

// Assuming your WebSocket server is running on port 3001
const socket = io('http://localhost:3001');

const ChatComponent: React.FC<ChatComponentProps> = ({ isVisible, toggleVisibility, topic, department, user }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Example roomId logic - in a real application, this should be securely generated and managed
  const roomId = `${topic}-${department}`;

  useEffect(() => {
    if (isVisible) {
      socket.emit('joinRoom', { roomId });
  
      socket.on('chat message', (newMessage: IMessage) => {
        setMessages(prevMessages => [...prevMessages, newMessage]);
      });
  
      return () => {
        socket.off('chat message');
      };
    }
  }, [isVisible, roomId]);

  const handleSend = () => {
    if (inputValue.trim() === '') return;

    const newMessage: IMessage = {
      id: new Date().toISOString(), // Simple ID generation, consider using UUIDs or similar
      sender: user,
      content: inputValue,
    };

    socket.emit('chat message', { roomId, message: newMessage });
    setInputValue('');
  };

  const determineMessageDirection = (sender: string): "incoming" | "outgoing" => {
    return sender === user ? "outgoing" : "incoming";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-[3.5rem] right-0 h-[80vh] max-w-[50rem] min-w-[30rem] mx-auto">
      <MainContainer>
        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Content userName={topic} />
          </ConversationHeader>
          <MessageList>
            {messages.map((msg, index) => (
              <Message 
                key={index}
                model={{
                  message: msg.content,
                  sentTime: "now", // Adjust based on actual data
                  sender: msg.sender,
                  direction: determineMessageDirection(msg.sender),
                  position: "single",
                }} 
              />
            ))}
          </MessageList>
          <MessageInput 
            value={inputValue} 
            onChange={(e: string) => setInputValue(e)} 
            onSend={handleSend} 
            placeholder="Send message..."
          />
        </ChatContainer>
      </MainContainer>
      <button className="absolute top-0 right-0 p-2 text-xl" onClick={toggleVisibility}>×</button>
    </div>
  );
};

export default ChatComponent;

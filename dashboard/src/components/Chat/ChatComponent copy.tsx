import React, { useState, useEffect } from 'react';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, ConversationHeader } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

interface ChatComponentProps {
  isVisible: boolean;
  toggleVisibility: () => void;
  topic: string;
  department: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  // Add other relevant fields
}

const ChatComponent: React.FC<ChatComponentProps> = ({ isVisible, toggleVisibility, topic, department }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Fetch messages when the component mounts or the topic changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/conversations?topic=${topic}&department=${department}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setMessages(data.messages); // Adjust according to your API response structure
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    if (isVisible) fetchMessages();
  }, [isVisible, topic, department]);

  if (!isVisible) return null;

  // Message sending and input handling logic here...
  const handleSend = async () => {
    const newMessage = {
      sender: "User", // Adjust based on your user identification logic
      content: inputValue,
      topic,
      department,
      // Add any other necessary fields
    };
  
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });
  
      if (!response.ok) throw new Error('Failed to send message');
  
      const savedMessage = await response.json();
      setMessages(prev => [...prev, savedMessage]); // Adjust based on your API response
      setInputValue('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  function determineMessageDirection(sender: string): "incoming" | "outgoing" {
    // Example logic: if the sender matches the current user's username, it's outgoing
    const currentUserUsername = "currentUsername"; // You need to replace this with actual logic to get the current user's identifier
    
    return sender === currentUserUsername ? "outgoing" : "incoming";
  }  

  return (
    <div className="fixed top-[3.5rem] right-0 h-[80vh] max-w-[50rem] min-w[30rem] mx-auto">
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
                  direction: determineMessageDirection(msg.sender), // Implement this function based on your logic
                  position: "single", // Assuming every message is independent
                }} 
              />
            ))}
          </MessageList>
          <MessageInput value={inputValue} onChange={e => setInputValue(e)} onSend={handleSend} placeholder="Send message..." />
        </ChatContainer>
      </MainContainer>
      <button className="absolute top-0 right-0 p-2 text-xl" onClick={toggleVisibility}>×</button>
    </div>
  );
};

export default ChatComponent;

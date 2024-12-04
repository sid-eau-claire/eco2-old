'use client'
import { createContext, useContext, useState, ReactNode, FC } from 'react';

interface ChatContextType {
  isChatVisible: boolean;
  toggleChat: () => void;
  chatTopic: string;
  setChatTopic: (topic: string) => void;
  chatDepartment: string; // New
  setChatDepartment: (department: string) => void; // New
}


const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isChatVisible, setIsChatVisible] = useState<boolean>(false);
  const [chatTopic, setChatTopicState] = useState<string>('');
  const [chatDepartment, setChatDepartmentState] = useState<string>(''); // New state for chat department

  const toggleChat = () => setIsChatVisible(!isChatVisible);
  const setChatTopic = (topic: string) => setChatTopicState(topic);
  const setChatDepartment = (department: string) => setChatDepartmentState(department); // New method to update chat department

  return (
    <ChatContext.Provider value={{
      isChatVisible,
      toggleChat,
      chatTopic,
      setChatTopic,
      chatDepartment, // Provide chatDepartment in context
      setChatDepartment, // Provide setChatDepartment in context
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

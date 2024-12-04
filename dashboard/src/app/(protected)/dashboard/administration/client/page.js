'use client'
import { useEffect, useState } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/message');

    eventSource.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h2>Messages1</h2>
      {messages.map((msg, index) => (
        <div className='bg-white text-black ' key={index}>{msg.message}</div>
      ))}
    </div>
  );
}

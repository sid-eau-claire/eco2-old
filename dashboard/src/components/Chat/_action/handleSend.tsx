'use server'
export const handleSend = async ({user, content, topic, department, setMessages, setInputValue}: {user: string, content: string, topic: string, department: string, setMessages: any, setInputValue: any}) => {
  const newMessage = {
    sender: "User", // Adjust based on your user identification logic
    content: content,
    topic: topic,
    department: department,
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
    setMessages((prev: any[]) => [...prev, savedMessage]); // Adjust based on your API response
    setInputValue('');
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
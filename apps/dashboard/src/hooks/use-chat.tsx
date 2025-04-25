import React, { useEffect } from "react"; 

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type Message = {
  id: string
  content: string
  role: "user" | "assistant"
}

export type Chat = {
  id: string
  title: string
  messages: Message[]
}

export const useChat = () => {
  const [loading, setLoading] = React.useState(false); 
  const [error, setError] = React.useState<string | null>(null);
  const [currentChat, setCurrentChat] = React.useState<Chat>({
    id: "1",
    title: "New conversation",
    messages: [],
  });
  const [chats, setChats] = React.useState<Chat[]>([
    {
      id: "1",
      title: "New conversation",
      messages: [],
    },
  ]); 

  const event = React.useRef<EventSource | null>(null);

  const sendMessage = async (message: string, currentId: string) => {
    setLoading(true);
    setError(null);
    try {
      event.current = new EventSource(`${apiUrl}/chat?prompt=${message}`);  
      console.log("EventSource created:", event.current);
      event.current.onopen = () => {
        setLoading(true);
      }; 
      event.current.onerror = (e) => {
        alert("An error occurred while fetching data.");
        setLoading(false); 
        console.log("error");
        event.current?.close();
      };
      
      event.current.onmessage = (e) => {  
        const data = e.data;     
      };
    } catch (err) {
      console.error("Error:", err);
      alert("An error occurred while sending the message.");
      setLoading(false);
      event.current?.close();
    }  
    setLoading(false);
  }; 

  useEffect(() => {
    if(event.current) {
      event.current.close();
    }
  }, []);

  return {
    loading,
    setLoading,
    sendMessage,
    setCurrentChat,
    currentChat,
    chats,
    setChats,
  };
};


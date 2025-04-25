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
  const [streaming, setStreaming] = React.useState(false);

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
      event.current.onopen = () => {
        setLoading(true);
      };  
      event.current.onmessage = (e) => {  
        const data = e.data;     
        if (data === "[DONE]") {
          setLoading(false);
          event.current?.close();
          setStreaming(() => false);
          return;
        } else { 
          setStreaming(() => true);
          setCurrentChat((prevChat) => {
            const updatedMessages = prevChat.messages.map((msg) => {
              if (msg.id === currentId) {
                return {
                  ...msg,
                  content: msg.content + data,
                };
              }
              return msg;
            });
            return {
              ...prevChat,
              messages: updatedMessages,
            };
          });
        }
      }; 

      event.current.onerror = (e) => { 
        setLoading(false); 
        event.current?.close();
      };

    } catch (err) {
      console.error("Error:", err); 
      setLoading(false);
      event.current?.close();
    }  
    setLoading(false);
  }; 

  useEffect(() => { 
    if (event.current) {
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
    streaming,
    setChats,
  };
};


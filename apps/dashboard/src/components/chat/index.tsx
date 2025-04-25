import { useState, useRef, useEffect } from "react"; 
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Sidebar } from "@repo/ui/components/chat/sidebar";
import { ChatMessage } from "@repo/ui/components/chat/chat-message";
import { Loader2 } from "lucide-react"; 
import { useChat, type Message, type Chat } from "@/hooks/use-chat"; 
 
export const LLMChat:React.FC = () => {
  const { sendMessage, chats, setChats, currentChat, setCurrentChat, loading, streaming } = useChat();  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputValue, setInputValue] = useState(""); 
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat.messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
 
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
    };

    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage],
    };

    setCurrentChat(updatedChat);
    setChats(chats.map((chat) => (chat.id === currentChat.id ? updatedChat : chat)));
    setInputValue(""); 

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: "",
      role: "assistant",
    };

    const chatWithAssistantMessage = {
      ...updatedChat,
      messages: [...updatedChat.messages, assistantMessage],
    };

    setCurrentChat(chatWithAssistantMessage);
    setChats(chats.map((chat) => (chat.id === currentChat.id ? chatWithAssistantMessage : chat)));
    setTypingMessageId(assistantMessageId);

    try {  
      await sendMessage(inputValue, assistantMessageId); 
 
    } catch (error) {
      console.error("Error streaming response:", error);
 
      setCurrentChat((prevChat) => {
        const updatedMessages = prevChat.messages.map((msg) => {
          if (msg.id === assistantMessageId) {
            return {
              ...msg,
              content: "Error occured. Please try again.",
            };
          }
          return msg;
        });

        const updatedChat = {
          ...prevChat,
          messages: updatedMessages,
        };

        setChats((prevChats) => prevChats.map((chat) => (chat.id === currentChat.id ? updatedChat : chat)));
        setTypingMessageId(null);
        return updatedChat;
      });
 
    }
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New conversation",
      messages: [],
    };
    setChats([...chats, newChat]);
    setCurrentChat(newChat);
  };

  const handleSelectChat = (chat: Chat) => {
    setCurrentChat(chat);
  };

  const handleDeleteChat = (chatId: string) => {
    const updatedChats = chats.filter((chat) => chat.id !== chatId);
    setChats(updatedChats);

    if (currentChat.id === chatId) {
      if (updatedChats.length > 0) {
        setCurrentChat(updatedChats[0]);
      } else {
        handleNewChat();
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden"> 
      <Sidebar
        chats={chats}
        currentChat={currentChat}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
 
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {currentChat.messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md text-center">
                <h2 className="mb-2 text-2xl font-bold">Welcome to AI Chat</h2>
                <p className="text-muted-foreground">
                  Start a conversation with the AI assistant by typing a message below.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-20">
              {currentChat.messages.map((message) => {
                if(message.id === typingMessageId && streaming) return;
                return <ChatMessage key={message.id} message={message} isTyping={message.id === typingMessageId} />;
              })}
              {streaming && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
 
        <div className="border-t bg-background p-4">
          <div className="mx-auto flex max-w-3xl items-center space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button onClick={handleSend} disabled={!inputValue.trim() || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

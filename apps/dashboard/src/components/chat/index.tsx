"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Sidebar } from "@repo/ui/components/chat/sidebar";
import { ChatMessage } from "@repo/ui/components/chat/chat-message";
import { Loader2 } from "lucide-react"; 

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
}

type Chat = {
  id: string
  title: string
  messages: Message[]
}

export function Chat() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentChat, setCurrentChat] = useState<Chat>({
    id: "1",
    title: "New conversation",
    messages: [],
  });
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      title: "New conversation",
      messages: [],
    },
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat.messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // Add user message
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
    setIsLoading(true);
    setIsStreaming(true);

    // Create a placeholder for the assistant's response
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

    try {
      // Prepare the prompt from conversation history
      const conversationHistory = updatedChat.messages
        .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
        .join("\n\n");

      const prompt = `${conversationHistory}\n\nUser: ${userMessage.content}\n\nAssistant:`;
 
 
    } catch (error) {
      console.error("Error streaming response:", error);

      // Update the assistant message to show the error
      setCurrentChat((prevChat) => {
        const updatedMessages = prevChat.messages.map((msg) => {
          if (msg.id === assistantMessageId) {
            return {
              ...msg,
              content: "I'm sorry, there was an error generating a response. Please try again.",
            };
          }
          return msg;
        });

        const updatedChat = {
          ...prevChat,
          messages: updatedMessages,
        };

        setChats((prevChats) => prevChats.map((chat) => (chat.id === currentChat.id ? updatedChat : chat)));

        return updatedChat;
      });

      setIsLoading(false);
      setIsStreaming(false);
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
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        currentChat={currentChat}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main content */}
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
              {currentChat.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isStreaming && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">AI is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t bg-background p-4">
          <div className="mx-auto flex max-w-3xl items-center space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button onClick={handleSend} disabled={!inputValue.trim() || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

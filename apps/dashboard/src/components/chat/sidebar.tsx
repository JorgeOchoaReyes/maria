 
import { ChevronLeft, ChevronRight, MessageSquare, Plus, Trash } from "lucide-react"; 
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { motion } from "framer-motion";

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

interface SidebarProps {
  chats: Chat[]
  currentChat: Chat
  onSelectChat: (chat: Chat) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void 
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function Sidebar({
  chats,
  currentChat,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  setIsOpen,
}: SidebarProps) {
  return (
    <>
      <motion.div
        className={cn(
          "fixed inset-y-0 z-50 flex w-72 flex-col border-r bg-background duration-300 ease-in-out md:relative transition-all",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16",
        )}   
        role="button"
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          {isOpen ? (
            <h2 className="text-lg font-semibold">Conversations</h2>
          ) : (
            <span className="sr-only">Conversations</span>
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="md:flex">
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>
        <div className="p-2">
          <Button onClick={onNewChat} className={cn("w-full justify-start", !isOpen && "px-2")}>
            <Plus className="mr-2 h-4 w-4" />
            {isOpen && <span>New Chat</span>}
          </Button>
        </div>
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-2 py-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm",
                  chat.id === currentChat.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
                  !isOpen && "justify-center",
                )}
                onClick={() => onSelectChat(chat)}
              >
                <div className="flex items-center">
                  <MessageSquare className={cn("h-4 w-4", isOpen && "mr-2")} />
                  {isOpen && <span className="line-clamp-1">{chat.title || "New conversation"}</span>}
                </div>
                {isOpen && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                    <Trash className="h-3 w-3" />
                    <span className="sr-only">Delete</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </motion.div> 
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

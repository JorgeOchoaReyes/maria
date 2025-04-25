import { useState, useEffect, useRef } from "react";
import { cn } from "@repo/ui/lib/utils";
import { Avatar } from "@repo/ui/components/ui/avatar";
import { Bot, CheckIcon, CopyIcon, User } from "lucide-react"; 
import { CodeBlock, dracula, } from "react-code-blocks";
import { Button } from "@repo/ui/components/ui/button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
}

interface ChatMessageProps {
  message: Message
  isTyping?: boolean
  typingSpeed?: number
}

export function ChatMessage({ message, isTyping = false, typingSpeed = 1 }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [displayedContent, setDisplayedContent] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const contentRef = useRef(message.content);
 
  const processMessageContent = (content: string) => { 
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    const parts = [];
    let lastIndex = 0;
    let match;
 
    while ((match = codeBlockRegex.exec(content)) !== null) { 
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        });
      }
 
      parts.push({
        type: "code",
        language: match[1] || "javascript",  
        content: match[2].trim(),
      });

      lastIndex = match.index + match[0].length;
    }
 
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }
 
    if (parts.length === 0) {
      parts.push({
        type: "text",
        content,
      });
    }

    return parts;
  };
 
  useEffect(() => { 
    if (contentRef.current !== message.content) {
      contentRef.current = message.content;
      setDisplayedContent("");
      setCurrentIndex(0);
      setIsComplete(false);
    }
 
    if (!isUser && isTyping && !isComplete && message.content) {
      const timer = setTimeout(() => {
        if (currentIndex < message.content.length) {
          setDisplayedContent((prev) => prev + message.content[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        } else {
          setIsComplete(true);
        }
      }, typingSpeed);

      return () => clearTimeout(timer);
    }
  }, [isUser, isTyping, message.content, currentIndex, isComplete, typingSpeed]);
 
  const contentToProcess = !isUser && isTyping && !isComplete ? displayedContent : message.content;
  const messageParts = processMessageContent(contentToProcess);
 
  const showCursor = !isUser && isTyping && !isComplete;

  return (
    <div className={cn("flex items-start gap-4 rounded-lg p-4", isUser ? "bg-muted/50" : "bg-background")}>
      <Avatar className={cn("h-8 w-8", !isUser && "bg-primary text-primary-foreground")}>
        {isUser ? <User className="h-8 w-8" /> : <Bot className="h-8 w-8" />}
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="font-medium">{isUser ? "You" : "AI Assistant"}</div>
        <div className="prose prose-sm dark:prose-invert">
          {messageParts.map((part, index) => {
            if (part.type === "text") {
              return (
                <div key={index} className="whitespace-pre-wrap">
                  <Markdown key={index} remarkPlugins={[remarkGfm]}>
                    {part.content}  
                  </Markdown> 
                  {showCursor && index === messageParts.length - 1 && <span className="typing-cursor">|</span>}
                </div>
              );
            } else if (part.type === "code") {
              return <CodeDisplayBlock key={index} code={part.content} lang={part.language ?? "js"} />;
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}


interface ButtonCodeblockProps {
  code: string;
  lang: string;
  _theme?: string;
}

function CodeDisplayBlock({ code, lang, _theme }: ButtonCodeblockProps) {
  const [isCopied, setisCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator?.clipboard?.writeText(code);
    setisCopied(true); 
    setTimeout(() => {
      setisCopied(false);
    }, 1500);
  };

  return (
    <div className="relative flex flex-col text-start">
      <Button
        onClick={copyToClipboard}
        variant="ghost"
        size="icon"
        className="h-5 w-5 absolute top-2 right-2"
      >
        {isCopied ? (
          <CheckIcon className="w-4 h-4 scale-100 transition-all" />
        ) : (
          <CopyIcon className="w-4 h-4 scale-100 transition-all" />
        )}
      </Button>
      <CodeBlock
        customStyle={  { background: "#303033" } }
        text={code}
        language="tsx"
        showLineNumbers={false}
        theme={ dracula }
      />
    </div>
  );
}
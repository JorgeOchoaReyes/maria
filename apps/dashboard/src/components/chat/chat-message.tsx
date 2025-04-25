"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@repo/ui/lib/utils";
import { Avatar } from "@repo/ui/components/ui/avatar";
import { Bot, Check, Copy, User } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
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
              return <CodeBlock key={index} code={part.content} language={part.language ?? "js"} />;
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-md bg-zinc-950">
      <div className="flex items-center justify-between rounded-t-md bg-zinc-800 px-4 py-2">
        <span className="text-xs text-zinc-400">{language}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: "0 0 0.375rem 0.375rem",
          padding: "1rem",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

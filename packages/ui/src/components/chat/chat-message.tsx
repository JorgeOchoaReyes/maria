"use client"

import { useState } from "react"
import { cn } from "../../lib/utils"
import { Avatar } from "../../components/ui/avatar"
import { Bot, Check, Copy, User } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Button } from "../../components/ui/button"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  // Process message content to identify code blocks
  const processMessageContent = (content: string) => {
    // Regular expression to match markdown code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g

    const parts = []
    let lastIndex = 0
    let match

    // Find all code blocks in the message
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before the code block
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        })
      }

      // Add the code block
      parts.push({
        type: "code",
        language: match[1] || "javascript", // Default to javascript if language not specified
        content: match[2].trim(),
      })

      lastIndex = match.index + match[0].length
    }

    // Add any remaining text after the last code block
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      })
    }

    // If no code blocks were found, return the entire content as text
    if (parts.length === 0) {
      parts.push({
        type: "text",
        content,
      })
    }

    return parts
  }

  const messageParts = processMessageContent(message.content)

  return (
    <div className={cn("flex items-start gap-4 rounded-lg p-4", isUser ? "bg-muted/50" : "bg-background")}>
      <Avatar className={cn("h-8 w-8", !isUser && "bg-primary text-primary-foreground")}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="font-medium">{isUser ? "You" : "AI Assistant"}</div>
        <div className="prose prose-sm dark:prose-invert">
          {messageParts.map((part, index) => {
            if (part.type === "text") {
              return (
                <div key={index} className="whitespace-pre-wrap">
                  {part.content}
                </div>
              )
            } else if (part.type === "code") {
              return <CodeBlock key={index} code={part.content} language={part.language ?? "js"} />
            }
            return null
          })}
        </div>
      </div>
    </div>
  )
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
  )
}

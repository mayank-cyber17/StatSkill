import React, { useState, useEffect, useRef } from 'react'
import { assistantAPI } from '../../services/api'
import { 
  MessageSquare, Send, Sparkles, User, Brain, Bot, Lightbulb, 
  Plus, Trash2, Copy, Check, RefreshCw, Zap, Flame, Compass, Code, BookOpen
} from 'lucide-react'
import toast from 'react-hot-toast'

// Formatter component to cleanly render Markdown, code blocks, lists, and bold text
function FormattedContent({ content }) {
  const [copiedIndex, setCopiedIndex] = useState(null)

  const handleCopyCode = (codeText, idx) => {
    navigator.clipboard.writeText(codeText)
    setCopiedIndex(idx)
    toast.success('Code copied to clipboard!')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Split into code blocks vs text blocks
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-3 leading-relaxed text-sm">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // Code block
          const lines = part.slice(3, -3).trim().split('\n')
          const firstLine = lines[0].trim()
          const language = /^[a-zA-Z0-9_-]+$/.test(firstLine) ? firstLine : ''
          const codeBody = language ? lines.slice(1).join('\n') : lines.join('\n')

          return (
            <div key={index} className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 my-2 font-mono text-xs shadow-lg">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700 dark:border-white/10 text-slate-300 dark:text-slate-400">
                <span className="text-[11px] font-semibold tracking-wide uppercase text-brand-400">
                  {language || 'code'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeBody, index)}
                  className="flex items-center gap-1 text-[11px] hover:text-white transition-colors px-2 py-0.5 rounded bg-white/5 hover:bg-white/10"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-emerald-300 font-mono leading-normal select-text">
                <code>{codeBody}</code>
              </pre>
            </div>
          )
        }

        // Regular text block - process lines for headers, bullet points, and inline bold/code
        const lines = part.split('\n')
        return (
          <div key={index} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim()
              if (!trimmed) return <div key={lineIdx} className="h-1.5" />

              // Header 3 or 2
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lineIdx} className="text-base font-bold pt-2 pb-0.5 text-brand-700 dark:text-brand-300">
                    {parseInline(trimmed.replace(/^###\s+/, ''))}
                  </h4>
                )
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lineIdx} className="text-lg font-bold pt-2 pb-1 text-accent-700 dark:text-accent-300">
                    {parseInline(trimmed.replace(/^##\s+/, ''))}
                  </h3>
                )
              }

              // Bullet points
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-brand-500 dark:text-brand-400 text-sm mt-0.5">•</span>
                    <span className="flex-1 text-slate-700 dark:text-slate-200">
                      {parseInline(trimmed.replace(/^[-*]\s+/, ''))}
                    </span>
                  </div>
                )
              }

              // Numbered list
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
              if (numMatch) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2">
                    <span className="font-semibold text-brand-600 dark:text-brand-400 text-xs mt-0.5 min-w-[1.2rem]">
                      {numMatch[1]}.
                    </span>
                    <span className="flex-1 text-slate-700 dark:text-slate-200">
                      {parseInline(numMatch[2])}
                    </span>
                  </div>
                )
              }

              return (
                <p key={lineIdx} className="text-slate-700 dark:text-slate-200">
                  {parseInline(line)}
                </p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// Inline parser for **bold** and `code`
function parseInline(text) {
  if (!text) return ''
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-surface-900 border border-slate-300 dark:border-white/10 text-brand-700 dark:text-brand-300 font-mono text-[12px]">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

export default function AssistantPage() {
  const [conversations, setConversations] = useState([])
  const [activeConvId, setActiveConvId] = useState(null)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ASSISTANT',
      content: "👋 **Namaste! I am InnoWing**, your dedicated AI Assistant on Innovexa.\n\nI am a live, full-spectrum AI model ready to help with **any question or task** — without fixed scripts or limitations!\n\nHere is how I can assist you:\n- 📊 **Official Statistics & Methodologies** (Sampling design, CPI/WPI index calculations, National Accounts)\n- 💻 **Python, R & Data Science Code** (Data wrangling, regression models, pandas manipulation)\n- 🎯 **iGOT Karmayogi & NSSTA Guidance** (Course recommendations, exam preparation, competency mapping)\n- 🧠 **Concept Explanations & Step-by-Step Problem Solving** (Clear breakdowns of complex problems)\n\nWhat would you like to explore or solve today?",
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const quickPrompts = [
    { label: 'CPI vs WPI vs GDP Deflator', text: 'Explain the core conceptual and mathematical differences between CPI, WPI, and the GDP Deflator in India.' },
    { label: 'Python: Variance & StDev', text: 'Write a Python function with NumPy and Pandas to compute population vs sample variance and standard deviation.' },
    { label: 'Stratified vs Cluster Sampling', text: 'Compare Stratified Random Sampling and Cluster Sampling with real-world examples from National Sample Surveys (NSS).' },
    { label: 'iGOT Karmayogi Roadmap', text: 'What is the recommended iGOT Karmayogi learning pathway for an official aiming to specialize in Data Science & Official Statistics?' },
    { label: 'Solve GVA to GDP Formula', text: 'How is GVA at basic prices converted into GDP at market prices? Walk me through the exact formula with subsidies and taxes.' },
    { label: 'Create 5 Practice MCQs', text: 'Generate 5 practice multiple-choice questions on probability distributions and hypothesis testing with answer explanations.' },
  ]

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const res = await assistantAPI.getConversations()
      const convList = res.data || []
      setConversations(convList)
      if (convList.length > 0 && !activeConvId) {
        selectConversation(convList[0].id)
      }
    } catch (err) {
      console.warn('Could not load conversations:', err)
    }
  }

  const selectConversation = async (convId) => {
    setActiveConvId(convId)
    try {
      const res = await assistantAPI.getMessages(convId)
      if (res.data && res.data.length > 0) {
        setMessages(res.data)
      } else {
        setMessages([
          {
            id: 'welcome-' + convId,
            role: 'ASSISTANT',
            content: "👋 **I am InnoWing**, your live AI assistant. Ask me anything on statistics, data science, coding, or learning pathways!",
          },
        ])
      }
    } catch (err) {
      console.error('Error fetching messages for conversation:', err)
    }
  }

  const handleNewChat = async () => {
    try {
      const res = await assistantAPI.createConversation()
      const newConv = res.data
      setConversations((prev) => [newConv, ...prev])
      setActiveConvId(newConv.id)
      setMessages([
        {
          id: 'welcome-' + newConv.id,
          role: 'ASSISTANT',
          content: "👋 **New conversation started with InnoWing!**\n\nAsk any question, request code, or explore complex statistical topics. How can I help you right now?",
        },
      ])
    } catch (err) {
      setActiveConvId(null)
      setMessages([
        {
          id: 'welcome-new',
          role: 'ASSISTANT',
          content: "👋 **Hello! I am InnoWing.** Ask me any question, request code, or explore statistical concepts!",
        },
      ])
    }
  }

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation()
    try {
      await assistantAPI.deleteConversation(convId)
      setConversations((prev) => prev.filter((c) => c.id !== convId))
      toast.success('Conversation removed')
      if (activeConvId === convId) {
        const remaining = conversations.filter((c) => c.id !== convId)
        if (remaining.length > 0) {
          selectConversation(remaining[0].id)
        } else {
          handleNewChat()
        }
      }
    } catch (err) {
      toast.error('Failed to delete conversation')
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (textToSend) => {
    const msgText = textToSend || input
    if (!msgText.trim()) return

    const userMsg = { id: Date.now(), role: 'USER', content: msgText }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const targetConvId = activeConvId || 0
      const res = await assistantAPI.sendMessage(targetConvId, { content: msgText })
      
      // Update active conversation ID if it was auto-created
      if (res.data.conversation_id && res.data.conversation_id !== activeConvId) {
        setActiveConvId(res.data.conversation_id)
        loadConversations()
      }

      // Extract real AI response (support both .content and .message)
      const aiReply = res.data.content || res.data.message || "I am InnoWing, your active assistant. Could you please rephrase or elaborate your query?"
      
      setMessages((prev) => [
        ...prev, 
        { 
          id: res.data.id || Date.now() + 1, 
          role: 'ASSISTANT', 
          content: aiReply 
        }
      ])
    } catch (err) {
      console.error('Assistant error:', err)
      // Dynamic fallback handling
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ASSISTANT',
          content: `### InnoWing Response\n\nI processed your request regarding: **"${msgText}"**.\n\n*InnoWing is currently connecting with the live Gemini AI engine.* If you're seeing this, ensure your backend server is active on \`http://localhost:8000\`. You can ask me any statistical questions, coding inquiries, or official methodologies!`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Response copied to clipboard')
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-130px)] flex gap-4">
      {/* Sessions Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white/80 dark:bg-surface-800/70 border border-slate-200 dark:border-white/10 rounded-2xl p-3 shrink-0 backdrop-blur-md">
        <button
          onClick={handleNewChat}
          className="btn btn-primary w-full flex items-center justify-center gap-2 mb-3 py-2 text-sm shadow-glow font-medium"
        >
          <Plus className="w-4 h-4" /> New InnoWing Chat
        </button>

        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 py-1 mb-1">
          Recent Conversations
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="text-xs text-slate-400 dark:text-slate-500 text-center py-6 px-2">
              No saved chats yet. Start asking InnoWing!
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                  activeConvId === c.id
                    ? 'bg-brand-600 text-white font-medium shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-brand-400 dark:text-brand-300" />
                  <span className="truncate">{c.title || 'Chat with InnoWing'}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(e, c.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 transition-opacity p-1 rounded"
                  title="Delete chat"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Status Pill */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/10 mt-auto flex items-center gap-2 px-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">InnoWing Engine Ready</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-white/80 dark:bg-surface-800/60 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-surface-800/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white shadow-glow">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-display font-bold text-slate-900 dark:text-white tracking-tight">
                  InnoWing <span className="text-brand-500 dark:text-brand-400">AI</span>
                </h1>
                <span className="badge badge-success text-[10px] py-0.5 px-2 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active AI Model
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Innovexa's Real Active AI Assistant • Powered by Google Gemini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="md:hidden btn btn-ghost text-xs border border-slate-200 dark:border-white/10"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-50/30 dark:bg-transparent">
          {messages.map((m, idx) => (
            <div
              key={m.id || idx}
              className={`flex gap-3 ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'ASSISTANT' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white shrink-0 shadow-glow mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 transition-all shadow-md ${
                  m.role === 'USER'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-surface-900/90 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-bl-none'
                }`}
              >
                {m.role === 'ASSISTANT' ? (
                  <div>
                    <FormattedContent content={m.content} />
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200 dark:border-white/10 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Sparkles className="w-3 h-3 text-brand-500 dark:text-brand-400" /> InnoWing Intelligence
                      </span>
                      <button
                        onClick={() => handleCopyMessage(m.content)}
                        className="hover:text-slate-700 dark:hover:text-white transition-colors flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10"
                        title="Copy text"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed text-sm font-medium">
                    {m.content}
                  </p>
                )}
              </div>

              {m.role === 'USER' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-surface-700 flex items-center justify-center text-brand-600 dark:text-brand-300 shrink-0 border border-slate-300 dark:border-white/10 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white shrink-0 animate-pulse shadow-glow">
                <Brain className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-surface-900/90 border border-slate-200 dark:border-white/10 rounded-2xl rounded-bl-none p-4 text-xs text-slate-500 dark:text-slate-300 flex items-center gap-2.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-slate-400 italic">InnoWing is analyzing and synthesizing response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2 border-t border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-surface-850/40 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500 dark:text-amber-400" /> Ideas:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.text)}
              className="text-xs shrink-0 bg-white dark:bg-surface-700/60 hover:bg-brand-50 dark:hover:bg-brand-600/30 text-slate-600 dark:text-slate-300 hover:text-brand-700 dark:hover:text-white px-3 py-1 rounded-full border border-slate-300 dark:border-white/10 transition-all flex items-center gap-1.5 shadow-sm"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-850 flex gap-2 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask InnoWing anything: stats, coding, calculations, or platform questions..."
            className="input flex-1 bg-white dark:bg-surface-900 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 text-sm py-3 px-4 rounded-xl"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn btn-primary px-5 py-3 rounded-xl shadow-glow font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask InnoWing</span>
          </button>
        </form>
      </div>
    </div>
  )
}

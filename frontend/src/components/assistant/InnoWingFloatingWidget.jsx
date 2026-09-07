import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { assistantAPI } from '../../services/api'
import { Sparkles, Bot, Send, X, Maximize2, User, Brain, Lightbulb } from 'lucide-react'

export default function InnoWingFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ASSISTANT',
      content: "👋 Hi! I am **InnoWing**, your active AI assistant. Ask me anything about statistics, coding, quizzes, or learning paths!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeConvId, setActiveConvId] = useState(null)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Auto-scroll inside widget
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loading, isOpen])

  // Don't show floating widget if already on the dedicated /assistant page
  if (location.pathname === '/assistant') {
    return null
  }

  const handleSend = async (textToSend) => {
    const msgText = textToSend || input
    if (!msgText.trim()) return

    const userMsg = { id: Date.now(), role: 'USER', content: msgText }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await assistantAPI.sendMessage(activeConvId || 0, { content: msgText })
      if (res.data.conversation_id) {
        setActiveConvId(res.data.conversation_id)
      }
      const aiReply = res.data.content || res.data.message || "I am InnoWing. How else may I assist you?"
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ASSISTANT', content: aiReply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'ASSISTANT',
          content: "I received your query. InnoWing is currently operating in offline mode or connecting with Gemini.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[390px] h-[520px] bg-surface-900 border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-surface-800 to-surface-850 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white shadow-glow">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-sm text-white">InnoWing AI</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[10px] text-slate-400">Active AI Assistant</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/assistant')
                }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Open Full Page"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-xs">
            {messages.map((m, idx) => (
              <div
                key={m.id || idx}
                className={`flex gap-2 ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'ASSISTANT' && (
                  <div className="w-6 h-6 rounded-md bg-gradient-brand flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3 rounded-xl ${
                    m.role === 'USER'
                      ? 'bg-brand-600 text-white rounded-br-none font-medium'
                      : 'bg-surface-800 border border-white/10 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
                {m.role === 'USER' && (
                  <div className="w-6 h-6 rounded-md bg-surface-700 flex items-center justify-center text-brand-300 shrink-0 mt-0.5 border border-white/10">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start items-center">
                <div className="w-6 h-6 rounded-md bg-gradient-brand flex items-center justify-center text-white shrink-0 animate-pulse">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <div className="bg-surface-800 border border-white/10 px-3 py-2 rounded-xl text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 border-t border-white/10 bg-surface-850/50 flex gap-1.5 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => handleSend('What is the formula for CPI?')}
              className="text-[10px] shrink-0 bg-surface-700/60 hover:bg-brand-600/30 text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-white/10 transition-colors"
            >
              CPI formula
            </button>
            <button
              onClick={() => handleSend('Explain Stratified Sampling')}
              className="text-[10px] shrink-0 bg-surface-700/60 hover:bg-brand-600/30 text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-white/10 transition-colors"
            >
              Sampling
            </button>
            <button
              onClick={() => handleSend('Help me with python pandas')}
              className="text-[10px] shrink-0 bg-surface-700/60 hover:bg-brand-600/30 text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-white/10 transition-colors"
            >
              Python Pandas
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3 border-t border-white/10 bg-surface-850 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask InnoWing..."
              className="input flex-1 text-xs py-2 px-3 bg-surface-900 border-white/10 text-white rounded-lg focus:border-brand-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary px-3 py-2 rounded-lg text-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-brand text-white shadow-glow hover:scale-105 transition-all duration-200 border border-white/20 active:scale-95"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-surface-900 animate-ping" />
        </div>
        <span className="font-display font-semibold text-sm tracking-wide">
          {isOpen ? 'Close InnoWing' : 'Ask InnoWing AI'}
        </span>
      </button>
    </div>
  )
}

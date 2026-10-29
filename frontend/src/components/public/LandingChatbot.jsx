import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RotateCcw,
  Minus,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/").replace(/\/+$/, "") + "/";

const INITIAL_SUGGESTIONS = [
  "How does the 5-project Free Trial work?",
  "How do Vendor Deliverables and QA work?",
  "How do Clients pay Invoices via Razorpay?",
  "What are the 4 user roles?",
];

export default function LandingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      sender: "ai",
      text: "👋 Hi there! I'm the **InvoiceFlow AI Assistant**.\n\nAsk me anything about our multi-tenant workspaces, 5-project free trial, vendor QA approvals, or instant Razorpay payments!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}public-ai-chatbot/`, {
        message: query,
      });

      if (response.data && response.data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: response.data.reply,
            timestamp: new Date(),
          },
        ]);
        if (response.data.suggestions && response.data.suggestions.length > 0) {
          setSuggestions(response.data.suggestions);
        }
      }
    } catch (err) {
      // Fallback local intelligence
      let fallbackReply = "InvoiceFlow is an all-in-one multi-tenant billing & operations platform with built-in vendor QA workflows, 5-project free trial, and Razorpay/UPI invoicing.";
      
      const lower = query.toLowerCase();
      if (lower.includes("trial") || lower.includes("free") || lower.includes("cost") || lower.includes("price")) {
        fallbackReply = "✨ **5-Project Free Trial:** Every new business workspace automatically gets 5 free projects with full invoicing, vendor management, and client portal features! No credit card required.";
      } else if (lower.includes("vendor") || lower.includes("deliverable") || lower.includes("task")) {
        fallbackReply = "💼 **Vendor Workflow:** Admins assign tasks to vendors. Vendors upload deliverables in the Vendor Portal. Admins review and QA before sending to clients for final acceptance.";
      } else if (lower.includes("invoice") || lower.includes("pay") || lower.includes("razorpay")) {
        fallbackReply = "💳 **Invoicing & Payments:** Generate itemized tax invoices. Clients pay instantly via Razorpay, UPI, or cards. Invoices auto-update to PAID status upon completion.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: fallbackReply,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        sender: "ai",
        text: "👋 Chat reset! How else can I assist you with InvoiceFlow?",
        timestamp: new Date(),
      },
    ]);
    setSuggestions(INITIAL_SUGGESTIONS);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Chat Window Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[360px] sm:w-[420px] h-[540px] max-h-[85vh] rounded-3xl border border-purple-500/30 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-purple-950/50 flex flex-col overflow-hidden text-white"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-blue-600/30 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-500/30">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black tracking-tight text-white">InvoiceFlow AI</h4>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">Instant Platform Intelligence</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={resetChat}
                  title="Reset conversation"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-7 h-7 rounded-xl bg-purple-600/40 border border-purple-400/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles size={14} className="text-purple-300" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-purple-600/20"
                        : "bg-slate-800/80 border border-white/10 text-slate-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === "user" && (
                    <div className="w-7 h-7 rounded-xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={14} className="text-indigo-300" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 justify-start items-center">
                  <div className="w-7 h-7 rounded-xl bg-purple-600/40 border border-purple-400/30 flex items-center justify-center shrink-0">
                    <Sparkles size={14} className="text-purple-300 animate-spin" />
                  </div>
                  <div className="px-3.5 py-2.5 rounded-2xl bg-slate-800/80 border border-white/10 text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {suggestions.length > 0 && (
              <div className="px-4 py-2 border-t border-white/5 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(sug)}
                    className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>{sug}</span>
                    <ArrowRight size={10} />
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-white/10 bg-slate-900 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about InvoiceFlow..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold disabled:opacity-40 hover:opacity-95 transition-all shadow-md shadow-purple-600/30 cursor-pointer"
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold shadow-xl shadow-purple-900/50 flex items-center gap-2.5 border border-white/20 cursor-pointer transition-all hover:shadow-purple-600/50"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>

        {isOpen ? (
          <>
            <X size={18} />
            <span className="text-xs font-black tracking-wide">Close AI</span>
          </>
        ) : (
          <>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={14} className="text-amber-300" />
            </div>
            <span className="text-xs font-black tracking-wide">Ask AI Assistant</span>
          </>
        )}
      </motion.button>
    </div>
  );
}

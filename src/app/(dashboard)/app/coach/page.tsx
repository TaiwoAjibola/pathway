"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bot, Send, Sparkles, Lightbulb, AlertTriangle, TrendingUp, ChevronRight, User, Loader2 } from "lucide-react"

const suggestedQuestions = [
  "What should I do next?",
  "How can I improve my CRS score?",
  "Is my timeline on track?",
  "What documents are still missing?",
  "How long will my application take?",
  "Should I consider PNP?",
]

const initialMessages = [
  {
    role: "bot",
    content: "Hi! I'm your AI Immigration Coach. I have full context of your Canada Express Entry journey. Ask me anything about your application, or I can proactively guide you.",
    timestamp: new Date().toISOString(),
  },
  {
    role: "bot",
    content: "⚠️ **Heads up**: Your WES application hasn't started yet. This is on the critical path and typically takes 6-12 weeks. I recommend prioritizing this this week.",
    timestamp: new Date().toISOString(),
    isProactive: true,
  },
]

const botResponses: Record<string, string> = {
  "What should I do next?": "Based on your current progress, here's your **next best action**:\n\n1. **Submit WES Application** (Critical) — You've gathered your education documents. Apply to WES now. This takes 6-12 weeks and blocks your Express Entry profile.\n\n2. **Book IELTS Test** (High) — You can do this in parallel with WES. Aim for CLB 9 to maximize CRS points.\n\n3. **Request Reference Letters** (High) — Give your employers advance notice while you wait for WES/IELTS.\n\nYour priority should be WES this week. Would you like me to walk you through the WES application process?",
  "How can I improve my CRS score?": "Your current CRS is **456**. Here's your biggest opportunities:\n\n| Improvement | Points | Effort |\n|---|---|---|\n| 🇫🇷 French NCLC 7 | **+24** | 6-12 months |\n| 📝 IELTS CLB 9 | **+9** | 2-3 months |\n| 💼 1 more year exp | **+8** | 3-12 months |\n| 🎓 Master's degree | **+15** | 1-2 years |\n| 🏛️ PNP Nomination | **+600** | 3-6 months |\n\n**Quickest win**: Improving IELTS to CLB 9. Your writing at 6.5 is the weakest area — a 1-band improvement there adds significant points.\n\nWould you like a detailed study plan?",
  "Is my timeline on track?": "Let me analyze your timeline:\n\n✅ **On track**: Planning, Eligibility, Document Gathering\n⚠️ **At risk**: Credential Assessment — hasn't started yet\n\nYour projected submission is **December 15, 2026**, which gives you **162 days**.\n\n**Risks**:\n- WES delays (currently averaging 8 weeks)\n- Police certificate (Nigeria can take 4-8 weeks)\n- IELTS scheduling (some centers book 4-6 weeks out)\n\n**Recommendation**: Start WES and book IELTS this week to stay ahead of schedule.\n\nShould I recalculate your timeline with these updates?",
  "What documents are still missing?": "You have **6 documents still to upload** (out of 18):\n\n❌ **Critical**:\n- ECA Report (WES) — Apply first, then upload\n- IELTS TRF — Take the test first\n\n❌ **High Priority**:\n- Police Certificate\n- Proof of Upfront Medical\n- Reference Letters (2)\n\n✅ **Uploaded (12)**: Passport, Birth Certificate, Degree, Transcripts, Bank Statements, etc.\n\nYour document readiness is **67%**. I can help you prepare each document if needed.",
  "How long will my application take?": "Here's your estimated timeline from today:\n\n| Phase | Duration | Target Date |\n|---|---|---|\n| 📋 Credential Assessment | 6-12 weeks | Sep 2026 |\n| 🗣️ Language Tests | 2-4 weeks prep | Aug-Sep 2026 |\n| 📝 EE Profile → ITA | 2-4 weeks | Oct-Nov 2026 |\n| 📑 Document Preparation | 4-6 weeks | Nov-Dec 2026 |\n| 📨 Submit PR Application | — | Dec 2026 |\n| ⏳ Processing | 4-8 months | Q2-Q3 2027 |\n| 🛬 Landing | — | Q3 2027 |\n\n**Total remaining**: ~12-15 months from now.\n\nThis is a realistic estimate based on current processing times. Would you like to explore options to accelerate any phase?",
  "Should I consider PNP?": "**Provincial Nominee Programs (PNP) could be a game-changer for you.**\n\n✅ **Pros**:\n- +600 CRS points (guaranteed ITA)\n- Multiple provinces to choose from\n- Some streams have lower requirements\n\n❌ **Cons**:\n- Additional paperwork per province\n- Some require job offer or connection\n- Processing time varies (3-12 months)\n\n**Best options for your profile**:\n1. **Ontario HCP** — Tech draws, no job offer needed\n2. **BC PNP Tech** — If you're in tech, 30+ occupations\n3. **Alberta Advantage** — No job offer, draws from EE pool\n\nWould you like a detailed comparison of PNP streams for your profile?",
}

export default function CoachPage() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSend(message: string) {
    if (!message.trim()) return

    const userMsg = { role: "user" as const, content: message, timestamp: new Date().toISOString() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    setTimeout(() => {
      const response = botResponses[message] || "That's a great question! Let me analyze your application data to give you the best advice. Based on your profile, here's what I recommend:\n\n1. Focus on completing your WES application this week — it's your critical path item.\n2. Book your IELTS test for early August.\n3. Start gathering employment reference letters.\n\nWould you like me to elaborate on any of these recommendations?"
      const botMsg = { role: "bot" as const, content: response, timestamp: new Date().toISOString() }
      setMessages((prev) => [...prev, botMsg])
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-6">
      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 pr-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-2xl ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : msg.isProactive
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800"
                }`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div>
                  {msg.isProactive && (
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="h-3 w-3 text-orange-500" />
                      <span className="text-xs text-orange-600 font-medium">Proactive Alert</span>
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : msg.isProactive
                      ? "bg-orange-50 border border-orange-200 dark:bg-orange-950 dark:border-orange-800"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}>
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{
                      __html: msg.content.replace(/\n/g, "<br>").replace(/\|(.+?)\|/g, "<strong>$1</strong>")
                    }} />
                  </div>
                  <p className={`mt-1 text-xs text-gray-400 ${msg.role === "user" ? "text-right" : ""}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 ml-11">
              <Loader2 className="h-4 w-4 animate-spin" />
              AI Coach is thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Ask your AI Coach anything..."
            className="flex-1 border-0 bg-transparent px-3 py-2 text-sm focus:outline-none dark:text-gray-100"
          />
          <Button size="sm" onClick={() => handleSend(input)} disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 space-y-4">
        {/* Quick Questions */}
        <Card>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Suggested Questions
          </CardTitle>
          <div className="mt-3 space-y-1">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <ChevronRight className="h-3 w-3 flex-shrink-0" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Context Summary */}
        <Card>
          <CardTitle className="text-sm">Your Journey Snapshot</CardTitle>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Current Stage</span>
              <span className="font-medium">Credential Assessment</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Overall Progress</span>
              <span className="font-medium">68%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">CRS Score</span>
              <span className="font-medium">456</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Est. Submission</span>
              <span className="font-medium">Dec 15, 2026</span>
            </div>
          </div>
        </Card>

        {/* Capabilities */}
        <Card>
          <CardTitle className="text-sm">I Can Help With</CardTitle>
          <div className="mt-3 space-y-2">
            {[
              { label: "CRS Score Analysis", icon: TrendingUp },
              { label: "Timeline Optimization", icon: AlertTriangle },
              { label: "Document Review", icon: Lightbulb },
              { label: "Risk Assessment", icon: AlertTriangle },
              { label: "Policy Questions", icon: Lightbulb },
              { label: "Study Plans", icon: TrendingUp },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <item.icon className="h-3 w-3" />
                {item.label}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

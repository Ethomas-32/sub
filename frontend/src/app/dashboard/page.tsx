"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Menu, Loader, Home, LogOut, User, Bot, Copy, Check, Clock, Trash2, Plus, Sun, Moon, Settings } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

export default function AssistantDashboard() {
  type Message = { role: "user" | "assistant"; content: string; timestamp: Date };
  type ChatSession = {
    id: string;
    title: string;
    createdAt: Date;
    messages: Message[];
  };

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "Demo User",
    email: "demo@thinktank.ai",
    role: "User"
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages]);

  // Initialize theme and sessions
  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') return;

    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setDarkMode(shouldUseDark);
    
    // Load user data
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }

    // Load chat sessions
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        const sessionsWithDates = parsedSessions.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChatSessions(sessionsWithDates);
        if (sessionsWithDates.length > 0) {
          setActiveSession(sessionsWithDates[0]);
        } else {
          const newSession = createNewSession();
          setChatSessions([newSession]);
          setActiveSession(newSession);
        }
      } catch (error) {
        console.error('Error parsing saved sessions:', error);
        const newSession = createNewSession();
        setChatSessions([newSession]);
        setActiveSession(newSession);
      }
    } else {
      const newSession = createNewSession();
      setChatSessions([newSession]);
      setActiveSession(newSession);
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (chatSessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const router = useRouter();

  const handleSignOut = () => {
    if (typeof window === 'undefined') return;
    
    // Clear all stored data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('chatSessions');
    localStorage.removeItem('theme');
    
    // Reset state
    setChatSessions([]);
    setActiveSession(null);
    setCurrentUser({ name: "", email: "", role: "" });
    
    alert("Signed out successfully!");
    router.push('/');
  };

  const createNewSession = (): ChatSession => {
    const newSession = {
      id: Date.now().toString(),
      title: "New Chat",
      createdAt: new Date(),
      messages: []
    };
    return newSession;
  };

  const generateChatTitle = (firstMessage: string): string => {
    // Create a meaningful title from the first message
    const words = firstMessage.trim().split(' ').slice(0, 6);
    return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
  };

  const updateSessionTitle = (sessionId: string, newTitle: string) => {
    setChatSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, title: newTitle }
          : session
      )
    );
    
    // Update active session if it's the one being updated
    if (activeSession && activeSession.id === sessionId) {
      setActiveSession(prev => prev ? { ...prev, title: newTitle } : null);
    }
  };

  const startNewChat = () => {
    const newSession = createNewSession();
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSession(newSession);
    setQuery(""); // Clear input
  };

  const deleteChatSession = (id: string) => {
    const updatedSessions = chatSessions.filter(session => session.id !== id);
    setChatSessions(updatedSessions);
    
    if (activeSession && activeSession.id === id) {
      if (updatedSessions.length > 0) {
        setActiveSession(updatedSessions[0]);
      } else {
        // Create a new session if no sessions left
        const newSession = createNewSession();
        setChatSessions([newSession]);
        setActiveSession(newSession);
      }
    }
  };

  const handleSend = async () => {
    if (!query.trim() || loading) return;
    
    setLoading(true);
    const currentQuery = query.trim();
    setQuery(""); // Clear input immediately
    
    if (!activeSession) return;
    
    // Add user message to active session
    const userMessage = { role: "user" as const, content: currentQuery, timestamp: new Date() };
    
    // Update session title if this is the first message
    let updatedTitle = activeSession.title;
    if (activeSession.messages.length === 0) {
      updatedTitle = generateChatTitle(currentQuery);
    }
    
    const updatedSession: ChatSession = {
      ...activeSession,
      title: updatedTitle,
      messages: [...activeSession.messages, userMessage]
    };
    
    setActiveSession(updatedSession);
    setChatSessions(prev =>
      prev.map(session => session.id === updatedSession.id ? updatedSession : session)
    );

    try {
      console.log('Sending request to Flask:', currentQuery);

      const response = await fetch("http://localhost:5001/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: currentQuery })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant message to active session
      const assistantMessage = { role: "assistant" as const, content: data.response, timestamp: new Date() };
      const updatedSessionWithAssistant: ChatSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage]
      };
      setActiveSession(updatedSessionWithAssistant);
      setChatSessions(prev =>
        prev.map(session => session.id === updatedSessionWithAssistant.id ? updatedSessionWithAssistant : session)
      );
    } catch (error) {
      console.error('Error details:', error);

      let errorMessage = "Something went wrong. ";
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage += "Cannot connect to the server. Please make sure the Flask backend is running on port 5001.";
        } else if (error.message.includes('CORS')) {
          errorMessage += "CORS error. Please check the server configuration.";
        } else {
          errorMessage += error.message;
        }
      }

      // Add error message to active session
      const errorAssistantMessage = { role: "assistant" as const, content: errorMessage, timestamp: new Date() };
      const updatedSessionWithError: ChatSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorAssistantMessage]
      };
      setActiveSession(updatedSessionWithError);
      setChatSessions(prev =>
        prev.map(session => session.id === updatedSessionWithError.id ? updatedSessionWithError : session)
      );
    }

    setLoading(false);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return "Today";
    } else if (messageDate.getTime() === today.getTime() - 86400000) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${darkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
      : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-800'
    }`}>
      {/* Sidebar */}
      <aside className={`${showHistory ? 'w-72' : 'w-20'} ${darkMode 
        ? 'bg-gray-800/95 border-gray-700/50' 
        : 'bg-white/95 border-gray-200/50'
      } backdrop-blur-xl shadow-2xl border-r flex flex-col transition-all duration-300`}>
        {/* Header */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'} flex items-center justify-between`}>
          {showHistory ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Think Tank</h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI Assistant</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6 text-white" />
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowHistory(!showHistory)}
            className={`${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-500 hover:text-indigo-600'}`}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Theme Toggle */}
        <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <Button 
            onClick={toggleTheme}
            variant="ghost"
            className={`w-full ${showHistory ? 'justify-start gap-2' : 'justify-center'} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {showHistory && (darkMode ? "Light Mode" : "Dark Mode")}
          </Button>
        </div>
        
        {/* User Profile */}
        {showHistory && (
          <div className={`flex items-center gap-3 p-3 mx-3 mt-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{currentUser.name}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.email}</p>
            </div>
          </div>
        )}

        {/* New Chat Button */}
        <div className={`p-3 border-b ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
          <Button 
            onClick={startNewChat}
            className={`w-full ${showHistory ? 'justify-start gap-2' : 'justify-center'}`}
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            {showHistory && "New Chat"}
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3">
          {showHistory ? (
            <div className="space-y-1">
              {chatSessions.length === 0 ? (
                <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} py-4`}>
                  No chat history yet
                </p>
              ) : (
                chatSessions.map(session => (
                  <div 
                    key={session.id}
                    onClick={() => setActiveSession(session)}
                    className={`p-3 rounded-lg cursor-pointer flex items-center justify-between group transition-colors ${
                      activeSession?.id === session.id 
                        ? (darkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-50 text-indigo-700')
                        : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{session.title}</p>
                      <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(session.createdAt)}</span>
                        <span>•</span>
                        <span>{session.messages.length} messages</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`opacity-0 group-hover:opacity-100 h-6 w-6 transition-opacity ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatSession(session.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center pt-4 space-y-3">
              {chatSessions.slice(0, 5).map(session => (
                <Button
                  key={session.id}
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveSession(session)}
                  className={`rounded-full ${
                    activeSession?.id === session.id 
                      ? (darkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-600')
                      : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100')
                  }`}
                  title={session.title}
                >
                  <span className="text-xs">
                    {session.title.charAt(0).toUpperCase()}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Sign Out */}
        <div className={`p-3 border-t ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
          <Button 
            onClick={handleSignOut}
            variant="ghost" 
            className={`w-full ${showHistory ? 'justify-start gap-2' : 'justify-center'} ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}
          >
            <LogOut className="w-4 h-4" />
            {showHistory && "Sign Out"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className={`${darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200/50'} backdrop-blur-sm border-b p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeSession?.title || "New Chat"}
              </h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ask questions about ITSM, troubleshooting, and productivity</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Connected</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {/* Messages Container */}
            <Card className={`flex-1 mb-6 shadow-xl border-0 ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
              <CardContent className="h-full overflow-y-auto p-6 space-y-6">
                {(!activeSession || activeSession.messages.length === 0) && (
                  <div className="flex items-center justify-center h-full text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                        <Bot className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Welcome to Think Tank AI</h3>
                        <p className={`max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          I'm here to help with ITSM incidents, troubleshooting, and productivity questions. 
                          Ask me anything about your systems and documentation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSession?.messages.map((res, i) => (
                  <div key={i} className="flex gap-4 group">
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      res.role === "user" 
                        ? (darkMode ? "bg-indigo-900/50 text-indigo-400" : "bg-indigo-100 text-indigo-600")
                        : "bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                    }`}>
                      {res.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {res.role === "user" ? "You" : "Think Tank AI"}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {formatTime(res.timestamp)}
                        </span>
                      </div>
                      
                      <div className={`prose prose-sm max-w-none ${
                        res.role === "user" 
                          ? (darkMode ? "bg-indigo-900/20 border-indigo-700/50 rounded-lg p-4" : "bg-indigo-50 border border-indigo-200 rounded-lg p-4")
                          : (darkMode ? "bg-gray-700/50 border-gray-600/50 rounded-lg p-4 shadow-sm" : "bg-white border border-gray-200 rounded-lg p-4 shadow-sm")
                      }`}>
                        {res.role === "assistant" ? (
                          <div className="relative">
                            <div className={darkMode ? "text-gray-200" : "text-gray-800"}>
  <ReactMarkdown
    components={{
      p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
      ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
      strong: ({ children }) => (
        <strong className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {children}
        </strong>
      ),
      h1: ({ children }) => (
        <h1 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className={`text-md font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {children}
        </h3>
      ),
      code: ({ children }) => (
        <code className={`px-1 py-0.5 rounded text-sm font-mono ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
          {children}
        </code>
      ),
      pre: ({ children }) => (
        <pre className={`p-3 rounded-lg overflow-x-auto text-sm ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
          {children}
        </pre>
      )
    }}
  >
    {res.content}
  </ReactMarkdown>
</div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(res.content, i)}
                            >
                              {copiedIndex === i ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <p className={`m-0 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{res.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Loader className="animate-spin w-4 h-4" />
                        <span>Think Tank AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Scroll target */}
                <div ref={messagesEndRef} />
              </CardContent>
            </Card>

            {/* Input Area */}
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  className={`h-12 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Ask about ITSM incidents, problems, or troubleshooting..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={handleSend} 
                disabled={loading || !query.trim()} 
                className="h-12 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
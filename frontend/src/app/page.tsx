"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  ShieldCheck, 
  LayoutDashboard, 
  MessageSquare, 
  Bot,
  User,
  Lock,
  ArrowRight,
  CheckCircle,
  Zap,
  Database,
  Users,
  Sun,
  Moon
} from "lucide-react";

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  

  // Hardcoded dummy credentials
  const DUMMY_CREDENTIALS = {
    email: "demo@thinktank.ai",
    password: "demo123"
  };

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setDarkMode(shouldUseDark);
  }, []);

  // Apply theme to document
  useEffect(() => {
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    if (email === DUMMY_CREDENTIALS.email && password === DUMMY_CREDENTIALS.password) {
      setIsAuthenticated(true);
      setShowLogin(false);
    } else {
      setLoginError("Invalid credentials. Use demo@thinktank.ai / demo123 for demo access.");
    }
  };

  const handleDemoLogin = () => {
    setEmail(DUMMY_CREDENTIALS.email);
    setPassword(DUMMY_CREDENTIALS.password);
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  if (showLogin && !isAuthenticated) {
    return (
      <main className={`flex min-h-screen items-center justify-center px-6 py-12 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
          : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-800'
      }`}>
        <Card className={`w-full max-w-md shadow-2xl ${
          darkMode 
            ? 'bg-gray-800/80 border-gray-700/50' 
            : 'bg-white border-0'
        }`}>
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <CardTitle className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome Back
            </CardTitle>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Sign in to access Think Tank AI
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {loginError && (
              <div className={`text-sm text-center p-2 rounded-md ${
                darkMode 
                  ? 'text-red-400 bg-red-900/20' 
                  : 'text-red-500 bg-red-50'
              }`}>
                {loginError}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-12 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white'
                  }`}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white'
                  }`}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-300'
                }`} />
              </div>
              <div className={`relative flex justify-center text-sm ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <span className={`px-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Or
                </span>
              </div>
            </div>

            <Button 
              onClick={handleDemoLogin}
              variant="outline" 
              className={`w-full h-12 ${
                darkMode 
                  ? 'border-gray-700 hover:bg-gray-700/50' 
                  : 'border-2 border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              <Zap className="w-4 h-4 mr-2" />
              Try Demo (Use demo credentials)
            </Button>

            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={() => setShowLogin(false)}
                className={darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
              >
                ← Back to home
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-800'
    }`}>
      {/* Navigation Bar */}
      <nav className={`backdrop-blur-xl sticky top-0 z-50 ${
        darkMode 
          ? 'bg-gray-800/80 border-gray-700/50' 
          : 'bg-white/80 border-gray-200/50'
      } border-b`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Think Tank
                </h1>
                <p className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  AI Assistant Platform
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleTheme}
                className={darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-500 hover:text-indigo-600'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Signed in as Demo User
                  </div>
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowLogin(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-8 mb-20">
          <div className="space-y-4">
            <h1 className={`text-5xl font-bold tracking-tight ${
              darkMode ? 'text-white' : 'text-gray-900'
            } sm:text-6xl`}>
              Think Tank <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI Assistant</span>
            </h1>
            <p className={`text-xl ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            } max-w-3xl mx-auto leading-relaxed`}>
              Enhance productivity and discover insights with our AI-powered assistant. 
              Integrated with Azure AI, SharePoint, and Ivanti Neurons for comprehensive ITSM support.
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setShowLogin(true)}
                size="lg" 
                className="px-8 py-4 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-200"
              >
                <User className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button 
                onClick={handleDemoLogin}
                size="lg" 
                variant="outline"
                className={`px-8 py-4 text-lg ${
                  darkMode 
                    ? 'border-gray-700 hover:bg-gray-700/50 text-white' 
                    : 'border-2 border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                <Zap className="w-5 h-5 mr-2" />
                Try Demo
              </Button>
            </div>
          ) : (
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-200"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Launch Dashboard
              </Button>
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <FeatureCard 
            icon={<Sparkles className="text-indigo-500 w-8 h-8" />} 
            title="AI-Powered Insights"
            description="Get instant recommendations and resolve ITSM issues using natural language processing and machine learning."
            darkMode={darkMode}
          />
          <FeatureCard 
            icon={<MessageSquare className="text-purple-500 w-8 h-8" />} 
            title="Intelligent Chat Assistant"
            description="Ask questions and retrieve relevant knowledge from SharePoint, Ivanti, and your organization's documentation."
            darkMode={darkMode}
          />
          <FeatureCard 
            icon={<Database className="text-blue-500 w-8 h-8" />} 
            title="Integrated Knowledge Base"
            description="Access comprehensive data from Azure Search, incident reports, and troubleshooting guides in one place."
            darkMode={darkMode}
          />
          <FeatureCard 
            icon={<LayoutDashboard className="text-green-500 w-8 h-8" />} 
            title="Unified Dashboard"
            description="Monitor productivity metrics, manage tasks, and access AI insights through an intuitive interface."
            darkMode={darkMode}
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-red-500 w-8 h-8" />} 
            title="Enterprise Security"
            description="Built with Azure Active Directory integration and enterprise-grade security best practices."
            darkMode={darkMode}
          />
          <FeatureCard 
            icon={<Users className="text-orange-500 w-8 h-8" />} 
            title="Team Collaboration"
            description="Share insights, collaborate on solutions, and maintain organizational knowledge effectively."
            darkMode={darkMode}
          />
        </div>
      </div>
    </main>
  );
}

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  darkMode: boolean;
};

function FeatureCard({ icon, title, description, darkMode }: FeatureCardProps) {
  return (
    <Card className={`group hover:shadow-2xl transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-800/80 border-gray-700/50 hover:bg-gray-700/80' 
        : 'bg-white/80 border-0 hover:bg-white'
    }`}>
      <CardContent className="p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-xl transition-colors ${
            darkMode 
              ? 'bg-gray-700/50 group-hover:bg-gray-600/50' 
              : 'bg-gray-50 group-hover:bg-gray-100'
          }`}>
            {icon}
          </div>
          <h3 className={`text-xl font-semibold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h3>
        </div>
        <p className={`${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        } leading-relaxed`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
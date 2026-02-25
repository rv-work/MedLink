import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  MessageCircle,
  Stethoscope,
  AlertCircle,
  Globe,
  BookOpen,
  Clock,
  RefreshCw,
  Copy,
  ChevronLeft,
  Plus,
  Shield,
  Activity,
  Brain,
  Zap,
  Settings,
} from "lucide-react";

const MedicalChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(
    () =>
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
  );
  const [currentMode, setCurrentMode] = useState("internet");
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [waitingForPermission, setWaitingForPermission] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [mlContext, setMlContext] = useState(null);
  const [isInMLMode, setIsInMLMode] = useState(false);
  const [mlStep, setMlStep] = useState("symptom");
  const [mlCompleted, setMlCompleted] = useState(false);
  const [chatDisabled, setChatDisabled] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const modes = [
    {
      id: "internet",
      name: "Internet Only",
      icon: Globe,
      description: "Get answers from Gemini AI with internet knowledge",
      color: "bg-blue-500",
    },
    {
      id: "book",
      name: "Book Only",
      icon: BookOpen,
      description: "Get answers only from medical books and documents",
      color: "bg-green-500",
    },
    {
      id: "ml",
      name: "ML Diagnosis",
      icon: Brain,
      description: "Interactive symptom-based disease diagnosis",
      color: "bg-purple-500",
    },
    {
      id: "internet_book",
      name: "Internet + Book",
      icon: Zap,
      description: "Combined knowledge from books and internet",
      color: "bg-orange-500",
    },
    {
      id: "all",
      name: "ML + Book + Internet",
      icon: Activity,
      description: "Complete diagnosis with chat continuation",
      color: "bg-red-500",
    },
  ];

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [inputMessage]);

  const typeMessage = (messageId, fullContent, speed = 25) => {
    return new Promise((resolve) => {
      let index = 0;
      const typeChar = () => {
        if (index < fullContent.length) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: fullContent.substring(0, index + 1) }
                : msg,
            ),
          );
          index++;
          typingIntervalRef.current = setTimeout(typeChar, speed);
        } else {
          resolve();
        }
      };
      typeChar();
    });
  };

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current);
      }
    };
  }, []);

  const formatMessageContent = (content) => {
    if (!content) return "";
    let formatted = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
    formatted = formatted.replace(/^\d+\.\s+/gm, "$&");
    formatted = formatted.replace(/^\*\s+/gm, "• ");
    formatted = formatted.replace(/^\n+/g, "");
    return formatted;
  };

  const addMessage = (
    type,
    content,
    source = "chat",
    showPermission = false,
    shouldType = false,
  ) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      type,
      content: shouldType ? "" : content,
      timestamp: new Date(),
      source,
      showPermission,
    };

    setMessages((prev) => [...prev, newMessage]);

    if (shouldType && type === "bot") {
      setTimeout(() => {
        typeMessage(newMessage.id, content, 20);
      }, 300);
    }

    return newMessage.id;
  };

  const handleModeSelect = (modeId) => {
    setCurrentMode(modeId);
    setShowModeSelector(false);
    setMessages([]);
    setIsInMLMode(modeId === "ml" || modeId === "all");
    setMlStep("symptom");
    setMlContext(null);
    setMlCompleted(false);
    setChatDisabled(false);

    // Add welcome message based on mode
    const welcomeMessages = {
      internet:
        "👋 Hi! I'm your AI medical assistant. I can answer your medical questions using my internet knowledge. How can I help you today?",
      book: "📚 Welcome! I'll answer your questions using only verified medical books and documents. What would you like to know?",
      ml: "🧠 Hello! I'll help diagnose your condition step by step. Please describe your main symptom to get started.\n\n⚠️ Note: After the diagnosis, the session will end.",
      internet_book:
        "🔄 Hi there! I'll search through medical books first, and can use internet knowledge if needed. What's your question?",
      all: "⚡ Welcome to the complete medical assistant! I'll start with symptom diagnosis, then we can continue chatting. What symptoms are you experiencing?",
    };

    setTimeout(() => {
      addMessage("bot", welcomeMessages[modeId], modeId, false, true);
    }, 500);
  };

  const handleMLDiagnosis = async (userMessage) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/chat/ml-diagnosis",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            message: userMessage,
            session_id: sessionId,
            step: mlStep,
            context: mlContext,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ML diagnosis error");
      }

      addMessage("bot", data.response, "ml", false, true);

      if (data.step) {
        setMlStep(data.step);
      }

      if (data.context) {
        setMlContext(data.context);
      }

      // Handle completion based on mode
      if (data.completed) {
        setMlCompleted(true);

        if (currentMode === "ml") {
          // Mode 3: ML only - End the session
          setTimeout(() => {
            addMessage(
              "system",
              "🙏 Thank you for using our ML Diagnosis service! Take care and consult a healthcare professional if needed.",
              "completion",
              false,
              true,
            );
            setChatDisabled(true);
          }, 2000);
        } else if (currentMode === "all") {
          // Mode 5: ML + Book + Internet - Enable chat with context
          setTimeout(() => {
            addMessage(
              "system",
              "🎯 Diagnosis complete! You can now ask follow-up questions about your condition or general health topics. I have the context of your symptoms and diagnosis.",
              "transition",
              false,
              true,
            );
            setIsInMLMode(false);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("ML diagnosis error:", error);
      addMessage(
        "bot",
        `❌ Diagnosis error: ${error.message}. Please try again.`,
        "error",
        false,
        true,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegularChat = async (userMessage) => {
    setIsLoading(true);

    try {
      const endpoint =
        currentMode === "internet"
          ? "/internet-only"
          : currentMode === "book"
            ? "/book-only"
            : currentMode === "internet_book"
              ? "/ask"
              : "/all-combined"; // Mode 5 starts with book

      const response = await fetch(
        `https://medlink-bh5c.onrender.com/api/chat${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            question: userMessage,
            sessionId: sessionId,
            context: mlContext,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server error occurred");
      }

      addMessage("bot", data.response, data.source, false, true);

      if (data.needsPermission) {
        setWaitingForPermission(true);
        setPendingQuestion(userMessage);

        // Store ML context for permission response
        if (data.mlContext) {
          setMlContext(data.mlContext);
        }

        setTimeout(
          () => {
            addMessage(
              "system",
              "🌐 Would you like me to search using internet knowledge for more comprehensive information?",
              "permission",
              true,
              true,
            );
          },
          data.response.length * 20 + 500,
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      addMessage(
        "bot",
        `❌ Error: ${error.message}. Please try again.`,
        "error",
        false,
        true,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || chatDisabled) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    addMessage("user", userMessage);

    if (isInMLMode && !mlCompleted) {
      await handleMLDiagnosis(userMessage);
    } else {
      await handleRegularChat(userMessage);
    }
  };

  const handlePermissionResponse = async (allow) => {
    setWaitingForPermission(false);
    setIsLoading(true);

    try {
      if (allow) {
        // For Mode 5, use the new endpoint with ML context
        const endpoint =
          currentMode === "all" ? "/all-combined-internet" : "/internet-answer";

        const response = await fetch(
          `https://medlink-bh5c.onrender.com/api/chat${endpoint}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              question: pendingQuestion,
              sessionId: sessionId,
              mlContext: mlContext, // Pass ML context for Mode 5
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Server error occurred");
        }

        addMessage("bot", data.response, "internet", false, true);
        addMessage(
          "system",
          "⚠️ This answer includes internet knowledge. Always consult healthcare professionals for medical decisions.",
          "warning",
          false,
          true,
        );
      } else {
        addMessage(
          "bot",
          "Understood. Feel free to ask another question!",
          "chat",
          false,
          true,
        );
      }
    } catch (error) {
      console.error("Permission response error:", error);
      addMessage("bot", `❌ Error: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
      setPendingQuestion("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content) => {
    const cleanContent = content.replace(/<[^>]*>/g, "");
    navigator.clipboard.writeText(cleanContent);
  };

  const clearChat = () => {
    setMessages([]);
    setMlContext(null);
    setMlStep("symptom");
    setMlCompleted(false);
    setChatDisabled(false);
    setIsInMLMode(currentMode === "ml" || currentMode === "all");
  };

  const getMessageIcon = (type, source) => {
    if (type === "user") return <User className="w-4 h-4" />;
    if (source === "ml") return <Brain className="w-4 h-4" />;
    if (source === "book") return <BookOpen className="w-4 h-4" />;
    if (source === "internet") return <Globe className="w-4 h-4" />;
    if (source === "error") return <AlertCircle className="w-4 h-4" />;
    if (source === "warning") return <Shield className="w-4 h-4" />;
    return <Bot className="w-4 h-4" />;
  };

  const getCurrentModeInfo = () => {
    return modes.find((mode) => mode.id === currentMode);
  };

  if (showModeSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Stethoscope className="w-12 h-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                MedChat AI
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Choose your preferred medical consultation mode
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <div
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer p-6 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
                >
                  <div className="flex items-center mb-4">
                    <div
                      className={`p-3 rounded-lg ${mode.color} text-white mr-4`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {mode.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {mode.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const currentModeInfo = getCurrentModeInfo();
  const Icon = currentModeInfo?.icon || Bot;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <button
            onClick={() => setShowModeSelector(true)}
            className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div
            className={`p-2 rounded-lg ${currentModeInfo?.color} text-white mr-3`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {currentModeInfo?.name}
            </h2>
            <p className="text-sm text-gray-500">
              {currentModeInfo?.description}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Clear chat"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.type === "user"
                  ? "bg-blue-500 text-white"
                  : message.source === "system" ||
                      message.source === "transition"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : message.source === "completion"
                      ? "bg-purple-50 text-purple-800 border border-purple-200"
                      : message.source === "warning"
                        ? "bg-orange-50 text-orange-800 border border-orange-200"
                        : message.source === "error"
                          ? "bg-red-50 text-red-800 border border-red-200"
                          : "bg-white text-gray-800 border border-gray-200 shadow-sm"
              }`}
            >
              {message.type === "bot" && (
                <div className="flex items-center mb-2 text-sm opacity-75">
                  {getMessageIcon(message.type, message.source)}
                  <span className="ml-1 capitalize">{message.source}</span>
                  <Clock className="w-3 h-3 ml-auto" />
                </div>
              )}

              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: formatMessageContent(message.content),
                }}
              />

              {message.showPermission && (
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handlePermissionResponse(true)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                    disabled={isLoading}
                  >
                    Yes, use internet
                  </button>
                  <button
                    onClick={() => handlePermissionResponse(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
                    disabled={isLoading}
                  >
                    No, thanks
                  </button>
                </div>
              )}

              {message.type === "bot" && !message.showPermission && (
                <button
                  onClick={() => copyMessage(message.content)}
                  className="mt-2 p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                chatDisabled
                  ? "Session ended - Thank you for using ML Diagnosis!"
                  : isInMLMode && !mlCompleted
                    ? "Describe your symptoms or answer the questions..."
                    : "Ask me anything about health and medicine..."
              }
              className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 ${
                chatDisabled ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              rows="1"
              disabled={isLoading || waitingForPermission || chatDisabled}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={
              !inputMessage.trim() ||
              isLoading ||
              waitingForPermission ||
              chatDisabled
            }
            className="p-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mt-2">
          <p className="text-xs text-gray-500">
            AI-powered medical consultation • Always consult a doctor for
            serious concerns
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalChatPage;

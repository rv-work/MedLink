import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  BookOpen,
  Bot,
  Brain,
  ChevronLeft,
  Copy,
  Globe,
  RefreshCw,
  Send,
  Shield,
  Stethoscope,
  User,
  Zap,
} from "lucide-react";

const MedChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(
    () =>
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
  );
  const [currentMode, setCurrentMode] = useState("internet");
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [setWaitingForPermission] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [mlContext, setMlContext] = useState(null);
  const [isInMLMode, setIsInMLMode] = useState(false);
  const [mlStep, setMlStep] = useState("symptom");
  const [mlCompleted, setMlCompleted] = useState(false);
  const [chatDisabled, setChatDisabled] = useState(false);

  const scrollViewRef = useRef(null);
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
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  const typeMessage = (messageId, fullContent, speed = 20) => {
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
          setTypingMessageId(null);
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
    let formatted = content.replace(/\*\*(.*?)\*\*/g, "$1");
    formatted = formatted.replace(/(?<!\n)\n(?!\n)/g, " ");
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
      setTypingMessageId(newMessage.id);
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
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://medlink-bh5c.onrender.com/api/chat/ml-diagnosis",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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

      if (data.completed) {
        setMlCompleted(true);
        if (currentMode === "ml") {
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
              : "/all-combined";

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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePermissionResponse = async (allow) => {
    setWaitingForPermission(false);
    setIsLoading(true);

    try {
      if (allow) {
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
              mlContext: mlContext,
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

  const copyMessage = (content) => {
    const cleanContent = content.replace(/<[^>]*>/g, "");
    navigator.clipboard.writeText(cleanContent).then(() => {
      alert("Message copied to clipboard!");
    });
  };

  const clearChat = () => {
    setMessages([]);
    setMlContext(null);
    setMlStep("symptom");
    setMlCompleted(false);
    setChatDisabled(false);
    setIsInMLMode(currentMode === "ml" || currentMode === "all");
  };

  const getMessageIcon = (type) => {
    if (type === "user") return <User size={16} className="text-blue-500" />;
    if (type === "system")
      return <Shield size={16} className="text-green-500" />;
    return <Bot size={16} className="text-purple-500" />;
  };

  const renderModeSelector = () => (
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

  const renderMessage = (message) => {
    const isUser = message.type === "user";
    const isSystem = message.type === "system";
    const isTyping = typingMessageId === message.id;

    return (
      <div
        key={message.id}
        className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        {!isUser && (
          <div className="mr-3 mt-1">
            <div className="bg-gray-200 p-2 rounded-full">
              {getMessageIcon(message.type, message.source)}
            </div>
          </div>
        )}

        <div
          className={`max-w-[80%] p-4 rounded-2xl ${
            isUser
              ? "bg-blue-500 text-white rounded-br-md"
              : isSystem
                ? "bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-bl-md"
                : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
          }`}
        >
          <div className="text-base leading-6 whitespace-pre-wrap">
            {formatMessageContent(message.content)}
          </div>

          {isTyping && (
            <div className="mt-2 flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-100"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
            </div>
          )}

          {message.showPermission && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handlePermissionResponse(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex-1 hover:bg-blue-600 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => handlePermissionResponse(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg flex-1 hover:bg-gray-600 transition-colors"
              >
                No
              </button>
            </div>
          )}

          {!isUser && !isSystem && (
            <button
              onClick={() => copyMessage(message.content)}
              className="mt-2 p-1 hover:bg-gray-100 rounded self-end"
            >
              <Copy size={16} className="text-gray-500" />
            </button>
          )}
        </div>

        {isUser && (
          <div className="ml-3 mt-1">
            <div className="bg-blue-100 p-2 rounded-full">
              <User size={16} className="text-blue-500" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderChatInterface = () => {
    const currentModeInfo = modes.find((m) => m.id === currentMode);

    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div
          className="px-4 py-3"
          style={{
            background: `linear-gradient(135deg, ${currentModeInfo?.color[0]} 0%, ${currentModeInfo?.color[1]} 100%)`,
          }}
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={() => setShowModeSelector(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>

            <div className="flex-1 mx-3 text-center">
              <h2 className="text-white text-lg font-semibold">
                {currentModeInfo?.name}
              </h2>
              <p className="text-white/80 text-sm">
                {currentModeInfo?.description}
              </p>
            </div>

            <button
              onClick={clearChat}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <RefreshCw size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollViewRef}
          className="flex-1 px-4 py-4 overflow-y-auto max-w-4xl mx-auto w-full"
        >
          {messages.map(renderMessage)}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 p-2 rounded-full mr-3 mt-1">
                <Bot size={16} className="text-purple-500" />
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-md">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-100"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        {!chatDisabled && (
          <div className="px-4 py-3 bg-white border-t border-gray-200">
            <div className="flex items-end gap-3 max-w-4xl mx-auto">
              <div className="flex-1 bg-gray-100 px-4 py-3 rounded-2xl">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full text-gray-900 text-base bg-transparent resize-none outline-none min-h-[20px] max-h-[100px]"
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={`p-3 rounded-2xl transition-colors ${
                  inputMessage.trim() && !isLoading
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return showModeSelector ? renderModeSelector() : renderChatInterface();
};

export default MedChat;

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";

const MedicalChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(
    () =>
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
  );
  const [waitingForPermission, setWaitingForPermission] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [typingMessageId, setTypingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const messagesContainerRef = useRef(null);

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
    // Only scroll when there are messages and after a small delay
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [inputMessage]);

  // Typing animation function
  const typeMessage = (messageId, fullContent, speed = 25) => {
    return new Promise((resolve) => {
      let index = 0;

      const typeChar = () => {
        if (index < fullContent.length) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? { ...msg, content: fullContent.substring(0, index + 1) }
                : msg
            )
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

  // Clean up typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearTimeout(typingIntervalRef.current);
      }
    };
  }, []);

  // Format message content to handle markdown-like formatting
  const formatMessageContent = (content) => {
    if (!content) return "";

    // Convert **text** to bold
    let formatted = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Convert *text* to italic
    formatted = formatted.replace(
      /(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g,
      "<em>$1</em>"
    );

    // Handle numbered lists better
    formatted = formatted.replace(/^\d+\.\s+/gm, "<br/>$&");

    // Handle bullet points
    formatted = formatted.replace(/^\*\s+/gm, "<br/>• ");

    // Clean up extra line breaks at the start
    formatted = formatted.replace(/^<br\/>/g, "");

    return formatted;
  };

  const addMessage = (
    type,
    content,
    source = "chat",
    showPermission = false,
    shouldType = false
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    addMessage("user", userMessage);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          question: userMessage,
          sessionId: sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server error occurred");
      }

      addMessage("bot", data.response, data.source, false, true);

      if (data.needsPermission) {
        setWaitingForPermission(true);
        setPendingQuestion(userMessage);

        setTimeout(() => {
          addMessage(
            "system",
            "🌐 I couldn't find this information in my medical database. Would you like me to provide an answer based on my general medical knowledge?",
            "permission",
            true,
            true
          );
        }, data.response.length * 20 + 500);
      }
    } catch (error) {
      console.error("Chat error:", error);
      addMessage(
        "bot",
        `❌ I encountered an error: ${error.message}. Please try again or rephrase your question.`,
        "error",
        false,
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionResponse = async (allow) => {
    setWaitingForPermission(false);
    setIsLoading(true);

    try {
      if (allow) {
        const response = await fetch(
          "http://localhost:5000/api/chat/internet-answer",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              question: pendingQuestion,
              sessionId: sessionId,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Server error occurred");
        }

        addMessage("bot", data.response, "internet", false, true);
        addMessage(
          "system",
          "⚠️ Disclaimer: This answer is based on general medical knowledge. Always consult with a healthcare professional for personalized medical advice.",
          "warning",
          false,
          true
        );
      } else {
        addMessage(
          "bot",
          "Understood. Feel free to ask another question!",
          "chat",
          false,
          true
        );
      }
    } catch (error) {
      console.error("Internet answer error:", error);
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
    // Clean the content before copying (remove HTML tags)
    const cleanContent = content.replace(/<[^>]*>/g, "");
    navigator.clipboard.writeText(cleanContent);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const getMessageIcon = (type, source) => {
    if (type === "user") return <User className="w-4 h-4" />;
    if (source === "system" || source === "permission")
      return <MessageCircle className="w-4 h-4" />;
    if (source === "internet") return <Globe className="w-4 h-4" />;
    if (source === "book") return <BookOpen className="w-4 h-4" />;
    if (source === "warning") return <AlertCircle className="w-4 h-4" />;
    return <Bot className="w-4 h-4" />;
  };

  const getMessageColor = (type, source) => {
    if (type === "user")
      return "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md";

    if (source === "system" || source === "permission")
      return "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800 border border-purple-200";

    if (source === "internet")
      return "bg-gradient-to-br from-green-50 to-green-100 text-green-800 border border-green-200";

    if (source === "book")
      return "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border border-blue-200";

    if (source === "warning")
      return "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-800 border border-amber-200";

    if (source === "error")
      return "bg-gradient-to-br from-red-50 to-red-100 text-red-800 border border-red-200";

    return "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border border-gray-200";
  };

  const quickPrompts = [
    "Tell me about common cold symptoms",
    "What are the signs of high blood pressure?",
    "How to manage stress and anxiety?",
    "Explain diabetes management",
  ];

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header with Back Button and Clear Chat */}
      <div className="sticky top-0 z-10 p-4">
        <div className="mx-auto flex justify-between items-center">
          <button className="group p-2 md:p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer">
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
          </button>

          <button
            onClick={clearChat}
            className="bg-white/80 backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 rounded-xl text-gray-700 hover:bg-white/90 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl border border-white/30 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="font-medium text-sm md:text-base">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col p-2 md:p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl border border-white/40 overflow-hidden flex flex-col flex-1 min-h-0">
          {/* Chat Messages Area - Scrollable */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 min-h-0"
          >
            {/* Welcome Header - Shows when no messages */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full space-y-6 md:space-y-8 px-4">
                {/* Header Content */}
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-16 h-16 md:w-20 md:h-20">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-xl">
                      <Stethoscope className="h-10 w-10 md:h-12 md:w-12 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full border-2 md:border-3 border-white animate-pulse shadow-lg"></div>
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Medical Expert Assistant
                    </h1>
                    <p className="text-gray-600 text-sm md:text-lg font-medium max-w-2xl mx-auto px-4">
                      AI-powered medical consultation • Always consult a doctor
                      for serious concerns
                    </p>
                  </div>

                  <div className="flex items-center justify-center space-x-3 md:space-x-4 bg-white/80 backdrop-blur-sm px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border border-white/30 shadow-lg max-w-sm md:max-w-md mx-auto">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs md:text-sm font-medium text-gray-700">
                      AI Online & Ready
                    </span>
                    <div className="text-xs md:text-sm text-gray-500">•</div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Shield className="w-2 h-2 md:w-3 md:h-3" />
                      <span>Secure & Private</span>
                    </div>
                  </div>
                </div>

                {/* Quick Start Prompts */}
                <div className="w-full max-w-4xl">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-xl border border-white/40 p-4 md:p-8">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6 flex items-center justify-center">
                      <Plus className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-blue-600" />
                      Quick Start - Try asking about:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {quickPrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickPrompt(prompt)}
                          className="text-left p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-gray-200 transition-all duration-200 text-gray-700 hover:shadow-lg hover:scale-[1.02] font-medium text-sm md:text-base cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.length > 0 && (
              <div className="space-y-3 md:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    } group`}
                  >
                    <div
                      className={`flex items-start space-x-2 md:space-x-3 max-w-[85%] md:max-w-[80%] ${
                        message.type === "user"
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`p-2 rounded-lg md:rounded-xl ${getMessageColor(
                          message.type,
                          message.source
                        )} flex-shrink-0 shadow-sm`}
                      >
                        {getMessageIcon(message.type, message.source)}
                      </div>

                      {/* Message Content */}
                      <div className="flex flex-col space-y-1">
                        <div
                          className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${getMessageColor(
                            message.type,
                            message.source
                          )} shadow-sm relative`}
                        >
                          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.type === "bot" ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: formatMessageContent(message.content),
                                }}
                              />
                            ) : (
                              message.content
                            )}
                            {typingMessageId === message.id && (
                              <span className="inline-block w-1 h-4 bg-current ml-1 animate-pulse" />
                            )}
                          </div>

                          {/* Permission Buttons */}
                          {message.showPermission && (
                            <div className="mt-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                              <button
                                onClick={() => handlePermissionResponse(true)}
                                disabled={isLoading}
                                className="px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-lg md:rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 shadow-md cursor-pointer"
                              >
                                Yes, proceed
                              </button>
                              <button
                                onClick={() => handlePermissionResponse(false)}
                                disabled={isLoading}
                                className="px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs rounded-lg md:rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 disabled:opacity-50 shadow-md cursor-pointer"
                              >
                                No, skip
                              </button>
                            </div>
                          )}

                          {/* Copy Button */}
                          {message.type === "bot" && message.content && (
                            <button
                              onClick={() => copyMessage(message.content)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -right-1 -top-1 p-1 bg-white rounded-lg shadow-sm hover:shadow-md text-gray-500 hover:text-blue-600 cursor-pointer"
                              title="Copy message"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div
                          className={`text-xs text-gray-500 px-1 ${
                            message.type === "user" ? "text-right" : "text-left"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 md:space-x-3">
                      <div className="p-2 rounded-lg md:rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
                        <Bot className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-3 rounded-xl md:rounded-2xl shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="bg-gradient-to-r from-gray-50/90 to-blue-50/90 backdrop-blur-sm p-3 md:p-6 border-t border-gray-200/50 flex-shrink-0">
            <div className="flex items-end space-x-2 md:space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your symptoms or ask any medical question..."
                  className="w-full p-3 md:p-4 border border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/90 text-gray-800 placeholder-gray-500 transition-all duration-200 shadow-sm text-sm md:text-base"
                  rows="1"
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                  disabled={isLoading || waitingForPermission}
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={
                  !inputMessage.trim() || isLoading || waitingForPermission
                }
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 md:p-4 rounded-xl md:rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex-shrink-0 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Status Footer */}
            <div className="mt-2 md:mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-2 sm:space-y-0">
              <span className="flex items-center space-x-1">
                <span>💡 Press Enter to send, Shift+Enter for new line</span>
              </span>

              <div className="flex items-center space-x-3">
                {waitingForPermission && (
                  <span className="flex items-center space-x-1 text-amber-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>Awaiting response...</span>
                  </span>
                )}
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date().toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalChatPage;

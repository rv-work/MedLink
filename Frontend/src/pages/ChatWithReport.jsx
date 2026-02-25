import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Bot,
  User,
  Loader,
  FileText,
  Calendar,
  Stethoscope,
  ChevronLeft,
  AlertCircle,
  Sparkles,
  MessageCircle,
  RefreshCw,
  Heart,
  Shield,
  CheckCircle,
  Zap,
  Volume2,
  Mic,
  MicOff,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useParams } from "react-router-dom";

const ChatWithReport = () => {
  const [report, setReport] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingReport, setIsLoadingReport] = useState(true);
  const { id } = useParams();

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Helper function to format dates
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.log("error : ", error);
      return dateString;
    }
  };

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Text-to-Speech function
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (voice) =>
          voice.name.includes("Google") ||
          voice.name.includes("Microsoft") ||
          voice.lang.includes("en"),
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // Voice Recognition setup
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Typing animation component
  const TypingMessage = ({ content, messageId, onComplete }) => {
    const [displayedContent, setDisplayedContent] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (currentIndex < content.length) {
        const timer = setTimeout(() => {
          setDisplayedContent((prev) => prev + content[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        }, 30);
        return () => clearTimeout(timer);
      } else {
        setTimeout(() => {
          onComplete(messageId, content);
        }, 500);
      }
    }, [currentIndex, content, messageId, onComplete]);

    return (
      <div className="flex justify-start animate-fade-in">
        <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-4 sm:px-6 py-4 rounded-3xl bg-white border border-gray-200 text-gray-800 shadow-md hover:shadow-lg transition-all duration-300 relative group">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-2xl shadow-md flex-shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-relaxed font-medium break-words">
                {displayedContent}
                {currentIndex < content.length && (
                  <span className="animate-pulse">|</span>
                )}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <button
                  onClick={() => speakText(content)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full"
                  title="Listen to response"
                >
                  <Volume2 className="h-3 w-3 text-blue-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const addInitialMessages = (reportData) => {
    const singleMessage = `Hello ${
      reportData.patientName
    }! I'm your medical assistant. I've reviewed your report from ${new Date(
      reportData.dateOfReport,
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}. I'm here to help you understand your diagnosis, medications, and answer any questions you might have. Feel free to ask me anything about your report. What would you like to know first?`;

    // Clear messages first to prevent duplicates
    setMessages([]);

    setTimeout(() => {
      setMessages([
        {
          id: `initial-msg-${Date.now()}`,
          type: "typing",
          content: singleMessage,
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  const formatDoctorResponse = (response) => {
    let formatted = response
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/``````/g, "")
      .replace(/`(.*?)`/g, "$1")
      .replace(/\n{3,}/g, "\n\n");

    const sentences = formatted.split(/(?<=[.!?])\s+/);
    const paragraphs = [];
    let currentParagraph = [];

    sentences.forEach((sentence, index) => {
      sentence = sentence.trim();
      if (sentence) {
        currentParagraph.push(sentence);

        if (
          currentParagraph.length >= 2 &&
          (sentence.includes("However") ||
            sentence.includes("Additionally") ||
            sentence.includes("Remember") ||
            sentence.includes("Please") ||
            index === sentences.length - 1)
        ) {
          paragraphs.push(currentParagraph.join(" "));
          currentParagraph = [];
        }
      }
    });

    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(" "));
    }

    return paragraphs.filter((p) => p.trim().length > 0);
  };

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoadingReport(true);
      try {
        const response = await fetch(
          `https://medlink-bh5c.onrender.com/api/user/reports/${id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          },
        );
        const data = await response.json();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setReport(data.report);
        setIsLoadingReport(false);

        // Clear messages and add initial messages
        setMessages([]);
        addInitialMessages(data.report);
      } catch (error) {
        console.error("Error fetching report:", error);
        setIsLoadingReport(false);
      }
    };

    fetchReport();
  }, [id]);

  const generateContextPrompt = (userMessage) => {
    const context = `
You are a friendly and knowledgeable medical assistant helping a patient understand their medical report. 

Medical Report Context:
- Patient: ${report.patientName}
- Doctor: ${report.doctorName}
- Hospital: ${report.hospital}
- Date: ${report.dateOfReport}
- Diagnosis: ${report.diagnosisSummary}
- Reason for checkup: ${report.reasonOfCheckup}
- Prescription: ${report.prescription}
- Medications: ${report.medicines
      .map(
        (med) =>
          `${med.name} - ${med.dose} ${med.frequency} (${med.timing.join(
            ", ",
          )})`,
      )
      .join(", ")}

Previous conversation:
${messages
  .slice(-6)
  .filter((msg) => msg.type !== "typing")
  .map(
    (msg) => `${msg.type === "user" ? "Patient" : "Assistant"}: ${msg.content}`,
  )
  .join("\n")}

Current question: ${userMessage}

Instructions:
- Respond like a caring doctor would - warm, professional, and reassuring
- Keep responses conversational and easy to understand
- Break complex information into simple, digestible parts
- Use short sentences and paragraphs
- Avoid medical jargon or explain it in simple terms
- Always be encouraging and supportive
- Don't use markdown formatting (**bold**, *italic*, etc.)
- Keep responses between 50-150 words
- If asked about serious concerns, gently remind them to consult their doctor
    `;
    return context;
  };

  const callGeminiAPI = async (prompt) => {
    const genAI = new GoogleGenerativeAI(
      "AIzaSyBBAKDLEpQH0GTA3MlSuOQtZqmDf3aCels",
    );
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
    const chat = model.startChat();

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const rawText = response.text();
    return rawText;
  };

  const handleTypingComplete = (messageId, content) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, type: "bot", content } : msg,
      ),
    );
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const prompt = generateContextPrompt(inputMessage);
      const response = await callGeminiAPI(prompt);
      const formattedParagraphs = formatDoctorResponse(response);

      formattedParagraphs.forEach((paragraph, index) => {
        setTimeout(() => {
          const messageId = Date.now() + index;
          setMessages((prev) => [
            ...prev,
            {
              id: messageId,
              type: "typing",
              content: paragraph,
              timestamp: new Date(),
            },
          ]);
        }, index * 1500);
      });
    } catch (error) {
      const errorMessage = {
        id: Date.now(),
        type: "bot",
        content:
          "Sorry, I encountered an error. Please try again or consult your doctor directly.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Error calling Gemini API:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (report) {
      addInitialMessages(report);
    }
  };

  if (isLoadingReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your medical report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 backdrop-blur-sm bg-white/80 border-b border-white/20 shadow-lg">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="group p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl">
                <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                    <MessageCircle className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Medical Report Assistant
                  </h1>
                  <p className="text-gray-600 text-sm font-medium">
                    AI-powered health insights at your fingertips
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/30 shadow-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  AI Online
                </span>
              </div>
              <button
                onClick={clearChat}
                className="bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-2xl text-gray-700 hover:bg-white/90 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl border border-white/30"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Clear Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-4 sm:py-8 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-8">
          {/* Report Summary - Responsive */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 p-4 sm:p-6 xl:sticky xl:top-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Report Summary
                  </h2>
                  <p className="text-sm text-gray-600">Your health overview</p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-5">
                <div className="group p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-600">
                        Patient
                      </p>
                      <p className="text-lg font-bold text-gray-800 truncate">
                        {report.patientName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group p-3 sm:p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-100 hover:border-green-200 transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <Stethoscope className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-600">
                        Doctor
                      </p>
                      <p className="text-lg font-bold text-gray-800 truncate">
                        {report.doctorName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-100 hover:border-orange-200 transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-600">Date</p>
                      <p className="text-lg font-bold text-gray-800 truncate">
                        {formatDate(report.dateOfReport)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100">
                  <div className="flex items-start space-x-3">
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Diagnosis
                      </p>
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                        {report.diagnosisSummary}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-gray-600">Health Status</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium text-gray-800">
                        Monitoring
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface - Responsive */}
          <div className="xl:col-span-3 order-1 xl:order-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 h-[500px] sm:h-[600px] lg:h-[700px] flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 p-4 sm:p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="relative">
                      <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-2xl shadow-lg">
                        <Bot className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg sm:text-xl">
                        AI Medical Assistant
                      </h3>
                      <p className="text-blue-100 text-xs sm:text-sm font-medium">
                        {isTyping ? "Typing..." : "Ready to help you"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300" />
                        <span className="text-white text-xs sm:text-sm font-medium">
                          AI Powered
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Container - Fixed height and scrolling */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent min-h-0"
              >
                {messages.map((message, index) => (
                  <div key={message.id}>
                    {message.type === "typing" ? (
                      <TypingMessage
                        content={message.content}
                        messageId={message.id}
                        onComplete={handleTypingComplete}
                      />
                    ) : (
                      <div
                        className={`flex ${
                          message.type === "user"
                            ? "justify-end"
                            : "justify-start"
                        } animate-fade-in`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div
                          className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-4 sm:px-6 py-4 rounded-3xl relative group ${
                            message.type === "user"
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                              : "bg-white border border-gray-200 text-gray-800 shadow-md hover:shadow-lg"
                          } transition-all duration-300`}
                        >
                          <div className="flex items-start space-x-3">
                            {message.type === "bot" && (
                              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-2xl shadow-md flex-shrink-0">
                                <Bot className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm leading-relaxed font-medium break-words">
                                {message.content}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <p
                                  className={`text-xs ${
                                    message.type === "user"
                                      ? "text-blue-100"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {message.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {message.type === "bot" && (
                                  <button
                                    onClick={() => speakText(message.content)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded-full"
                                    title="Listen to response"
                                  >
                                    <Volume2 className="h-3 w-3 text-blue-500" />
                                  </button>
                                )}
                              </div>
                            </div>
                            {message.type === "user" && (
                              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-2xl shadow-md flex-shrink-0">
                                <User className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-white border border-gray-200 px-6 py-4 rounded-3xl shadow-md">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-2xl shadow-md">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                          <div
                            className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-3 h-3 bg-teal-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - Fixed at bottom */}
              <div className="p-3 sm:p-6 bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
                <div className="flex items-end space-x-2 sm:space-x-4">
                  <div className="flex-1 relative">
                    <div className="relative">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about your diagnosis, medications, or treatment..."
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-12 sm:pr-14 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-lg bg-white/90 backdrop-blur-sm transition-all duration-300 placeholder-gray-500 text-sm sm:text-base"
                        rows={1}
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 sm:right-4 top-3 sm:top-4">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Voice Input Button */}
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-3 sm:p-4 rounded-3xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                    title={isListening ? "Stop listening" : "Voice input"}
                  >
                    {isListening ? (
                      <MicOff className="h-5 w-5 sm:h-6 sm:w-6" />
                    ) : (
                      <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
                    )}
                  </button>

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 sm:p-4 rounded-3xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    {isLoading ? (
                      <Loader className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5 sm:h-6 sm:w-6" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-gray-500">
                    This is an AI assistant. Always consult your doctor for
                    medical advice.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-gray-500">
                      Secure & Private
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 3px;
        }

        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }

        /* Fix for mobile scrolling */
        @media (max-width: 768px) {
          .min-h-0 {
            min-height: 0;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatWithReport;

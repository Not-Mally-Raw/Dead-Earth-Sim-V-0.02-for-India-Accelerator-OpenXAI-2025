import React from "react";
import { motion } from "framer-motion";
import { Bot, User, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function ChatBubble({ message, type, timestamp, isTyping = false }) {
  const isBot = type === "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'} mb-4`}
    >
      {isBot && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isBot ? 'order-2' : 'order-1'}`}>
        <div
          className={`p-4 rounded-2xl shadow-sm ${
            isBot
              ? 'bg-white border border-blue-100'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
          }`}
        >
          {isTyping ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-sm text-blue-600">HealthCheck AI is typing...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className={`text-sm leading-relaxed ${isBot ? 'text-gray-800' : 'text-white'}`}>
                {message}
              </p>
              {timestamp && (
                <p className={`text-xs ${isBot ? 'text-gray-500' : 'text-blue-100'}`}>
                  {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {!isBot && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </motion.div>
  );
}
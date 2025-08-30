import React, { useState, useEffect, useRef } from "react";
import { SymptomAssessment } from "@/entities/SymptomAssessment";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, AlertCircle, Heart } from "lucide-react";
import { motion } from "framer-motion";

import ChatBubble from "../components/chat/ChatBubble";
import QuickResponses from "../components/chat/QuickResponses";
import ConditionResults from "../components/chat/ConditionResults";

export default function SymptomChecker() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState("greeting");
  const [userSymptoms, setUserSymptoms] = useState({
    primaryComplaint: "",
    symptoms: [],
    duration: "",
    severity: "",
    ageRange: "adult"
  });
  const [quickResponses, setQuickResponses] = useState([]);
  const [assessment, setAssessment] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Welcome message
    const welcomeMessage = {
      type: "bot",
      message: "Hello! I'm HealthCheck AI, your symptom assessment assistant. I'll ask you some questions about your symptoms to provide general guidance. Remember, this is not a substitute for professional medical advice. What's your main concern or symptom today?",
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, []);

  const addMessage = (message, type) => {
    const newMessage = {
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addBotMessage = async (message, delay = 1000) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsTyping(false);
    addMessage(message, "bot");
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addMessage(userMessage, "user");
    setInputValue("");

    await processUserInput(userMessage);
  };

  const handleQuickResponse = async (response) => {
    addMessage(response, "user");
    setQuickResponses([]);
    await processUserInput(response);
  };

  const processUserInput = async (input) => {
    switch (currentStep) {
      case "greeting":
        setUserSymptoms(prev => ({ ...prev, primaryComplaint: input }));
        await addBotMessage("Thank you for sharing that. Can you tell me how long you've been experiencing this symptom?");
        setQuickResponses(["A few hours", "1-2 days", "A week", "More than a week", "Several weeks"]);
        setCurrentStep("duration");
        break;

      case "duration":
        setUserSymptoms(prev => ({ ...prev, duration: input }));
        await addBotMessage("On a scale of 1-10, how would you rate the severity of your symptoms, where 1 is very mild and 10 is extremely severe?");
        setQuickResponses(["1-3 (Mild)", "4-6 (Moderate)", "7-8 (Severe)", "9-10 (Emergency)"]);
        setCurrentStep("severity");
        break;

      case "severity":
        let severityLevel = "mild";
        if (input.includes("4-6")) severityLevel = "moderate";
        else if (input.includes("7-8")) severityLevel = "severe";
        else if (input.includes("9-10")) severityLevel = "emergency";
        
        setUserSymptoms(prev => ({ ...prev, severity: severityLevel }));
        
        if (severityLevel === "emergency") {
          await addBotMessage("⚠️ Based on your severity rating, you should seek immediate medical attention. Please call emergency services (911) or go to the nearest emergency room right away. The assessment below is for additional information only.");
        }
        
        await addBotMessage("Could you describe any additional symptoms you're experiencing? This will help me provide a more accurate assessment.");
        setCurrentStep("additional_symptoms");
        break;

      case "additional_symptoms":
        const allSymptoms = [userSymptoms.primaryComplaint, input].filter(Boolean);
        setUserSymptoms(prev => ({ ...prev, symptoms: allSymptoms }));
        await generateAssessment(allSymptoms, userSymptoms.duration, userSymptoms.severity);
        setCurrentStep("complete");
        break;

      case "complete":
        await addBotMessage("I've already provided your assessment above. Would you like to start a new symptom check or do you have questions about the results?");
        setQuickResponses(["Start new check", "Emergency contacts", "Medical disclaimer"]);
        break;
    }
  };

  const generateAssessment = async (symptoms, duration, severity) => {
    setIsTyping(true);
    
    try {
      const prompt = `
        You are a medical AI assistant providing symptom assessment. Based on the following information, provide a JSON assessment:

        Primary symptoms: ${symptoms.join(", ")}
        Duration: ${duration}
        Severity: ${severity}

        Please provide:
        1. Up to 3 possible conditions that could match these symptoms (with confidence levels)
        2. Appropriate recommendations for next steps
        3. Any red flags that require immediate attention

        Format your response as JSON with this structure:
        {
          "possible_conditions": [
            {"condition": "condition name", "confidence": "high/medium/low", "description": "brief explanation"},
          ],
          "recommendations": ["recommendation 1", "recommendation 2", ...],
          "notes": "any important additional information"
        }

        Remember to:
        - Be conservative in assessments
        - Always recommend consulting healthcare professionals
        - Identify serious symptoms that need immediate attention
        - Provide helpful but general guidance only
      `;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            possible_conditions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  condition: { type: "string" },
                  confidence: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            notes: { type: "string" }
          }
        }
      });

      const assessmentData = {
        symptoms,
        severity,
        primary_complaint: userSymptoms.primaryComplaint,
        duration,
        age_range: userSymptoms.ageRange,
        possible_conditions: result.possible_conditions || [],
        recommendations: result.recommendations || [],
        chat_history: messages
      };

      setAssessment(assessmentData);
      
      // Save to database
      await SymptomAssessment.create(assessmentData);

      setIsTyping(false);
      await addBotMessage("I've completed your symptom assessment. Please review the results below and remember to consult with a healthcare professional for proper diagnosis and treatment.");
      
      setQuickResponses(["Start new check", "Save this assessment", "Emergency contacts"]);

    } catch (error) {
      setIsTyping(false);
      await addBotMessage("I apologize, but I'm having trouble processing your symptoms right now. For your safety, please consider contacting a healthcare provider directly or calling emergency services if you have serious symptoms.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([{
      type: "bot",
      message: "Let's start fresh! What's your main concern or symptom today?",
      timestamp: new Date().toISOString()
    }]);
    setCurrentStep("greeting");
    setUserSymptoms({
      primaryComplaint: "",
      symptoms: [],
      duration: "",
      severity: "",
      ageRange: "adult"
    });
    setQuickResponses([]);
    setAssessment(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Symptom Assessment
            </h1>
          </motion.div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get personalized health guidance based on your symptoms. Always consult healthcare professionals for proper medical advice.
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="p-6">
            {/* Messages */}
            <div className="h-96 overflow-y-auto mb-6 space-y-4">
              {messages.map((msg, index) => (
                <ChatBubble
                  key={index}
                  message={msg.message}
                  type={msg.type}
                  timestamp={msg.timestamp}
                />
              ))}
              {isTyping && <ChatBubble type="bot" isTyping />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Responses */}
            <QuickResponses options={quickResponses} onSelect={handleQuickResponse} />

            {/* Input */}
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your symptoms..."
                className="flex-1 border-blue-200 focus:border-blue-400 bg-white"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {currentStep === "complete" && (
              <Button
                onClick={resetChat}
                variant="outline"
                className="mt-4 w-full border-blue-200 hover:bg-blue-50"
              >
                Start New Assessment
              </Button>
            )}
          </div>
        </Card>

        {/* Assessment Results */}
        {assessment && <ConditionResults assessment={assessment} />}
      </div>
    </div>
  );
}
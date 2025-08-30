import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, Calendar, Phone } from "lucide-react";

export default function ConditionResults({ assessment }) {
  if (!assessment) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'severe': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mt-6"
    >
      {/* Severity Assessment */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            Assessment Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Severity Level:</span>
            <Badge className={`${getSeverityColor(assessment.severity)} border font-semibold`}>
              {assessment.severity.toUpperCase()}
            </Badge>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-600">Duration:</span>
            <span className="ml-2 text-sm">{assessment.duration}</span>
          </div>
        </CardContent>
      </Card>

      {/* Possible Conditions */}
      {assessment.possible_conditions && assessment.possible_conditions.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="w-5 h-5 text-blue-600" />
              Possible Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessment.possible_conditions.map((condition, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-blue-900">{condition.condition}</h4>
                    <Badge variant="outline" className="text-xs">
                      {condition.confidence} match
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700">{condition.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {assessment.recommendations && assessment.recommendations.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assessment.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-green-700">{index + 1}</span>
                  </div>
                  <p className="text-sm text-green-800">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Warning for Severe Cases */}
      {assessment.severity === 'emergency' && (
        <Card className="border-2 border-red-300 bg-red-50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 text-lg mb-2">⚠️ Seek Immediate Medical Attention</h3>
                <p className="text-red-800 mb-4">
                  Based on your symptoms, you should seek emergency medical care right away.
                </p>
                <div className="space-y-1 text-sm">
                  <div className="font-semibold text-red-900">🚨 Emergency: 911</div>
                  <div className="text-red-800">🏥 Go to nearest emergency room</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical Disclaimer */}
      <Card className="bg-blue-50 border-blue-200 shadow-sm">
        <CardContent className="p-4">
          <p className="text-xs text-blue-800 text-center">
            <strong>Medical Disclaimer:</strong> This assessment is for informational purposes only and should not replace professional medical advice. 
            Always consult with a qualified healthcare provider for proper diagnosis and treatment.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
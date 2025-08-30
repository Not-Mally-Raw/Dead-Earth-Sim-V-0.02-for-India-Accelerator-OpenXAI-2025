import React, { useState, useEffect } from "react";
import { SymptomAssessment } from "@/entities/SymptomAssessment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Clock, AlertTriangle, FileText, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function History() {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const data = await SymptomAssessment.list("-created_date");
      setAssessments(data);
    } catch (error) {
      console.error("Error loading assessments:", error);
    }
    setIsLoading(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'severe': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-6">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Assessment History</h1>
          <p className="text-gray-600">Review your previous symptom assessments and health guidance.</p>
        </div>

        {assessments.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Assessments Yet</h3>
              <p className="text-gray-500">Complete your first symptom check to see your history here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Assessment List */}
            <div className="space-y-4">
              {assessments.map((assessment, index) => (
                <motion.div
                  key={assessment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedAssessment?.id === assessment.id ? 'ring-2 ring-blue-400' : ''
                    }`}
                    onClick={() => setSelectedAssessment(assessment)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {assessment.primary_complaint}
                        </CardTitle>
                        <Badge className={`${getSeverityColor(assessment.severity)} border text-xs font-medium`}>
                          {assessment.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {format(new Date(assessment.created_date), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-500">Duration:</span>
                          <span className="ml-2 text-sm">{assessment.duration}</span>
                        </div>
                        {assessment.symptoms && assessment.symptoms.length > 1 && (
                          <div>
                            <span className="text-xs font-medium text-gray-500">Additional symptoms:</span>
                            <p className="text-sm text-gray-700 line-clamp-2 mt-1">
                              {assessment.symptoms.slice(1).join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Selected Assessment Details */}
            <div className="lg:sticky lg:top-8">
              {selectedAssessment ? (
                <motion.div
                  key={selectedAssessment.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-blue-600" />
                        Assessment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Basic Info */}
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500">Primary Complaint:</span>
                          <p className="text-sm font-semibold mt-1">{selectedAssessment.primary_complaint}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Severity:</span>
                            <div className="mt-1">
                              <Badge className={`${getSeverityColor(selectedAssessment.severity)} border`}>
                                {selectedAssessment.severity}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Duration:</span>
                            <p className="text-sm mt-1">{selectedAssessment.duration}</p>
                          </div>
                        </div>
                      </div>

                      {/* Possible Conditions */}
                      {selectedAssessment.possible_conditions && selectedAssessment.possible_conditions.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Possible Conditions</h4>
                          <div className="space-y-3">
                            {selectedAssessment.possible_conditions.map((condition, index) => (
                              <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex justify-between items-start mb-1">
                                  <h5 className="font-medium text-blue-900 text-sm">{condition.condition}</h5>
                                  <Badge variant="outline" className="text-xs">
                                    {condition.confidence}
                                  </Badge>
                                </div>
                                <p className="text-xs text-blue-700">{condition.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {selectedAssessment.recommendations && selectedAssessment.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                          <div className="space-y-2">
                            {selectedAssessment.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-semibold text-green-700">{index + 1}</span>
                                </div>
                                <p className="text-xs text-green-800">{rec}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          Assessed on {format(new Date(selectedAssessment.created_date), "MMMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Card className="shadow-lg">
                  <CardContent className="p-16 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-600 mb-2">Select an Assessment</h3>
                    <p className="text-sm text-gray-500">Click on any assessment from the list to view detailed results.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
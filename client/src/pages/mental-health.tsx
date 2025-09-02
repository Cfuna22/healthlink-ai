import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  Brain, 
  TrendingUp, 
  Shield, 
  Lightbulb,
  Clock,
  AlertTriangle,
  CheckCircle,
  Smile,
  Frown,
  Meh
} from "lucide-react";
import { type MentalHealthAssessment } from "@shared/schema";

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'scale' | 'choice' | 'text';
  options?: string[];
  scale?: { min: number; max: number; labels: string[] };
}

const assessmentTypes = {
  mood: {
    name: "Mood Assessment",
    description: "Evaluate your current emotional state and mood patterns",
    questions: [
      {
        id: "mood_overall",
        question: "How would you describe your overall mood over the past week?",
        type: "scale",
        scale: { min: 1, max: 5, labels: ["Very Poor", "Poor", "Fair", "Good", "Excellent"] }
      },
      {
        id: "energy_level",
        question: "How has your energy level been?",
        type: "scale",
        scale: { min: 1, max: 5, labels: ["Very Low", "Low", "Moderate", "High", "Very High"] }
      },
      {
        id: "sleep_quality",
        question: "How would you rate your sleep quality?",
        type: "scale",
        scale: { min: 1, max: 5, labels: ["Very Poor", "Poor", "Fair", "Good", "Excellent"] }
      },
      {
        id: "mood_description",
        question: "Please describe any specific mood changes or concerns you've noticed:",
        type: "text"
      }
    ]
  },
  anxiety: {
    name: "Anxiety Assessment",
    description: "Assess anxiety levels and identify triggers",
    questions: [
      {
        id: "anxiety_frequency",
        question: "How often have you felt anxious or worried in the past two weeks?",
        type: "choice",
        options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
      },
      {
        id: "anxiety_intensity",
        question: "When you feel anxious, how intense is it on a scale of 1-10?",
        type: "scale",
        scale: { min: 1, max: 10, labels: ["Mild", "Moderate", "Severe"] }
      },
      {
        id: "anxiety_triggers",
        question: "What situations or thoughts tend to trigger your anxiety?",
        type: "text"
      },
      {
        id: "physical_symptoms",
        question: "Do you experience physical symptoms when anxious?",
        type: "choice",
        options: ["No symptoms", "Mild symptoms", "Moderate symptoms", "Severe symptoms"]
      }
    ]
  },
  depression: {
    name: "Depression Screening",
    description: "Screen for depressive symptoms and their impact",
    questions: [
      {
        id: "interest_loss",
        question: "Little interest or pleasure in doing things?",
        type: "choice",
        options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
      },
      {
        id: "feeling_down",
        question: "Feeling down, depressed, or hopeless?",
        type: "choice",
        options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
      },
      {
        id: "concentration",
        question: "Trouble concentrating on things?",
        type: "choice",
        options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
      },
      {
        id: "additional_concerns",
        question: "Any additional concerns about your mental health?",
        type: "text"
      }
    ]
  },
  stress: {
    name: "Stress Assessment",
    description: "Evaluate stress levels and coping mechanisms",
    questions: [
      {
        id: "stress_level",
        question: "What is your current stress level?",
        type: "scale",
        scale: { min: 1, max: 10, labels: ["No stress", "Mild", "Moderate", "High", "Overwhelming"] }
      },
      {
        id: "stress_sources",
        question: "What are the main sources of stress in your life?",
        type: "text"
      },
      {
        id: "coping_effectiveness",
        question: "How effective are your current coping strategies?",
        type: "scale",
        scale: { min: 1, max: 5, labels: ["Not effective", "Slightly", "Moderately", "Very", "Extremely"] }
      },
      {
        id: "support_system",
        question: "How would you rate your support system?",
        type: "scale",
        scale: { min: 1, max: 5, labels: ["Very Poor", "Poor", "Fair", "Good", "Excellent"] }
      }
    ]
  }
};

export default function MentalHealth() {
  const [selectedAssessment, setSelectedAssessment] = useState<string>("mood");
  const [responses, setResponses] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['/api/mental-health-assessments'],
    queryFn: () => apiRequest('/api/mental-health-assessments', {
      method: 'GET'
    })
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/mental-health-assessments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Assessment Complete",
        description: "Your mental health assessment has been completed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mental-health-assessments'] });
      setResponses({});
    },
    onError: (error: any) => {
      toast({
        title: "Assessment Failed",
        description: error.message || "Failed to submit assessment.",
        variant: "destructive",
      });
    }
  });

  const currentAssessment = assessmentTypes[selectedAssessment as keyof typeof assessmentTypes];

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    const requiredQuestions = currentAssessment.questions.filter(q => q.type !== 'text');
    const missingResponses = requiredQuestions.filter(q => !responses[q.id]);

    if (missingResponses.length > 0) {
      toast({
        title: "Incomplete Assessment",
        description: "Please answer all required questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate({
      assessmentType: selectedAssessment,
      responses
    });
  };

  const renderQuestion = (question: AssessmentQuestion) => {
    switch (question.type) {
      case 'scale':
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium">{question.question}</Label>
            <RadioGroup
              value={responses[question.id]?.toString()}
              onValueChange={(value) => handleResponseChange(question.id, parseInt(value))}
              className="flex flex-col space-y-2"
            >
              {question.scale?.labels.map((label, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={(index + 1).toString()} 
                    id={`${question.id}-${index}`}
                    data-testid={`radio-${question.id}-${index}`}
                  />
                  <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                    {index + 1} - {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'choice':
        return (
          <div className="space-y-3">
            <Label className="text-sm font-medium">{question.question}</Label>
            <RadioGroup
              value={responses[question.id]}
              onValueChange={(value) => handleResponseChange(question.id, value)}
              className="flex flex-col space-y-2"
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option} 
                    id={`${question.id}-${index}`}
                    data-testid={`radio-${question.id}-${index}`}
                  />
                  <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-3">
            <Label htmlFor={question.id} className="text-sm font-medium">{question.question}</Label>
            <Textarea
              id={question.id}
              placeholder="Please share your thoughts..."
              value={responses[question.id] || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              data-testid={`textarea-${question.id}`}
              className="min-h-[100px]"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Meh className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderAssessmentCard = (assessment: MentalHealthAssessment) => {
    const recommendations = assessment.recommendations as any;

    return (
      <Card key={assessment.id} className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            {assessmentTypes[assessment.assessmentType as keyof typeof assessmentTypes]?.name || 'Mental Health Assessment'}
          </CardTitle>
          <CardDescription>
            {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : 'Unknown date'} - Score: {assessment.score || 'N/A'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score and Risk Level */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Score</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{assessment.score || 'N/A'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {getRiskLevelIcon(assessment.riskLevel || 'low')}
                  <span className="text-sm font-medium">Risk Level</span>
                </div>
                <p className="text-2xl font-bold capitalize">{assessment.riskLevel || 'Low'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <span className="text-sm font-medium">Assessment</span>
                </div>
                <p className="text-lg font-bold capitalize">{assessment.assessmentType}</p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {recommendations && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                Recommendations
              </h4>
              <div className="space-y-4">
                {recommendations.immediate && recommendations.immediate.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-red-600">Immediate Actions</Label>
                    <div className="space-y-1 mt-1">
                      {recommendations.immediate.map((rec: string, index: number) => (
                        <Badge key={index} variant="destructive" className="mr-2 mb-1">
                          {rec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {recommendations.shortTerm && recommendations.shortTerm.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-yellow-600">Short-term Strategies</Label>
                    <div className="space-y-1 mt-1">
                      {recommendations.shortTerm.map((rec: string, index: number) => (
                        <Badge key={index} variant="secondary" className="mr-2 mb-1">
                          {rec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {recommendations.longTerm && recommendations.longTerm.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-green-600">Long-term Goals</Label>
                    <div className="space-y-1 mt-1">
                      {recommendations.longTerm.map((rec: string, index: number) => (
                        <Badge key={index} variant="outline" className="mr-2 mb-1">
                          {rec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Follow-up */}
          {assessment.followUpDate && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Follow-up Recommended
              </h4>
              <p className="text-sm text-gray-600">
                Next assessment recommended by: {new Date(assessment.followUpDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Heart className="h-8 w-8 text-pink-600" />
          Mental Health Assistant
        </h1>
        <p className="text-gray-600">
          AI-powered mental health assessment and personalized recommendations
        </p>
      </div>

      <Tabs defaultValue="assessment" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessment" data-testid="tab-assessment">Take Assessment</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Assessment History</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mental Health Assessment</CardTitle>
              <CardDescription>
                Choose an assessment type and answer the questions honestly for personalized insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assessment Type Selection */}
              <div>
                <Label htmlFor="assessment-type">Assessment Type</Label>
                <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                  <SelectTrigger data-testid="select-assessment-type">
                    <SelectValue placeholder="Select assessment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(assessmentTypes).map(([key, assessment]) => (
                      <SelectItem key={key} value={key}>
                        {assessment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  {currentAssessment.description}
                </p>
              </div>

              {/* Assessment Questions */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">{currentAssessment.name}</h3>
                {currentAssessment.questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardContent className="p-4">
                      {renderQuestion(question)}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={submitMutation.isPending}
                className="w-full"
                data-testid="button-submit-assessment"
              >
                {submitMutation.isPending ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Assessment...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Submit Assessment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Assessment History
              </CardTitle>
              <CardDescription>
                View your previous mental health assessments and track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assessmentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Brain className="h-6 w-6 animate-spin mr-2" />
                  Loading assessments...
                </div>
              ) : assessments && Array.isArray(assessments) && assessments.length > 0 ? (
                <div className="space-y-4">
                  {assessments.map((assessment: MentalHealthAssessment) => renderAssessmentCard(assessment))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No assessments yet. Take your first mental health assessment to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
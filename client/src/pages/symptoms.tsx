import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { type SymptomAnalysisResult } from "@shared/schema";

export default function Symptoms() {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [duration, setDuration] = useState("");
  const [results, setResults] = useState<SymptomAnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeSymptoms = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/symptoms/analyze", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Your symptoms have been analyzed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your symptoms before proceeding.",
        variant: "destructive",
      });
      return;
    }

    analyzeSymptoms.mutate({
      symptoms: symptoms.trim(),
      age: age ? parseInt(age) : undefined,
      gender: gender || undefined,
      duration: duration || undefined,
      userId: "guest", // In a real app, this would be the logged-in user's ID
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          AI Symptom Checker
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Describe your symptoms and get AI-powered insights to help guide your next steps.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Symptom Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="symptoms" className="text-sm font-medium">
                  Describe your symptoms
                </Label>
                <Textarea 
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-[120px] resize-none"
                  placeholder="Please describe your symptoms in detail. For example: 'I have had a headache for 2 days, along with nausea and sensitivity to light...'"
                  data-testid="textarea-symptoms"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input 
                    type="number" 
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    data-testid="input-age"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger data-testid="select-duration">
                      <SelectValue placeholder="How long?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Few hours</SelectItem>
                      <SelectItem value="1-2days">1-2 days</SelectItem>
                      <SelectItem value="3-7days">3-7 days</SelectItem>
                      <SelectItem value="1-2weeks">1-2 weeks</SelectItem>
                      <SelectItem value="longer">Longer than 2 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={analyzeSymptoms.isPending}
                data-testid="button-analyze-symptoms"
              >
                {analyzeSymptoms.isPending ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze Symptoms
                  </>
                )}
              </Button>
            </form>
            
            {/* Results Panel */}
            {results && (
              <div className="mt-8 p-6 bg-muted rounded-lg border fade-in" data-testid="results-panel">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  Analysis Results
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground" data-testid="text-condition">
                          {results.condition}
                        </h4>
                        <div className="flex gap-2">
                          <Badge className={getUrgencyColor(results.urgency)} data-testid="badge-urgency">
                            {results.urgency.charAt(0).toUpperCase() + results.urgency.slice(1)} Priority
                          </Badge>
                          <Badge variant="outline" data-testid="badge-confidence">
                            {results.confidence}% Confidence
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3" data-testid="text-description">
                        {results.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-background rounded-md border">
                    <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Recommended Actions
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1" data-testid="list-recommendations">
                      {results.recommendations.map((recommendation, index) => (
                        <li key={index}>• {recommendation}</li>
                      ))}
                    </ul>
                  </div>

                  {results.urgency === 'high' && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                          <h4 className="font-medium text-destructive">Urgent Medical Attention Recommended</h4>
                          <p className="text-sm text-destructive/90 mt-1">
                            Based on your symptoms, we recommend seeking immediate medical attention. Please contact your healthcare provider or visit an emergency room.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

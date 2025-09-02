import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Calendar, 
  Thermometer, 
  PillBottle, 
  Heart, 
  Activity, 
  Smile,
  Trash2,
  TrendingUp
} from "lucide-react";
import HealthChart from "@/components/health-chart";
import { type HealthLog } from "@shared/schema";

export default function Logs() {
  const [logType, setLogType] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logDescription, setLogDescription] = useState("");
  const [severity, setSeverity] = useState([5]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const userId = "guest"; // In a real app, this would be the logged-in user's ID

  // Fetch health logs
  const { data: healthLogs = [], isLoading } = useQuery({
    queryKey: ['/api/health-logs', { userId }],
    enabled: !!userId,
  });

  // Fetch health trends
  const { data: trendsData } = useQuery({
    queryKey: ['/api/health/trends', { userId }],
    enabled: !!userId && healthLogs.length > 0,
  });

  // Create health log mutation
  const createLog = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/health-logs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/health-logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/health/trends'] });
      setLogType("");
      setLogDescription("");
      setSeverity([5]);
      toast({
        title: "Log Entry Added",
        description: "Your health log entry has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Save",
        description: error.message || "Failed to save health log entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete health log mutation
  const deleteLog = useMutation({
    mutationFn: async (logId: string) => {
      await apiRequest("DELETE", `/api/health-logs/${logId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/health-logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/health/trends'] });
      toast({
        title: "Log Entry Deleted",
        description: "Your health log entry has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete",
        description: error.message || "Failed to delete health log entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!logType || !logDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createLog.mutate({
      type: logType,
      date: new Date(logDate).toISOString(),
      description: logDescription.trim(),
      severity: severity[0],
      userId,
    });
  };

  const getLogIcon = (type: string) => {
    const iconMap = {
      symptoms: Thermometer,
      medication: PillBottle,
      vitals: Heart,
      exercise: Activity,
      mood: Smile,
    };
    const Icon = iconMap[type as keyof typeof iconMap] || Activity;
    return <Icon className="h-5 w-5" />;
  };

  const getLogColor = (type: string) => {
    const colorMap = {
      symptoms: "text-red-600",
      medication: "text-blue-600",
      vitals: "text-green-600",
      exercise: "text-purple-600",
      mood: "text-yellow-600",
    };
    return colorMap[type as keyof typeof colorMap] || "text-gray-600";
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return "bg-green-100 text-green-800";
    if (severity <= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Health Logs & Tracking
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Track your symptoms, medications, and health metrics over time to identify patterns.
        </p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Add New Log Entry */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Health Log Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logType">Log Type</Label>
                  <Select value={logType} onValueChange={setLogType}>
                    <SelectTrigger data-testid="select-log-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="symptoms">Symptoms</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="vitals">Vital Signs</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="mood">Mood</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logDate">Date</Label>
                  <Input 
                    type="date" 
                    id="logDate"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    data-testid="input-log-date"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logDescription">Description</Label>
                  <Textarea 
                    id="logDescription"
                    value={logDescription}
                    onChange={(e) => setLogDescription(e.target.value)}
                    placeholder="Describe your symptoms, medication taken, or other health details..."
                    className="min-h-[80px]"
                    data-testid="textarea-log-description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity (1-10)</Label>
                  <div className="px-3">
                    <Slider
                      id="severity"
                      min={1}
                      max={10}
                      step={1}
                      value={severity}
                      onValueChange={setSeverity}
                      className="w-full"
                      data-testid="slider-severity"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>Mild</span>
                    <span className="font-medium">{severity[0]}/10</span>
                    <span>Severe</span>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createLog.isPending}
                  data-testid="button-add-log"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Log Entry
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Logs and Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Visualization */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Health Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthLogs.length > 0 ? (
                <div className="space-y-4">
                  <HealthChart logs={healthLogs} />
                  {trendsData?.analysis && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">AI Insights</h4>
                      <p className="text-sm text-muted-foreground" data-testid="text-ai-insights">
                        {trendsData.analysis}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Add health log entries to see trends and patterns
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recent Log Entries */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Entries</CardTitle>
                {healthLogs.length > 5 && (
                  <Button variant="link" className="text-sm">View All</Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-muted rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : healthLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No health log entries yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start tracking your health by adding your first log entry
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {healthLogs.slice(0, 5).map((log: HealthLog) => (
                    <div 
                      key={log.id} 
                      className="flex items-start space-x-4 p-4 bg-muted/50 rounded-lg"
                      data-testid={`log-entry-${log.id}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        log.type === 'symptoms' ? 'bg-red-100' : 
                        log.type === 'medication' ? 'bg-blue-100' :
                        log.type === 'vitals' ? 'bg-green-100' :
                        log.type === 'exercise' ? 'bg-purple-100' : 'bg-yellow-100'
                      }`}>
                        <div className={getLogColor(log.type)}>
                          {getLogIcon(log.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-foreground capitalize" data-testid="text-log-type">
                            {log.type}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground" data-testid="text-log-date">
                              {formatDate(log.date)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteLog.mutate(log.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              data-testid={`button-delete-log-${log.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground" data-testid="text-log-description">
                          {log.description}
                        </p>
                        {log.severity && (
                          <div className="mt-2">
                            <Badge className={getSeverityColor(log.severity)} data-testid="badge-log-severity">
                              Severity: {log.severity}/10
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

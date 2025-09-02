import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dumbbell, 
  Target, 
  TrendingUp, 
  Heart, 
  Activity,
  Clock,
  Trophy,
  Zap,
  Calendar,
  Brain,
  Star
} from "lucide-react";
import { type FitnessPlan } from "@shared/schema";

interface UserProfile {
  age: string;
  gender: string;
  height: string;
  weight: string;
  activityLevel: string;
  experience: string;
  healthConditions: string;
  availableTime: string;
  equipment: string[];
}

const activityLevels = [
  { value: "sedentary", label: "Sedentary (little to no exercise)" },
  { value: "lightly_active", label: "Lightly Active (light exercise 1-3 days/week)" },
  { value: "moderately_active", label: "Moderately Active (moderate exercise 3-5 days/week)" },
  { value: "very_active", label: "Very Active (hard exercise 6-7 days/week)" },
  { value: "extremely_active", label: "Extremely Active (very hard exercise, physical job)" }
];

const equipmentOptions = [
  "None (bodyweight only)",
  "Dumbbells",
  "Resistance bands",
  "Gym membership",
  "Home gym setup",
  "Yoga mat",
  "Kettlebells",
  "Pull-up bar",
  "Exercise bike",
  "Treadmill"
];

export default function Fitness() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    experience: "",
    healthConditions: "",
    availableTime: "",
    equipment: []
  });
  const [goals, setGoals] = useState({
    primaryGoal: "",
    specificGoals: "",
    timeframe: "",
    motivation: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fitnessPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/fitness-plans'],
    queryFn: () => apiRequest('/api/fitness-plans', {
      method: 'GET'
    })
  });

  const createPlanMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/fitness-plans', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Fitness Plan Created",
        description: "Your personalized fitness plan has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/fitness-plans'] });
      // Reset form
      setUserProfile({
        age: "",
        gender: "",
        height: "",
        weight: "",
        activityLevel: "",
        experience: "",
        healthConditions: "",
        availableTime: "",
        equipment: []
      });
      setGoals({
        primaryGoal: "",
        specificGoals: "",
        timeframe: "",
        motivation: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Plan Creation Failed",
        description: error.message || "Failed to create fitness plan.",
        variant: "destructive",
      });
    }
  });

  const updateProfile = (field: keyof UserProfile, value: string | string[]) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateGoals = (field: string, value: string) => {
    setGoals(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    if (checked) {
      updateProfile('equipment', [...userProfile.equipment, equipment]);
    } else {
      updateProfile('equipment', userProfile.equipment.filter(e => e !== equipment));
    }
  };

  const handleSubmit = () => {
    // Basic validation
    if (!userProfile.age || !userProfile.gender || !userProfile.activityLevel || !goals.primaryGoal) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createPlanMutation.mutate({
      userProfile,
      goals
    });
  };

  const renderFitnessPlanCard = (plan: FitnessPlan) => {
    const workoutPlan = plan.workoutPlan as any;
    const nutritionPlan = plan.nutritionPlan as any;
    const progressTracking = plan.progressTracking as any;

    return (
      <Card key={plan.id} className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-600" />
            {plan.fitnessLevel ? `${plan.fitnessLevel.charAt(0).toUpperCase() + plan.fitnessLevel.slice(1)} ` : ''}Fitness Plan
            {plan.isActive === 1 && (
              <Badge variant="default" className="ml-2">
                <Star className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Created: {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'Unknown date'}
            {plan.updatedAt && plan.updatedAt !== plan.createdAt && (
              <span> • Updated: {new Date(plan.updatedAt).toLocaleDateString()}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Goals Overview */}
          {plan.goals && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                Fitness Goals
              </h4>
              <div className="space-y-2">
                {Array.isArray(plan.goals) ? (
                  plan.goals.map((goal: string, index: number) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {goal}
                    </Badge>
                  ))
                ) : typeof plan.goals === 'object' ? (
                  Object.entries(plan.goals).map(([key, value]: [string, any], index: number) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {key}: {String(value)}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline">{String(plan.goals)}</Badge>
                )}
              </div>
            </div>
          )}

          {/* Workout Plan */}
          {workoutPlan && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                Workout Schedule
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workoutPlan.schedule && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Schedule</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Frequency:</strong> {workoutPlan.schedule.frequency || 'Not specified'}</p>
                        <p><strong>Duration:</strong> {workoutPlan.schedule.duration || 'Not specified'}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {workoutPlan.exercises && workoutPlan.exercises.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Exercise Types</span>
                      </div>
                      <div className="space-y-1">
                        {workoutPlan.exercises.slice(0, 3).map((exercise: any, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                            {typeof exercise === 'string' ? exercise : exercise.name || 'Exercise'}
                          </Badge>
                        ))}
                        {workoutPlan.exercises.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{workoutPlan.exercises.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Nutrition Guidelines */}
          {nutritionPlan && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                Nutrition Guidelines
              </h4>
              <Card>
                <CardContent className="p-4">
                  {typeof nutritionPlan === 'object' ? (
                    <div className="space-y-2">
                      {Object.entries(nutritionPlan).map(([key, value]: [string, any], index: number) => (
                        <div key={index} className="text-sm">
                          <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}: </strong>
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm">{String(nutritionPlan)}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Progress Tracking */}
          {progressTracking && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Progress Tracking
              </h4>
              <Card>
                <CardContent className="p-4">
                  {typeof progressTracking === 'object' ? (
                    <div className="space-y-2">
                      {Object.entries(progressTracking).map(([key, value]: [string, any], index: number) => (
                        <div key={index} className="text-sm">
                          <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}: </strong>
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm">{String(progressTracking)}</p>
                  )}
                </CardContent>
              </Card>
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
          <Dumbbell className="h-8 w-8 text-blue-600" />
          AI Fitness Coach
        </h1>
        <p className="text-gray-600">
          Get personalized fitness plans and workout recommendations powered by AI
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create" data-testid="tab-create">Create Plan</TabsTrigger>
          <TabsTrigger value="plans" data-testid="tab-plans">My Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Tell us about yourself to create a personalized fitness plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={userProfile.age}
                      onChange={(e) => updateProfile('age', e.target.value)}
                      data-testid="input-age"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={userProfile.gender} onValueChange={(value) => updateProfile('gender', value)}>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      value={userProfile.height}
                      onChange={(e) => updateProfile('height', e.target.value)}
                      data-testid="input-height"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={userProfile.weight}
                      onChange={(e) => updateProfile('weight', e.target.value)}
                      data-testid="input-weight"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="activity-level">Current Activity Level *</Label>
                  <Select value={userProfile.activityLevel} onValueChange={(value) => updateProfile('activityLevel', value)}>
                    <SelectTrigger data-testid="select-activity-level">
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experience">Fitness Experience</Label>
                  <Select value={userProfile.experience} onValueChange={(value) => updateProfile('experience', value)}>
                    <SelectTrigger data-testid="select-experience">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (0-6 months)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (6 months - 2 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (2+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="available-time">Available Time per Workout</Label>
                  <Select value={userProfile.availableTime} onValueChange={(value) => updateProfile('availableTime', value)}>
                    <SelectTrigger data-testid="select-available-time">
                      <SelectValue placeholder="Select workout duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15-30">15-30 minutes</SelectItem>
                      <SelectItem value="30-45">30-45 minutes</SelectItem>
                      <SelectItem value="45-60">45-60 minutes</SelectItem>
                      <SelectItem value="60+">60+ minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="health-conditions">Health Conditions or Injuries</Label>
                  <Textarea
                    id="health-conditions"
                    placeholder="Any injuries, health conditions, or physical limitations..."
                    value={userProfile.healthConditions}
                    onChange={(e) => updateProfile('healthConditions', e.target.value)}
                    data-testid="textarea-health-conditions"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Goals and Equipment */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fitness Goals</CardTitle>
                  <CardDescription>
                    What do you want to achieve with your fitness plan?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="primary-goal">Primary Goal *</Label>
                    <Select value={goals.primaryGoal} onValueChange={(value) => updateGoals('primaryGoal', value)}>
                      <SelectTrigger data-testid="select-primary-goal">
                        <SelectValue placeholder="Select primary goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                        <SelectItem value="strength">Build Strength</SelectItem>
                        <SelectItem value="endurance">Improve Endurance</SelectItem>
                        <SelectItem value="flexibility">Increase Flexibility</SelectItem>
                        <SelectItem value="general_fitness">General Fitness</SelectItem>
                        <SelectItem value="sports_performance">Sports Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="specific-goals">Specific Goals</Label>
                    <Textarea
                      id="specific-goals"
                      placeholder="e.g., Lose 10kg, run 5km without stopping, bench press bodyweight..."
                      value={goals.specificGoals}
                      onChange={(e) => updateGoals('specificGoals', e.target.value)}
                      data-testid="textarea-specific-goals"
                    />
                  </div>

                  <div>
                    <Label htmlFor="timeframe">Timeframe</Label>
                    <Select value={goals.timeframe} onValueChange={(value) => updateGoals('timeframe', value)}>
                      <SelectTrigger data-testid="select-timeframe">
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1_month">1 Month</SelectItem>
                        <SelectItem value="3_months">3 Months</SelectItem>
                        <SelectItem value="6_months">6 Months</SelectItem>
                        <SelectItem value="1_year">1 Year</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="motivation">What Motivates You?</Label>
                    <Textarea
                      id="motivation"
                      placeholder="What keeps you motivated to exercise? Any specific reasons for starting?"
                      value={goals.motivation}
                      onChange={(e) => updateGoals('motivation', e.target.value)}
                      data-testid="textarea-motivation"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Equipment</CardTitle>
                  <CardDescription>
                    Select the equipment you have access to
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {equipmentOptions.map((equipment) => (
                      <div key={equipment} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`equipment-${equipment}`}
                          checked={userProfile.equipment.includes(equipment)}
                          onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                          className="rounded"
                          data-testid={`checkbox-equipment-${equipment.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <Label htmlFor={`equipment-${equipment}`} className="text-sm cursor-pointer">
                          {equipment}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={createPlanMutation.isPending}
            className="w-full"
            data-testid="button-create-plan"
          >
            {createPlanMutation.isPending ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-spin" />
                Creating Your Fitness Plan...
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                Create My Fitness Plan
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                My Fitness Plans
              </CardTitle>
              <CardDescription>
                View and manage your personalized fitness plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Brain className="h-6 w-6 animate-spin mr-2" />
                  Loading fitness plans...
                </div>
              ) : fitnessPlans && Array.isArray(fitnessPlans) && fitnessPlans.length > 0 ? (
                <div className="space-y-4">
                  {fitnessPlans.map((plan: FitnessPlan) => renderFitnessPlanCard(plan))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No fitness plans yet. Create your first personalized fitness plan!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
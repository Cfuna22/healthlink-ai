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
  Apple, 
  TrendingUp, 
  Target, 
  Brain, 
  Heart, 
  Activity,
  ChefHat,
  Lightbulb,
  Clock,
  Plus
} from "lucide-react";
import { type NutritionAnalysis } from "@shared/schema";

interface FoodItem {
  name: string;
  quantity: string;
  unit: string;
}

export default function Nutrition() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([{ name: "", quantity: "", unit: "grams" }]);
  const [healthGoals, setHealthGoals] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analyses, isLoading: analysesLoading } = useQuery({
    queryKey: ['/api/nutrition-analyses'],
    queryFn: () => apiRequest('/api/nutrition-analyses', {
      method: 'GET'
    })
  });

  const analyzeMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/nutrition-analyses', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Nutrition Analysis Complete",
        description: "Your nutritional analysis has been completed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/nutrition-analyses'] });
      setFoodItems([{ name: "", quantity: "", unit: "grams" }]);
      setHealthGoals("");
      setRestrictions("");
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze nutrition data.",
        variant: "destructive",
      });
    }
  });

  const addFoodItem = () => {
    setFoodItems([...foodItems, { name: "", quantity: "", unit: "grams" }]);
  };

  const updateFoodItem = (index: number, field: keyof FoodItem, value: string) => {
    const updated = [...foodItems];
    updated[index][field] = value;
    setFoodItems(updated);
  };

  const removeFoodItem = (index: number) => {
    if (foodItems.length > 1) {
      setFoodItems(foodItems.filter((_, i) => i !== index));
    }
  };

  const handleAnalyze = () => {
    const validFoodItems = foodItems.filter(item => item.name.trim() && item.quantity.trim());
    
    if (validFoodItems.length === 0) {
      toast({
        title: "No Food Items",
        description: "Please add at least one food item to analyze.",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate({
      foodItems: validFoodItems,
      healthGoals,
      restrictions,
      mealType
    });
  };

  const renderNutritionCard = (analysis: NutritionAnalysis) => {
    const breakdown = analysis.nutritionalBreakdown as any;
    const recommendations = analysis.recommendations as any;

    return (
      <Card key={analysis.id} className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-green-600" />
            Nutritional Analysis
          </CardTitle>
          <CardDescription>
            {analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString() : 'Unknown date'} - {breakdown?.calories || 0} calories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Calorie Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Calories</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">{breakdown?.calories || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Health Score</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{breakdown?.healthScore || 'N/A'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Goal Alignment</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{breakdown?.goalAlignment || 'N/A'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Macronutrients */}
          {breakdown?.macronutrients && (
            <div>
              <h4 className="font-semibold mb-3">Macronutrients</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Protein</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={(breakdown.macronutrients.protein / 150) * 100} className="flex-1" />
                    <span className="text-sm font-medium">{breakdown.macronutrients.protein}g</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Carbs</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={(breakdown.macronutrients.carbs / 300) * 100} className="flex-1" />
                    <span className="text-sm font-medium">{breakdown.macronutrients.carbs}g</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Fats</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={(breakdown.macronutrients.fats / 100) * 100} className="flex-1" />
                    <span className="text-sm font-medium">{breakdown.macronutrients.fats}g</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations?.mealPlan && recommendations.mealPlan.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                Recommendations
              </h4>
              <div className="space-y-2">
                {recommendations.mealPlan.map((rec: string, index: number) => (
                  <Badge key={index} variant="secondary" className="mr-2 mb-2">
                    {rec}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Deficiencies */}
          {breakdown?.deficiencies && breakdown.deficiencies.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-red-600">Nutritional Gaps</h4>
              <div className="space-y-2">
                {breakdown.deficiencies.map((deficiency: string, index: number) => (
                  <Badge key={index} variant="destructive" className="mr-2 mb-2">
                    {deficiency}
                  </Badge>
                ))}
              </div>
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
          <Apple className="h-8 w-8 text-green-600" />
          AI Nutrition Assistant
        </h1>
        <p className="text-gray-600">
          Get personalized nutritional analysis and recommendations powered by AI
        </p>
      </div>

      <Tabs defaultValue="analyze" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analyze" data-testid="tab-analyze">Analyze Nutrition</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Analysis History</TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nutritional Analysis</CardTitle>
              <CardDescription>
                Add your food items and get AI-powered nutritional insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meal Type */}
              <div>
                <Label htmlFor="meal-type">Meal Type</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger data-testid="select-meal-type">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Food Items */}
              <div>
                <Label className="text-base font-semibold">Food Items</Label>
                <div className="space-y-3 mt-2">
                  {foodItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`food-${index}`} className="text-sm">Food Item</Label>
                        <Input
                          id={`food-${index}`}
                          placeholder="e.g., Apple, Chicken breast"
                          value={item.name}
                          onChange={(e) => updateFoodItem(index, 'name', e.target.value)}
                          data-testid={`input-food-${index}`}
                        />
                      </div>
                      <div className="w-24">
                        <Label htmlFor={`quantity-${index}`} className="text-sm">Quantity</Label>
                        <Input
                          id={`quantity-${index}`}
                          placeholder="100"
                          value={item.quantity}
                          onChange={(e) => updateFoodItem(index, 'quantity', e.target.value)}
                          data-testid={`input-quantity-${index}`}
                        />
                      </div>
                      <div className="w-24">
                        <Label htmlFor={`unit-${index}`} className="text-sm">Unit</Label>
                        <Select value={item.unit} onValueChange={(value) => updateFoodItem(index, 'unit', value)}>
                          <SelectTrigger data-testid={`select-unit-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grams">grams</SelectItem>
                            <SelectItem value="oz">oz</SelectItem>
                            <SelectItem value="cups">cups</SelectItem>
                            <SelectItem value="pieces">pieces</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {foodItems.length > 1 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeFoodItem(index)}
                          data-testid={`button-remove-${index}`}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    onClick={addFoodItem} 
                    className="w-full"
                    data-testid="button-add-food"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Food Item
                  </Button>
                </div>
              </div>

              {/* Health Goals */}
              <div>
                <Label htmlFor="health-goals">Health Goals (Optional)</Label>
                <Textarea
                  id="health-goals"
                  placeholder="e.g., Weight loss, muscle gain, heart health, diabetes management"
                  value={healthGoals}
                  onChange={(e) => setHealthGoals(e.target.value)}
                  data-testid="textarea-health-goals"
                />
              </div>

              {/* Dietary Restrictions */}
              <div>
                <Label htmlFor="restrictions">Dietary Restrictions (Optional)</Label>
                <Textarea
                  id="restrictions"
                  placeholder="e.g., Vegetarian, gluten-free, dairy-free, nut allergies"
                  value={restrictions}
                  onChange={(e) => setRestrictions(e.target.value)}
                  data-testid="textarea-restrictions"
                />
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={analyzeMutation.isPending}
                className="w-full"
                data-testid="button-analyze"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Nutrition...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Nutrition
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
                Analysis History
              </CardTitle>
              <CardDescription>
                View your previous nutritional analyses and track your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Brain className="h-6 w-6 animate-spin mr-2" />
                  Loading analyses...
                </div>
              ) : analyses && Array.isArray(analyses) && analyses.length > 0 ? (
                <div className="space-y-4">
                  {analyses.map((analysis: NutritionAnalysis) => renderNutritionCard(analysis))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Apple className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No nutritional analyses yet. Start by analyzing your first meal!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NutritionInfo } from "@/components/nutrition-info";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { analyzeFoodImage, AnalyzeFoodImageOutput } from "@/ai/flows/analyze-food-image";
import { Alert, AlertDescription as AD, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { generateDietPlan, GenerateDietPlanOutput } from "@/ai/flows/generate-diet-plan";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [nutritionInfo, setNutritionInfo] = useState<AnalyzeFoodImageOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Diet Plan State
  const [age, setAge] = useState<number | undefined>(undefined);
  const [gender, setGender] = useState<"male" | "female" | undefined>(undefined);
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [activityLevel, setActivityLevel] = useState<"sedentary" | "lightlyActive" | "moderatelyActive" | "veryActive" | "extraActive" | undefined>(undefined);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>("");
  const [goal, setGoal] = useState<"weightLoss" | "weightGain" | "maintainWeight" | undefined>(undefined);
  const [dietPlan, setDietPlan] = useState<GenerateDietPlanOutput | null>(null);
  const [dietPlanLoading, setDietPlanLoading] = useState<boolean>(false);
  const [dietPlanError, setDietPlanError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!image) {
      setError("Please upload an image or activate the camera.");
      return;
    }

    setLoading(true);
    setError(null);
    setNutritionInfo(null);

    try {
      const result = await analyzeFoodImage({ photoDataUri: image, description: "" });
      setNutritionInfo(result);
    } catch (e: any) {
      setError(e.message || "Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDietPlan = async () => {
    if (!age || !gender || !weight || !height || !activityLevel || !goal) {
      setDietPlanError("Please fill in all required fields for the diet plan.");
      return;
    }

    setDietPlanLoading(true);
    setDietPlanError(null);
    setDietPlan(null);

    try {
      const result = await generateDietPlan({
        age,
        gender,
        weight,
        height,
        activityLevel,
        dietaryRestrictions,
        goal,
      });
      setDietPlan(result);
    } catch (e: any) {
      setDietPlanError(e.message || "Failed to generate diet plan. Please try again.");
    } finally {
      setDietPlanLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-12 bg-light-gray">
      <h1 className="text-4xl font-bold mb-8 text-primary">NutriSnap</h1>

      {/* Image Analysis Card */}
      <Card className="w-full max-w-md space-y-4">
        <CardHeader>
          <CardTitle>Image Analysis</CardTitle>
          <CardDescription>Upload an image of your food to analyze its macronutrients.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="image">Upload Image</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          {image && (
            <img src={image} alt="Uploaded Food" className="rounded-md object-contain max-h-48 w-full" />
          )}
          <Button onClick={handleAnalyzeImage} disabled={loading || !image}>
            {loading ? "Analyzing..." : "Analyze Image"}
          </Button>
        </CardContent>
      </Card>

      {/* Display Nutrition Information */}
      {nutritionInfo && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Nutrition Information</h2>
          <NutritionInfo nutrition={nutritionInfo.foodItem.nutrition} name={nutritionInfo.foodItem.name} image={image}/>
        </div>
      )}

        {/* Diet Plan Form */}
        <Card className="w-full max-w-md space-y-4 mt-8">
          <CardHeader>
            <CardTitle>Generate Diet Plan</CardTitle>
            <CardDescription>Answer a few questions to generate a personalized diet plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" placeholder="Age" value={age} onChange={(e) => setAge(Number(e.target.value))} />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => setGender(value as "male" | "female")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" type="number" placeholder="Height (cm)" value={height} onChange={(e) => setHeight(Number(e.target.value))} />
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="activityLevel">Activity Level</Label>
              <Select onValueChange={(value) => setActivityLevel(value as "sedentary" | "lightlyActive" | "moderatelyActive" | "veryActive" | "extraActive")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="lightlyActive">Lightly Active</SelectItem>
                  <SelectItem value="moderatelyActive">Moderately Active</SelectItem>
                  <SelectItem value="veryActive">Very Active</SelectItem>
                  <SelectItem value="extraActive">Extra Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
              <Textarea
                id="dietaryRestrictions"
                placeholder="e.g., Gluten-free, Vegetarian"
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="goal">Goal</Label>
              <Select onValueChange={(value) => setGoal(value as "weightLoss" | "weightGain" | "maintainWeight")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weightLoss">Weight Loss</SelectItem>
                  <SelectItem value="weightGain">Weight Gain</SelectItem>
                  <SelectItem value="maintainWeight">Maintain Weight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateDietPlan} disabled={dietPlanLoading}>
              {dietPlanLoading ? "Generating..." : "Generate Diet Plan"}
            </Button>
          </CardContent>
        </Card>

        {/* Display Diet Plan */}
        {dietPlan && (
          <div className="mt-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Diet Plan</h2>
            <Card className="space-y-4">
              <CardContent>
                <p>{dietPlan.dietPlan}</p>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Error Dialog */}
      {error && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">View Error</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>{error}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction>Okay</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

       {/* Diet Plan Error Dialog */}
       {dietPlanError && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">View Diet Plan Error</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Diet Plan Error</AlertDialogTitle>
              <AlertDialogDescription>{dietPlanError}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction>Okay</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

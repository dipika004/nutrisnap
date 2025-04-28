'use client';

import {useState} from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {NutritionInfo} from '@/components/nutrition-info';
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
} from '@/components/ui/alert-dialog';
import {Alert, AlertDescription as AD, AlertTitle} from '@/components/ui/alert';
import {useToast} from '@/hooks/use-toast';
import {
  generateDietPlan,
  GenerateDietPlanOutput,
} from '@/ai/flows/generate-diet-plan';
import {Textarea} from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  analyzeFoodImage,
  AnalyzeFoodImageOutput,
} from '@/ai/flows/analyze-food-image';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [nutritionInfo, setNutritionInfo] =
    useState<AnalyzeFoodImageOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const {toast} = useToast();

  const [age, setAge] = useState<number | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [activityLevel, setActivityLevel] = useState<string | null>(null);
  const [foodChoices, setFoodChoices] = useState<string | null>('');
  const [foodsToAvoid, setFoodsToAvoid] = useState<string | null>('');
  const [favoriteFoods, setFavoriteFoods] = useState<string | null>('');
  const [healthGoal, setHealthGoal] = useState<string | null>(null);
  const [mealPreferences, setMealPreferences] = useState<string | null>('');
  const [snackingHabits, setSnackingHabits] = useState<string | null>('');
  const [targetCaloricIntake, setTargetCaloricIntake] = useState<number | null>(
    null
  );
  const [dietPlan, setDietPlan] = useState<GenerateDietPlanOutput | null>(null);
  const [recommendedProteinIntake, setRecommendedProteinIntake] =
    useState<number | null>(null);

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
      setError('Please upload an image.');
      return;
    }

    setLoading(true);
    setError(null);
    setNutritionInfo(null);

    try {
      const result = await analyzeFoodImage({photoDataUri: image});
      setNutritionInfo(result);
    } catch (e: any) {
      setError(e.message || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDietPlan = async () => {
    setLoading(true);
    setError(null);
    setDietPlan(null);
    setRecommendedProteinIntake(null);

    try {
      if (
        !age ||
        !gender ||
        !height ||
        !weight ||
        !activityLevel ||
        !targetCaloricIntake
      ) {
        setError('Please fill in all required fields for the diet plan.');
        return;
      }

      const result = await generateDietPlan({
        age: age,
        gender: gender as 'male' | 'female',
        height: height,
        weight: weight,
        activityLevel:
          activityLevel as
            | 'sedentary'
            | 'lightlyActive'
            | 'moderatelyActive'
            | 'highlyActive',
        foodChoices: foodChoices || undefined,
        foodsToAvoid: foodsToAvoid || undefined,
        favoriteFoods: favoriteFoods || undefined,
        healthGoal:
          healthGoal as
            | 'weightLoss'
            | 'weightGain'
            | 'muscleBuilding'
            | 'overallHealth',
        mealPreferences: mealPreferences || undefined,
        snackingHabits: snackingHabits || undefined,
        targetCaloricIntake: targetCaloricIntake,
      });
      setDietPlan(result);

      // Calculate recommended protein intake
      const proteinIntake = weight * 1.6; // Adjust factor as needed
      setRecommendedProteinIntake(proteinIntake);
    } catch (e: any) {
      setError(e.message || 'Failed to generate diet plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDietPlan = () => {
    if (!dietPlan) {
      setError('No diet plan to download.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Your Personalized Diet Plan', 14, 22);

    doc.setFontSize(12);
    let y = 40; // Starting Y position

    if (recommendedProteinIntake) {
      doc.text(`Recommended Protein Intake: ${recommendedProteinIntake.toFixed(2)} grams`, 14, y);
      y += 10;
    }

    // Define table headers
    const tableColumnTitles = [
      'Meal Time',
      'Food Items',
      'Portion Size',
      'Calories',
      'Protein (g)',
      'Carbs (g)',
      'Fats (g)',
      'Micronutrient Focus',
    ];

    // Prepare table data
    const tableData = dietPlan.dietPlan.map(meal => [
      meal.mealTime,
      meal.foodItems,
      meal.portionSize,
      meal.calories.toString(),
      meal.protein.toString(),
      meal.carbs.toString(),
      meal.fat.toString(),
      meal.micronutrientFocus || '',
    ]);

    // Add table to PDF
    (doc as any).autoTable({
      head: [tableColumnTitles],
      body: tableData,
      startY: y,
      margin: {horizontal: 14},
      columnStyles: {
        0: {cellWidth: 20}, // Meal Time
        1: {cellWidth: 40}, // Food Items
        2: {cellWidth: 20}, // Portion Size
        3: {cellWidth: 15}, // Calories
        4: {cellWidth: 15}, // Protein
        5: {cellWidth: 15}, // Carbs
        6: {cellWidth: 15}, // Fats
        7: {cellWidth: 30}, // Micronutrient Focus
      },
      styles: {
        fontSize: 8,
        overflow: 'linebreak',
        tableWidth: 'auto',
      },
      headerStyles: {
        fillColor: '#4CAF50', // Primary color (fresh green)
        textColor: '#FFFFFF',
        fontSize: 9,
        fontStyle: 'bold',
      },
    });

    doc.save('diet_plan.pdf');
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-12 bg-light-gray">
      <h1 className="text-4xl font-bold mb-8 text-primary">NutriSnap</h1>

      {/* Image Analysis Card */}
      <Card className="w-full max-w-md mb-8 space-y-4">
        <CardHeader>
          <CardTitle>Analyze Food Image</CardTitle>
          <CardDescription>
            Upload an image of your food to analyze its nutrients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-4"
          />
          {image && (
            <img
              src={image}
              alt="Food"
              className="rounded-md object-contain max-h-48 w-full mb-4"
            />
          )}
          <Button onClick={handleAnalyzeImage} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </Button>
          {nutritionInfo && (
            <NutritionInfo
              name={nutritionInfo.foodItem.name}
              nutrition={nutritionInfo.foodItem.nutrition}
              image={image}
            />
          )}
        </CardContent>
      </Card>

      {/* Diet Plan Form */}
      <Card className="w-full max-w-md mt-8 space-y-4">
        <CardHeader>
          <CardTitle>Generate Diet Plan</CardTitle>
          <CardDescription>
            Enter your details to generate a personalized diet plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={age || ''}
                onChange={e => setAge(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={gender || ''}
                onChange={e => setGender(e.target.value)}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={height || ''}
                onChange={e => setHeight(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={weight || ''}
                onChange={e => setWeight(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="activityLevel">Activity Level</Label>
              <select
                id="activityLevel"
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={activityLevel || ''}
                onChange={e => setActivityLevel(e.target.value)}
              >
                <option value="">Select</option>
                <option value="sedentary">Sedentary</option>
                <option value="lightlyActive">Lightly Active</option>
                <option value="moderatelyActive">Moderately Active</option>
                <option value="highlyActive">Highly Active</option>
              </select>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="targetCaloricIntake">
                Target Caloric Intake
              </Label>
              <Input
                id="targetCaloricIntake"
                type="number"
                value={targetCaloricIntake || ''}
                onChange={e => setTargetCaloricIntake(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="foodChoices">
              Food Choices (e.g., vegetarian)
            </Label>
            <Input
              id="foodChoices"
              type="text"
              value={foodChoices || ''}
              onChange={e => setFoodChoices(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="foodsToAvoid">Foods to Avoid</Label>
            <Input
              id="foodsToAvoid"
              type="text"
              value={foodsToAvoid || ''}
              onChange={e => setFoodsToAvoid(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="favoriteFoods">Favorite Foods</Label>
            <Input
              id="favoriteFoods"
              type="text"
              value={favoriteFoods || ''}
              onChange={e => setFavoriteFoods(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="healthGoal">Health Goal</Label>
            <select
              id="healthGoal"
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={healthGoal || ''}
              onChange={e => setHealthGoal(e.target.value)}
            >
              <option value="">Select</option>
              <option value="weightLoss">Weight Loss</option>
              <option value="weightGain">Weight Gain</option>
              <option value="muscleBuilding">Muscle Building</option>
              <option value="overallHealth">Overall Health</option>
            </select>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="mealPreferences">Meal Preferences</Label>
            <Input
              id="mealPreferences"
              type="text"
              value={mealPreferences || ''}
              onChange={e => setMealPreferences(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="snackingHabits">Snacking Habits</Label>
            <Input
              id="snackingHabits"
              type="text"
              value={snackingHabits || ''}
              onChange={e => setSnackingHabits(e.target.value)}
            />
          </div>

          <Button onClick={handleGenerateDietPlan} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Diet Plan'}
          </Button>
        </CardContent>
      </Card>

      {/* Display Recommended Protein Intake */}
      {recommendedProteinIntake && (
        <div className="mt-8 w-full max-w-full overflow-x-auto">
          {' '}
          {/* Updated to full width and added overflow */}
          <h2 className="text-2xl font-semibold mb-4 text-primary">
            Recommended Protein Intake
          </h2>
          <Card>
            <CardContent className="p-4">
              {' '}
              {/* Reduced padding for better spacing */}
              <p>
                Based on your weight, the recommended daily protein intake is:{' '}
                {recommendedProteinIntake.toFixed(2)} grams.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Display Diet Plan */}
      {dietPlan && (
        <div className="mt-8 w-full max-w-full overflow-x-auto">
          {' '}
          {/* Updated to full width and added overflow */}
          <h2 className="text-2xl font-semibold mb-4 text-primary">
            Diet Plan
          </h2>
          <Card>
            <CardContent className="p-4">
              {' '}
              {/* Reduced padding for better spacing */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[15%]">Meal Time</TableHead>{' '}
                    {/* Adjusted widths */}
                    <TableHead className="w-[25%]">Food Items</TableHead>
                    <TableHead className="w-[15%]">Portion Size</TableHead>
                    <TableHead className="w-[10%]">Calories</TableHead>
                    <TableHead className="w-[10%]">Protein (g)</TableHead>
                    <TableHead className="w-[10%]">Carbs (g)</TableHead>
                    <TableHead className="w-[10%]">Fats (g)</TableHead>
                    <TableHead className="w-[15%]">
                      Micronutrient Focus
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dietPlan.dietPlan.map((meal, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {meal.mealTime}
                      </TableCell>
                      <TableCell>{meal.foodItems}</TableCell>
                      <TableCell>{meal.portionSize}</TableCell>
                      <TableCell>{meal.calories}</TableCell>
                      <TableCell>{meal.protein}</TableCell>
                      <TableCell>{meal.carbs}</TableCell>
                      <TableCell>{meal.fat}</TableCell>
                      <TableCell>{meal.micronutrientFocus}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
            {dietPlan && (
        <Button onClick={handleDownloadDietPlan} disabled={loading}>
          Download Diet Plan (PDF)
        </Button>
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
    </div>
  );
}


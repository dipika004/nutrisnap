'use server';

/**
 * @fileOverview Generates a personalized diet plan based on user inputs.
 *
 * - generateDietPlan - A function that generates the diet plan.
 * - GenerateDietPlanInput - The input type for the generateDietPlan function.
 * - GenerateDietPlanOutput - The return type for the generateDietPlan function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateDietPlanInputSchema = z.object({
  age: z.number().describe('The age of the user.'),
  gender: z.enum(['male', 'female']).describe('The gender of the user.'),
  height: z.number().describe('The height of the user in centimeters.'),
  weight: z.number().describe('The weight of the user in kilograms.'),
  activityLevel: z.enum(['sedentary', 'lightlyActive', 'moderatelyActive', 'highlyActive']).describe('The activity level of the user.'),
  foodChoices: z.string().optional().describe('The food choices of the user (e.g., vegetarian, vegan, non-vegetarian).'),
  foodsToAvoid: z.string().optional().describe('Foods that the user wants to avoid.'),
  favoriteFoods: z.string().optional().describe('Favorite foods of the user.'),
  healthGoal: z.enum(['weightLoss', 'weightGain', 'muscleBuilding', 'overallHealth']).describe('The health goal of the user.'),
  mealPreferences: z.string().optional().describe('Meal preferences like number of meals per day and portion sizes.'),
  snackingHabits: z.string().optional().describe('Snacking habits of the user.'),
  targetCaloricIntake: z.number().describe('Target caloric intake for the user.'),
});
export type GenerateDietPlanInput = z.infer<typeof GenerateDietPlanInputSchema>;

const MealSchema = z.object({
  mealTime: z.string().describe('The time of the meal (e.g., Breakfast, Lunch, Dinner, Snack).'),
  foodItems: z.string().describe('The food items in the meal (e.g., Oats, Chicken, Vegetables).'),
  portionSize: z.string().describe('The portion size of the food items (e.g., 1 cup, 150 grams).'),
  calories: z.number().describe('The number of calories in the meal.'),
  protein: z.number().describe('The amount of protein in grams.'),
  carbs: z.number().describe('The amount of carbohydrates in grams.'),
  fat: z.number().describe('The amount of fat in grams.'),
  micronutrientFocus: z.string().optional().describe('The micronutrient focus of the meal (e.g., High in Protein, Low in Carbs, Rich in Fiber).'),
});

const GenerateDietPlanOutputSchema = z.object({
  dietPlan: z.array(MealSchema).describe('A personalized diet plan for the user.'),
});
export type GenerateDietPlanOutput = z.infer<typeof GenerateDietPlanOutputSchema>;

export async function generateDietPlan(input: GenerateDietPlanInput): Promise<GenerateDietPlanOutput> {
  return generateDietPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDietPlanPrompt',
  input: {
    schema: z.object({
      age: z.number().describe('The age of the user.'),
      gender: z.enum(['male', 'female']).describe('The gender of the user.'),
      height: z.number().describe('The height of the user in centimeters.'),
      weight: z.number().describe('The weight of the user in kilograms.'),
      activityLevel: z.enum(['sedentary', 'lightlyActive', 'moderatelyActive', 'highlyActive']).describe('The activity level of the user.'),
      foodChoices: z.string().optional().describe('The food choices of the user (e.g., vegetarian, vegan, non-vegetarian).'),
      foodsToAvoid: z.string().optional().describe('Foods that the user wants to avoid.'),
      favoriteFoods: z.string().optional().describe('Favorite foods of the user.'),
      healthGoal: z.enum(['weightLoss', 'weightGain', 'muscleBuilding', 'overallHealth']).describe('The health goal of the user.'),
      mealPreferences: z.string().optional().describe('Meal preferences like number of meals per day and portion sizes.'),
      snackingHabits: z.string().optional().describe('Snacking habits of the user.'),
      targetCaloricIntake: z.number().describe('Target caloric intake for the user.'),
    }),
  },
  output: {
    schema: z.object({
      dietPlan: z.array(MealSchema).describe('A personalized diet plan for the user.'),
    }),
  },
  prompt: `You are an expert nutritionist. You will be given information about a user, including their age, gender, height, weight, activity level, dietary preferences, and health goals.

You will use this information to generate a detailed and personalized diet plan for the user. The diet plan should be safe, healthy, effective, easy to follow, and sustainable in the long term.

Return the diet plan as a JSON array, where each object in the array represents a meal and has the following keys:
- mealTime: The time of the meal (e.g., Breakfast, Lunch, Dinner, Snack).
- foodItems: The food items in the meal (e.g., Oats, Chicken, Vegetables).
- portionSize: The portion size of the food items (e.g., 1 cup, 150 grams).
- calories: The number of calories in the meal.
- protein: The amount of protein in grams.
- carbs: The amount of carbohydrates in grams.
- fat: The amount of fat in grams.
- micronutrientFocus: The micronutrient focus of the meal (e.g., High in Protein, Low in Carbs, Rich in Fiber).

Here is the user's information:
Age: {{{age}}}
Gender: {{{gender}}}
Height: {{{height}}} cm
Weight: {{{weight}}} kg
Activity Level: {{{activityLevel}}}
Food Choices: {{{foodChoices}}}
Foods to Avoid: {{{foodsToAvoid}}}
Favorite Foods: {{{favoriteFoods}}}
Health Goal: {{{healthGoal}}}
Meal Preferences: {{{mealPreferences}}}
Snacking Habits: {{{snackingHabits}}}
Target Caloric Intake: {{{targetCaloricIntake}}}

Please generate the diet plan in JSON format.
`,
});

const generateDietPlanFlow = ai.defineFlow<
  typeof GenerateDietPlanInputSchema,
  typeof GenerateDietPlanOutputSchema
>({
  name: 'generateDietPlanFlow',
  inputSchema: GenerateDietPlanInputSchema,
  outputSchema: GenerateDietPlanOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});

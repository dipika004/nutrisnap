'use server';

/**
 * @fileOverview Generates a personalized diet plan based on user preferences and dietary restrictions.
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
  weight: z.number().describe('The weight of the user in kilograms.'),
  height: z.number().describe('The height of the user in centimeters.'),
  activityLevel: z.enum(['sedentary', 'lightlyActive', 'moderatelyActive', 'veryActive', 'extraActive']).describe('The activity level of the user.'),
  dietaryRestrictions: z.string().optional().describe('Any dietary restrictions or allergies the user has.'),
  goal: z.enum(['weightLoss', 'weightGain', 'maintainWeight']).describe('The goal of the user.'),
});
export type GenerateDietPlanInput = z.infer<typeof GenerateDietPlanInputSchema>;

const GenerateDietPlanOutputSchema = z.object({
  dietPlan: z.string().describe('A detailed diet plan for the user, including meals and snacks for each day of the week.'),
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
      weight: z.number().describe('The weight of the user in kilograms.'),
      height: z.number().describe('The height of the user in centimeters.'),
      activityLevel: z.enum(['sedentary', 'lightlyActive', 'moderatelyActive', 'veryActive', 'extraActive']).describe('The activity level of the user.'),
      dietaryRestrictions: z.string().optional().describe('Any dietary restrictions or allergies the user has.'),
      goal: z.enum(['weightLoss', 'weightGain', 'maintainWeight']).describe('The goal of the user.'),
    }),
  },
  output: {
    schema: z.object({
      dietPlan: z.string().describe('A detailed diet plan for the user, including meals and snacks for each day of the week.'),
    }),
  },
  prompt: `You are an expert nutritionist. You will be given information about a user, including their age, gender, weight, height, activity level, dietary restrictions, and goal.

You will use this information to generate a detailed diet plan for the user, including meals and snacks for each day of the week.

Age: {{{age}}}
Gender: {{{gender}}}
Weight: {{{weight}}} kg
Height: {{{height}}} cm
Activity Level: {{{activityLevel}}}
Dietary Restrictions: {{{dietaryRestrictions}}}
Goal: {{{goal}}}

Please provide a diet plan that is safe, healthy, and effective for the user. The diet plan should be easy to follow and sustainable in the long term.`,
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

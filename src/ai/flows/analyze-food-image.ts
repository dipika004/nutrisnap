// 'use server'
'use server';
/**
 * @fileOverview Analyzes an image of food to identify it and estimate its macronutrient content.
 *
 * - analyzeFoodImage - A function that handles the image analysis process.
 * - AnalyzeFoodImageInput - The input type for the analyzeFoodImage function.
 * - AnalyzeFoodImageOutput - The return type for the analyzeFoodImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {searchFoodDatabase, FoodItem} from '@/services/food-database';

const AnalyzeFoodImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a food item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().optional().describe('Optional description of the food item.'),
});
export type AnalyzeFoodImageInput = z.infer<typeof AnalyzeFoodImageInputSchema>;

const AnalyzeFoodImageOutputSchema = z.object({
  foodItem: z.object({
    name: z.string().describe('The name of the identified food item.'),
    nutrition: z.object({
      calories: z.number().describe('The number of calories in the food item.'),
      protein: z.number().describe('The amount of protein in grams.'),
      carbs: z.number().describe('The amount of carbohydrates in grams.'),
      fat: z.number().describe('The amount of fat in grams.'),
    }).describe('The nutritional information for the food item.'),
  }).describe('The identified food item and its nutritional information.'),
});
export type AnalyzeFoodImageOutput = z.infer<typeof AnalyzeFoodImageOutputSchema>;

export async function analyzeFoodImage(input: AnalyzeFoodImageInput): Promise<AnalyzeFoodImageOutput> {
  return analyzeFoodImageFlow(input);
}

const findFoodItem = ai.defineTool(
  {
    name: 'findFoodItem',
    description: 'Searches a food database for items matching a given query.',
    inputSchema: z.object({
      query: z.string().describe('The search query (e.g., \"apple\", \"chicken breast\").'),
    }),
    outputSchema: z.array(z.object({
      name: z.string(),
      nutrition: z.object({
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
      })
    })),
  },
  async input => {
    return await searchFoodDatabase(input.query);
  }
);

const prompt = ai.definePrompt({
  name: 'analyzeFoodImagePrompt',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo of a food item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
      description: z.string().optional().describe('Optional description of the food item.'),
    }),
  },
  output: {
    schema: z.object({
      foodItem: z.object({
        name: z.string().describe('The name of the identified food item.'),
        nutrition: z.object({
          calories: z.number().describe('The number of calories in the food item.'),
          protein: z.number().describe('The amount of protein in grams.'),
          carbs: z.number().describe('The amount of carbohydrates in grams.'),
          fat: z.number().describe('The amount of fat in grams.'),
        }).describe('The nutritional information for the food item.'),
      }).describe('The identified food item and its nutritional information.'),
    }),
  },
  prompt: `You are an expert nutritionist. You will be given a photo of a food item and an optional description.

You will use this information to identify the food item and estimate its macronutrient content (calories, protein, carbs, and fat).

Use the findFoodItem tool to find the nutritional content for the food. If you cannot identify the food item, make your best guess.

Description: {{{description}}}
Photo: {{media url=photoDataUri}}`,
  tools: [findFoodItem],
});

const analyzeFoodImageFlow = ai.defineFlow<
  typeof AnalyzeFoodImageInputSchema,
  typeof AnalyzeFoodImageOutputSchema
>({
  name: 'analyzeFoodImageFlow',
  inputSchema: AnalyzeFoodImageInputSchema,
  outputSchema: AnalyzeFoodImageOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});

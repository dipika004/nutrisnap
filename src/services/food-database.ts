/**
 * Represents basic nutritional information for a food item.
 */
export interface Nutrition {
  /**
   * The number of calories in the food item.
   */
  calories: number;
  /**
   * The amount of protein in grams.
   */
  protein: number;
  /**
   * The amount of carbohydrates in grams.
   */
  carbs: number;
  /**
   * The amount of fat in grams.
   */
  fat: number;
}

/**
 * Represents a food item with its name and nutritional information.
 */
export interface FoodItem {
  /**
   * The name of the food item.
   */
  name: string;
  /**
   * The nutritional information for the food item.
   */
  nutrition: Nutrition;
}

/**
 * Asynchronously searches a food database for items matching a given query.
 * @param query The search query (e.g., "apple", "chicken breast").
 * @returns A promise that resolves to an array of FoodItem objects.
 */
export async function searchFoodDatabase(query: string): Promise<FoodItem[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      name: 'Apple',
      nutrition: {
        calories: 95,
        protein: 0.3,
        carbs: 25,
        fat: 0.3,
      },
    },
    {
      name: 'Chicken Breast',
      nutrition: {
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
      },
    },
  ];
}

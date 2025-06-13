import { atom } from 'jotai';
const fakeResponse = require('@/assets/response.json');

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface FoodAnalysis {
  id: string;
  timestamp: number;
  identifiedFood: string;
  image: string;
  mealType?: MealType;
  notes?: string;

  // Original data from Gemini
  portionSize: string;
  recognizedServingSize: string;
  nutritionFactsPerPortion: NutritionFactsPerPortion;
  additionalNotes: string[];
}

interface NutritionFactsPerPortion {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
  sodium: string;
  cholesterol: string;
}

export const analysisAtom = atom<Omit<FoodAnalysis, 'id' | 'timestamp' | 'mealType' | 'notes'> | null>(
  null
);

const createMockMeal = (id: string, food: string, mealType: MealType, daysAgo: number, hour: number, notes?: string): FoodAnalysis => ({
  ...fakeResponse,
  id,
  identifiedFood: food,
  timestamp: new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000) + (hour - 12) * 60 * 60 * 1000).getTime(),
  mealType,
  notes,
  image: `https://picsum.photos/200/200?random=${id}`,
});

const mockHistory: FoodAnalysis[] = [
  createMockMeal('1', 'Grilled Chicken Salad', 'Lunch', 0, 12, 'With avocado and vinaigrette'),
  createMockMeal('2', 'Greek Yogurt Bowl', 'Breakfast', 0, 8, 'With berries and granola'),
  createMockMeal('3', 'Quinoa Bowl', 'Lunch', 0, 13),
  createMockMeal('4', 'Grilled Salmon', 'Dinner', 1, 19, 'With steamed vegetables'),
  createMockMeal('5', 'Oatmeal', 'Breakfast', 1, 7, 'With banana and honey'),
  createMockMeal('6', 'Apple Slices', 'Snack', 1, 15),
  createMockMeal('7', 'Pasta Primavera', 'Dinner', 2, 18, 'Whole grain pasta with vegetables'),
];

export const historyAtom = atom<FoodAnalysis[]>(mockHistory);

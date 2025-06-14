export class Food {
  id: string;
  created_at: string;
  user_id: string;
  identifiedFood: string;
  image: string;
  mealType?: string;
  notes?: string;
  portionSize: string;
  recognizedServingSize: string;
  nutritionFactsPerPortion: Record<string, any>;
  additionalNotes: string[];
  timestamp: string;
} 
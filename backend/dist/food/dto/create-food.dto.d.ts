import { NutritionFactsDto } from './nutrition-facts.dto';
export declare class CreateFoodDto {
    identifiedFood: string;
    image: string;
    mealType?: string;
    notes?: string;
    portionSize: string;
    recognizedServingSize: string;
    nutritionFactsPerPortion: NutritionFactsDto;
    additionalNotes: string[];
    timestamp?: string;
}

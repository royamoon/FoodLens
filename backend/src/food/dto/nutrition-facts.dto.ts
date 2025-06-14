import { IsString, IsNotEmpty } from 'class-validator';

export class NutritionFactsDto {
  @IsString()
  @IsNotEmpty()
  calories: string;

  @IsString()
  @IsNotEmpty()
  protein: string;

  @IsString()
  @IsNotEmpty()
  carbs: string;

  @IsString()
  @IsNotEmpty()
  fat: string;

  @IsString()
  @IsNotEmpty()
  fiber: string;

  @IsString()
  @IsNotEmpty()
  sugar: string;

  @IsString()
  @IsNotEmpty()
  sodium: string;

  @IsString()
  @IsNotEmpty()
  cholesterol: string;
} 
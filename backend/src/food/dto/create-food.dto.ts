import {
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NutritionFactsDto } from './nutrition-facts.dto';

export class CreateFoodDto {
  @IsString()
  @IsNotEmpty()
  identifiedFood: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsOptional()
  mealType?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  portionSize: string;

  @IsString()
  @IsNotEmpty()
  recognizedServingSize: string;

  @ValidateNested()
  @Type(() => NutritionFactsDto)
  nutritionFactsPerPortion: NutritionFactsDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  additionalNotes: string[];

  @IsString()
  @IsOptional()
  timestamp?: string;
} 
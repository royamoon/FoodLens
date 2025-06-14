import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { Food } from './entities/food.entity';
import { SupabaseService } from '../supabase/supabase.service';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class FoodService {
  private readonly tableName = 'foods';

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Maps a food record from the database (snake_case) to our entity format.
   * @param dbFood The raw food object from the Supabase client.
   * @returns A Food entity object or null.
   */
  private _mapFoodToCamelCase(dbFood: any): Food | null {
    if (!dbFood) {
      return null;
    }
    return {
      id: dbFood.id,
      created_at: dbFood.created_at,
      user_id: dbFood.user_id,
      identifiedFood: dbFood.identified_food,
      image: dbFood.image,
      mealType: dbFood.meal_type,
      notes: dbFood.notes,
      portionSize: dbFood.portion_size,
      recognizedServingSize: dbFood.recognized_serving_size,
      nutritionFactsPerPortion: dbFood.nutrition_facts_per_portion,
      additionalNotes: dbFood.additional_notes,
      timestamp: dbFood.timestamp,
    };
  }

  private getClientWithAuth(accessToken?: string) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    
    console.log('[DEBUG] getClientWithAuth - SUPABASE_URL present:', !!supabaseUrl);
    console.log('[DEBUG] getClientWithAuth - SUPABASE_ANON_KEY present:', !!supabaseAnonKey);
    console.log('[DEBUG] getClientWithAuth - Access token present:', !!accessToken);

    if (accessToken) {
      console.log('[DEBUG] getClientWithAuth - Creating client with auth token');
      return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });
    }
    
    console.log('[DEBUG] getClientWithAuth - Using default Supabase service client');
    return this.supabaseService.getClient();
  }

  async create(
    createFoodDto: CreateFoodDto,
    userId: string,
    accessToken?: string,
  ): Promise<Food> {
    console.log('[DEBUG] FoodService.create - Starting food creation');
    console.log('[DEBUG] FoodService.create - userId:', userId);
    console.log('[DEBUG] FoodService.create - accessToken present:', !!accessToken);
    console.log('[DEBUG] FoodService.create - createFoodDto:', JSON.stringify(createFoodDto, null, 2));

    try {
      const client = this.getClientWithAuth(accessToken);
      console.log('[DEBUG] FoodService.create - Supabase client created');

      // Transform camelCase to snake_case for database
      const insertData = {
        user_id: userId,
        identified_food: createFoodDto.identifiedFood,
        image: createFoodDto.image,
        meal_type: createFoodDto.mealType,
        notes: createFoodDto.notes,
        portion_size: createFoodDto.portionSize,
        recognized_serving_size: createFoodDto.recognizedServingSize,
        nutrition_facts_per_portion: createFoodDto.nutritionFactsPerPortion,
        additional_notes: createFoodDto.additionalNotes || [],
        timestamp: new Date(),
      };

      console.log('[DEBUG] FoodService.create - insertData:', JSON.stringify(insertData, null, 2));

      const { data, error } = await client
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single();

      console.log('[DEBUG] FoodService.create - Supabase response data:', JSON.stringify(data, null, 2));
      console.log('[DEBUG] FoodService.create - Supabase response error:', JSON.stringify(error, null, 2));

      if (error) {
        console.error('[ERROR] FoodService.create - Supabase error details:', error);
        throw new Error(`Supabase error: ${error.message} (Code: ${error.code})`);
      }

      const result = this._mapFoodToCamelCase(data);
      console.log('[DEBUG] FoodService.create - Final result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('[ERROR] FoodService.create - Exception caught:', error);
      throw error;
    }
  }

  async findAll(userId: string, accessToken?: string): Promise<Food[]> {
    const client = this.getClientWithAuth(accessToken);

    const { data, error } = await client
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw new Error(error.message);

    return data?.map((item) => this._mapFoodToCamelCase(item)) || [];
  }

  async findOne(id: string, userId: string, accessToken?: string): Promise<Food> {
    const client = this.getClientWithAuth(accessToken);

    const { data, error } = await client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new NotFoundException(`Food with ID ${id} not found`);
    return this._mapFoodToCamelCase(data);
  }

  async update(
    id: string,
    updateFoodDto: UpdateFoodDto,
    userId: string,
    accessToken?: string,
  ): Promise<Food> {
    const client = this.getClientWithAuth(accessToken);

    const { data, error } = await client
      .from(this.tableName)
      .update(updateFoodDto)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new NotFoundException(`Food with ID ${id} not found`);
    return this._mapFoodToCamelCase(data);
  }

  async remove(id: string, userId: string, accessToken?: string) {
    const client = this.getClientWithAuth(accessToken);

    const { error } = await client
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new NotFoundException(`Food with ID ${id} not found`);
    return { message: `Food with ID ${id} deleted successfully` };
  }
} 
import { ConfigService } from '@nestjs/config';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { Food } from './entities/food.entity';
import { SupabaseService } from '../supabase/supabase.service';
export declare class FoodService {
    private readonly supabaseService;
    private readonly configService;
    private readonly tableName;
    constructor(supabaseService: SupabaseService, configService: ConfigService);
    private _mapFoodToCamelCase;
    private getClientWithAuth;
    create(createFoodDto: CreateFoodDto, userId: string, accessToken?: string): Promise<Food>;
    findAll(userId: string, accessToken?: string): Promise<Food[]>;
    findOne(id: string, userId: string, accessToken?: string): Promise<Food>;
    update(id: string, updateFoodDto: UpdateFoodDto, userId: string, accessToken?: string): Promise<Food>;
    remove(id: string, userId: string, accessToken?: string): Promise<{
        message: string;
    }>;
}

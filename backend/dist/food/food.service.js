"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_service_1 = require("../supabase/supabase.service");
const supabase_js_1 = require("@supabase/supabase-js");
let FoodService = class FoodService {
    constructor(supabaseService, configService) {
        this.supabaseService = supabaseService;
        this.configService = configService;
        this.tableName = 'foods';
    }
    _mapFoodToCamelCase(dbFood) {
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
    getClientWithAuth(accessToken) {
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseAnonKey = this.configService.get('SUPABASE_ANON_KEY');
        console.log('[DEBUG] getClientWithAuth - SUPABASE_URL present:', !!supabaseUrl);
        console.log('[DEBUG] getClientWithAuth - SUPABASE_ANON_KEY present:', !!supabaseAnonKey);
        console.log('[DEBUG] getClientWithAuth - Access token present:', !!accessToken);
        if (accessToken) {
            console.log('[DEBUG] getClientWithAuth - Creating client with auth token');
            return (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
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
    async create(createFoodDto, userId, accessToken) {
        console.log('[DEBUG] FoodService.create - Starting food creation');
        console.log('[DEBUG] FoodService.create - userId:', userId);
        console.log('[DEBUG] FoodService.create - accessToken present:', !!accessToken);
        console.log('[DEBUG] FoodService.create - createFoodDto:', JSON.stringify(createFoodDto, null, 2));
        try {
            const client = this.getClientWithAuth(accessToken);
            console.log('[DEBUG] FoodService.create - Supabase client created');
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
        }
        catch (error) {
            console.error('[ERROR] FoodService.create - Exception caught:', error);
            throw error;
        }
    }
    async findAll(userId, accessToken) {
        const client = this.getClientWithAuth(accessToken);
        const { data, error } = await client
            .from(this.tableName)
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data?.map((item) => this._mapFoodToCamelCase(item)) || [];
    }
    async findOne(id, userId, accessToken) {
        const client = this.getClientWithAuth(accessToken);
        const { data, error } = await client
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Food with ID ${id} not found`);
        return this._mapFoodToCamelCase(data);
    }
    async update(id, updateFoodDto, userId, accessToken) {
        const client = this.getClientWithAuth(accessToken);
        const { data, error } = await client
            .from(this.tableName)
            .update(updateFoodDto)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();
        if (error)
            throw new common_1.NotFoundException(`Food with ID ${id} not found`);
        return this._mapFoodToCamelCase(data);
    }
    async remove(id, userId, accessToken) {
        const client = this.getClientWithAuth(accessToken);
        const { error } = await client
            .from(this.tableName)
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
        if (error)
            throw new common_1.NotFoundException(`Food with ID ${id} not found`);
        return { message: `Food with ID ${id} deleted successfully` };
    }
};
exports.FoodService = FoodService;
exports.FoodService = FoodService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        config_1.ConfigService])
], FoodService);
//# sourceMappingURL=food.service.js.map
import { FoodService } from './food.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { Food } from './entities/food.entity';
export declare class FoodController {
    private readonly foodService;
    constructor(foodService: FoodService);
    create(createFoodDto: CreateFoodDto, req: any): Promise<Food>;
    findAll(req: any): Promise<Food[]>;
    findOne(id: string, req: any): Promise<Food>;
    update(id: string, updateFoodDto: UpdateFoodDto, req: any): Promise<Food>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FoodService } from './food.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { Food } from './entities/food.entity';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('food')
@UseGuards(AuthGuard)
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post()
  async create(
    @Body() createFoodDto: CreateFoodDto,
    @Request() req: any,
  ): Promise<Food> {
    console.log('[DEBUG] FoodController.create - Request received');
    console.log('[DEBUG] FoodController.create - User:', JSON.stringify(req.user, null, 2));
    console.log('[DEBUG] FoodController.create - Body:', JSON.stringify(createFoodDto, null, 2));
    
    // Extract access token from Authorization header
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.substring(7);
    console.log('[DEBUG] FoodController.create - Access token present:', !!accessToken);

    try {
      const result = await this.foodService.create(createFoodDto, req.user.id, accessToken);
      console.log('[DEBUG] FoodController.create - Success, returning result');
      return result;
    } catch (error) {
      console.error('[ERROR] FoodController.create - Error occurred:', error);
      throw error;
    }
  }

  @Get()
  findAll(@Request() req: any): Promise<Food[]> {
    // Extract access token from Authorization header
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.substring(7);
    return this.foodService.findAll(req.user.id, accessToken);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any): Promise<Food> {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.substring(7);
    return this.foodService.findOne(id, req.user.id, accessToken);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFoodDto: UpdateFoodDto,
    @Request() req: any,
  ): Promise<Food> {
    console.log('[DEBUG] FoodController.update - Request received');
    console.log('[DEBUG] FoodController.update - ID:', id);
    console.log('[DEBUG] FoodController.update - User:', JSON.stringify(req.user, null, 2));
    console.log('[DEBUG] FoodController.update - Body:', JSON.stringify(updateFoodDto, null, 2));

    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.substring(7);

    try {
      const result = await this.foodService.update(id, updateFoodDto, req.user.id, accessToken);
      console.log('[DEBUG] FoodController.update - Success, returning result');
      return result;
    } catch (error) {
      console.error('[ERROR] FoodController.update - Error occurred:', error);
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    console.log('[DEBUG] FoodController.remove - Request received');
    console.log('[DEBUG] FoodController.remove - ID:', id);
    console.log('[DEBUG] FoodController.remove - User:', JSON.stringify(req.user, null, 2));

    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.substring(7);

    try {
      const result = await this.foodService.remove(id, req.user.id, accessToken);
      console.log('[DEBUG] FoodController.remove - Success, returning result');
      return result;
    } catch (error) {
      console.error('[ERROR] FoodController.remove - Error occurred:', error);
      throw error;
    }
  }
} 
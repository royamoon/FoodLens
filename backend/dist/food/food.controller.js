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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodController = void 0;
const common_1 = require("@nestjs/common");
const food_service_1 = require("./food.service");
const create_food_dto_1 = require("./dto/create-food.dto");
const update_food_dto_1 = require("./dto/update-food.dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
let FoodController = class FoodController {
    constructor(foodService) {
        this.foodService = foodService;
    }
    async create(createFoodDto, req) {
        console.log('[DEBUG] FoodController.create - Request received');
        console.log('[DEBUG] FoodController.create - User:', JSON.stringify(req.user, null, 2));
        console.log('[DEBUG] FoodController.create - Body:', JSON.stringify(createFoodDto, null, 2));
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.substring(7);
        console.log('[DEBUG] FoodController.create - Access token present:', !!accessToken);
        try {
            const result = await this.foodService.create(createFoodDto, req.user.id, accessToken);
            console.log('[DEBUG] FoodController.create - Success, returning result');
            return result;
        }
        catch (error) {
            console.error('[ERROR] FoodController.create - Error occurred:', error);
            throw error;
        }
    }
    findAll(req) {
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.substring(7);
        return this.foodService.findAll(req.user.id, accessToken);
    }
    findOne(id, req) {
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.substring(7);
        return this.foodService.findOne(id, req.user.id, accessToken);
    }
    async update(id, updateFoodDto, req) {
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
        }
        catch (error) {
            console.error('[ERROR] FoodController.update - Error occurred:', error);
            throw error;
        }
    }
    async remove(id, req) {
        console.log('[DEBUG] FoodController.remove - Request received');
        console.log('[DEBUG] FoodController.remove - ID:', id);
        console.log('[DEBUG] FoodController.remove - User:', JSON.stringify(req.user, null, 2));
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.substring(7);
        try {
            const result = await this.foodService.remove(id, req.user.id, accessToken);
            console.log('[DEBUG] FoodController.remove - Success, returning result');
            return result;
        }
        catch (error) {
            console.error('[ERROR] FoodController.remove - Error occurred:', error);
            throw error;
        }
    }
};
exports.FoodController = FoodController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_food_dto_1.CreateFoodDto, Object]),
    __metadata("design:returntype", Promise)
], FoodController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FoodController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FoodController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_food_dto_1.UpdateFoodDto, Object]),
    __metadata("design:returntype", Promise)
], FoodController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FoodController.prototype, "remove", null);
exports.FoodController = FoodController = __decorate([
    (0, common_1.Controller)('food'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [food_service_1.FoodService])
], FoodController);
//# sourceMappingURL=food.controller.js.map
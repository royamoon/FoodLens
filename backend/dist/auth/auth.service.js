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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let AuthService = class AuthService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async register(registerDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .auth.signUp({
            email: registerDto.email,
            password: registerDto.password,
        });
        if (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
        return {
            user: data.user,
            session: data.session,
            message: 'Registration successful. Please check your email to verify your account.',
        };
    }
    async login(loginDto) {
        const { data, error } = await this.supabaseService
            .getClient()
            .auth.signInWithPassword({
            email: loginDto.email,
            password: loginDto.password,
        });
        if (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
        return {
            user: data.user,
            session: data.session,
            access_token: data.session?.access_token,
        };
    }
    async loginWithGoogle(redirectUri) {
        const { data, error } = await this.supabaseService
            .getClient()
            .auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUri || 'foodlens://auth/callback',
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
        if (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
        return {
            url: data.url,
            provider: data.provider,
        };
    }
    async handleOAuthCallback(accessToken, refreshToken) {
        try {
            const { data: { user }, error } = await this.supabaseService
                .getClient()
                .auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
            });
            if (error) {
                throw new common_1.UnauthorizedException(error.message);
            }
            if (!user) {
                throw new common_1.UnauthorizedException('No user found');
            }
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.full_name || user.email,
                },
                session: {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                },
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('OAuth callback failed: ' + error.message);
        }
    }
    async logout(accessToken) {
        const { error } = await this.supabaseService
            .getClient()
            .auth.signOut();
        if (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
        return { message: 'Logout successful' };
    }
    async verifyToken(token) {
        const { data, error } = await this.supabaseService
            .getClient()
            .auth.getUser(token);
        if (error) {
            console.log('AuthService.verifyToken - error details:', error);
            throw new common_1.UnauthorizedException('Invalid token');
        }
        const user = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email,
        };
        return user;
    }
    async getProfile(userId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .auth.admin.getUserById(userId);
        if (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
        return data.user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
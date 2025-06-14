import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
        access_token: string;
    }>;
    loginWithGoogle(body: {
        redirectUri?: string;
    }): Promise<{
        url: string;
        provider: import("@supabase/auth-js").Provider;
    }>;
    authCallback(body: {
        access_token: string;
        refresh_token?: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: any;
        };
        session: {
            access_token: string;
            refresh_token: string;
        };
    }>;
    logout(authHeader: string): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<any>;
    verifyToken(req: any): Promise<{
        valid: boolean;
        user: any;
    }>;
}

import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
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
    loginWithGoogle(redirectUri?: string): Promise<{
        url: string;
        provider: import("@supabase/auth-js").Provider;
    }>;
    handleOAuthCallback(accessToken: string, refreshToken?: string): Promise<{
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
    logout(accessToken: string): Promise<{
        message: string;
    }>;
    verifyToken(token: string): Promise<{
        id: string;
        email: string;
        name: any;
    }>;
    getProfile(userId: string): Promise<import("@supabase/auth-js").User>;
}

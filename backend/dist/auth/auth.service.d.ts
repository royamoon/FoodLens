import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '@supabase/supabase-js';
export declare class AuthService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    private _ensureUserProfile;
    register(registerDto: RegisterDto): Promise<{
        user: User;
        session: import("@supabase/supabase-js").AuthSession;
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: User;
        session: import("@supabase/supabase-js").AuthSession;
        access_token: string;
    }>;
    loginWithGoogle(redirectUri?: string): Promise<{
        url: string;
        provider: import("@supabase/supabase-js").Provider;
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
    getProfile(userId: string): Promise<User>;
}

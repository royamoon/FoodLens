import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private async _ensureUserProfile(user: User) {
    const adminClient = this.supabaseService.getAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116: "exact one row" violation (i.e., not found)
      throw new InternalServerErrorException('Error checking user profile');
    }

    if (!profile) {
      const { error: insertError } = await adminClient
        .from('user_profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          // Extract name and avatar from user metadata if available
          full_name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url,
          provider: user.app_metadata?.provider,
        });

      if (insertError) {
        throw new InternalServerErrorException('Error creating user profile');
      }
    }
  }

  async register(registerDto: RegisterDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signUp({
        email: registerDto.email,
        password: registerDto.password,
      });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    if (data.user) {
      await this._ensureUserProfile(data.user);
    }

    return {
      user: data.user,
      session: data.session,
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  async login(loginDto: LoginDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({
        email: loginDto.email,
        password: loginDto.password,
      });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      user: data.user,
      session: data.session,
      access_token: data.session?.access_token,
    };
  }

  async loginWithGoogle(redirectUri?: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri || 'exp://localhost:8081/--/auth/login-callback', // Use provided redirectUri or fallback
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      url: data.url,
      provider: data.provider,
    };
  }

  async handleOAuthCallback(accessToken: string, refreshToken?: string) {
    try {
      // Set the session with the provided tokens
      const { data: { user }, error } = await this.supabaseService
        .getClient()
        .auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      if (!user) {
        throw new UnauthorizedException('No user found');
      }

      if (user) {
        await this._ensureUserProfile(user);
      }

      // Return user and session info
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
    } catch (error) {
      throw new UnauthorizedException('OAuth callback failed: ' + error.message);
    }
  }

  async logout(accessToken: string) {
    const { error } = await this.supabaseService
      .getClient()
      .auth.signOut();

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return { message: 'Logout successful' };
  }

  async verifyToken(token: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(token);

    if (error) {
      console.log('AuthService.verifyToken - error details:', error);
      throw new UnauthorizedException('Invalid token');
    }

    // Return standardized user object
    const user = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.full_name || data.user.email,
    };
    return user;
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .auth.admin.getUserById(userId);

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return data.user;
  }
} 
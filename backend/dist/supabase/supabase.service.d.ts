import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    private readonly supabaseClient;
    private readonly configService;
    private supabaseAdmin;
    constructor(supabaseClient: SupabaseClient, configService: ConfigService);
    getClient(): SupabaseClient<any, "public", any>;
    getAdminClient(): SupabaseClient<any, "public", any>;
}

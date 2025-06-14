import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    private readonly supabaseClient;
    constructor(supabaseClient: SupabaseClient);
    getClient(): SupabaseClient<any, "public", any>;
}

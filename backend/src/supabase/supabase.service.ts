import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';

@Injectable()
export class SupabaseService {
  private supabaseAdmin: SupabaseClient;

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabaseClient: SupabaseClient,
    private readonly configService: ConfigService,
  ) {
    this.supabaseAdmin = createClient(
      configService.get('SUPABASE_URL'),
      configService.get('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  getClient() {
    return this.supabaseClient;
  }

  getAdminClient() {
    return this.supabaseAdmin;
  }
} 
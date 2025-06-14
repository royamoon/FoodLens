import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';

@Injectable()
export class SupabaseService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabaseClient: SupabaseClient,
  ) {}

  getClient() {
    return this.supabaseClient;
  }
} 
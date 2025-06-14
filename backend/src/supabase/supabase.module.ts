import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SUPABASE_CLIENT,
      useFactory: (configService: ConfigService) =>
        createClient(
          configService.get<string>('SUPABASE_URL'),
          configService.get<string>('SUPABASE_ANON_KEY'),
        ),
      inject: [ConfigService],
    },
    SupabaseService,
  ],
  exports: [SupabaseService],
})
export class SupabaseModule {} 
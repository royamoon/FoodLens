import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ValidateSessionDto {
  @IsString()
  @IsNotEmpty()
  access_token: string;

  @IsString()
  @IsOptional()
  refresh_token?: string;
} 
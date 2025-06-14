-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    provider TEXT CHECK (provider IN ('google', 'email')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can insert their own profile (for first-time setup)
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS user_profiles_provider_idx ON public.user_profiles(provider);
CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx ON public.user_profiles(created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

-- Optional: Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, full_name, email, provider)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.email,
        CASE 
            WHEN NEW.app_metadata->>'provider' = 'google' THEN 'google'
            ELSE 'email'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comments for documentation
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information linked to auth.users';
COMMENT ON COLUMN public.user_profiles.user_id IS 'Foreign key to auth.users.id';
COMMENT ON COLUMN public.user_profiles.full_name IS 'User full name from OAuth or manual input';
COMMENT ON COLUMN public.user_profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN public.user_profiles.email IS 'User email address';
COMMENT ON COLUMN public.user_profiles.provider IS 'Authentication provider: google or email';
COMMENT ON COLUMN public.user_profiles.created_at IS 'Profile creation timestamp';
COMMENT ON COLUMN public.user_profiles.updated_at IS 'Profile last update timestamp'; 
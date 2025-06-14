-- Create foods table
CREATE TABLE IF NOT EXISTS public.foods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    identified_food TEXT NOT NULL,
    image TEXT NOT NULL,
    meal_type TEXT,
    notes TEXT,
    portion_size TEXT NOT NULL,
    recognized_serving_size TEXT NOT NULL,
    nutrition_facts_per_portion JSONB NOT NULL,
    additional_notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own foods
CREATE POLICY "Users can view own foods" ON public.foods
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own foods
CREATE POLICY "Users can insert own foods" ON public.foods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own foods
CREATE POLICY "Users can update own foods" ON public.foods
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own foods
CREATE POLICY "Users can delete own foods" ON public.foods
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS foods_user_id_idx ON public.foods(user_id);
CREATE INDEX IF NOT EXISTS foods_timestamp_idx ON public.foods(timestamp);
CREATE INDEX IF NOT EXISTS foods_meal_type_idx ON public.foods(meal_type);

-- Grant necessary permissions
GRANT ALL ON public.foods TO authenticated;
GRANT ALL ON public.foods TO service_role; 
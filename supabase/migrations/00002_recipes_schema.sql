-- Migration for Recipes Feature
-- Table: user_recipe_views

CREATE TABLE IF NOT EXISTS public.user_recipe_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favourite BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, recipe_id)
);

-- Row Level Security (RLS) Settings
ALTER TABLE public.user_recipe_views ENABLE ROW LEVEL SECURITY;

-- Policies for user_recipe_views
CREATE POLICY "Users can view own recipe views" 
ON public.user_recipe_views FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipe views" 
ON public.user_recipe_views FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipe views" 
ON public.user_recipe_views FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipe views" 
ON public.user_recipe_views FOR DELETE 
USING (auth.uid() = user_id);

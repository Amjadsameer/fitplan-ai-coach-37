GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.ai_provider_keys TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_provider_keys TO authenticated;
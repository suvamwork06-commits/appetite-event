CREATE TABLE public.portfolio_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.portfolio_images TO anon;
GRANT SELECT, INSERT, DELETE ON public.portfolio_images TO authenticated;
GRANT ALL ON public.portfolio_images TO service_role;
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view portfolio images" ON public.portfolio_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Signed-in admins add portfolio images" ON public.portfolio_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Signed-in admins delete portfolio images" ON public.portfolio_images FOR DELETE TO authenticated USING (true);

CREATE POLICY "Anyone can read portfolio files" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'portfolio');
CREATE POLICY "Signed-in admins upload portfolio files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio');
CREATE POLICY "Signed-in admins delete portfolio files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio');
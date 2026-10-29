import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PortfolioPhoto = { id: string; category: string; storage_path: string; url: string };

export const PORTFOLIO_BUCKET = "portfolio";

export async function fetchPortfolioPhotos(): Promise<PortfolioPhoto[]> {
  const { data, error } = await supabase
    .from("portfolio_images")
    .select("id, category, storage_path")
    .order("created_at", { ascending: true });
  if (error) throw error;
  if (!data?.length) return [];
  const { data: signed } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .createSignedUrls(
      data.map((d) => d.storage_path),
      60 * 60 * 24 * 7,
    );
  return data
    .map((d, i) => ({ ...d, url: signed?.[i]?.signedUrl ?? "" }))
    .filter((d) => d.url);
}

export function usePortfolioPhotos() {
  return useQuery({ queryKey: ["portfolio-photos"], queryFn: fetchPortfolioPhotos });
}

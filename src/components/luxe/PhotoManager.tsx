import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { serviceShowcase } from "@/lib/content";
import { PORTFOLIO_BUCKET, usePortfolioPhotos, type PortfolioPhoto } from "@/lib/portfolio-photos";

export function PhotoManager() {
  const categories = serviceShowcase.map((c) => c.title);
  const [category, setCategory] = useState(categories[0]!);
  const [uploading, setUploading] = useState(false);
  const { data: photos = [], isLoading } = usePortfolioPhotos();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["portfolio-photos"] });

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${category.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(PORTFOLIO_BUCKET).upload(path, file, {
        contentType: file.type,
      });
      if (upErr) {
        toast.error(`Could not upload ${file.name}`);
        continue;
      }
      const { error } = await supabase.from("portfolio_images").insert({ category, storage_path: path });
      if (error) toast.error(`Could not save ${file.name}`);
      else ok++;
    }
    setUploading(false);
    if (ok) toast.success(`${ok} photo${ok > 1 ? "s" : ""} added to ${category}`);
    refresh();
  };

  const handleDelete = async (photo: PortfolioPhoto) => {
    if (!confirm("Delete this photo?")) return;
    const { error } = await supabase.from("portfolio_images").delete().eq("id", photo.id);
    if (error) return toast.error("Could not delete photo");
    await supabase.storage.from(PORTFOLIO_BUCKET).remove([photo.storage_path]);
    toast.success("Photo deleted");
    refresh();
  };

  return (
    <div className="space-y-12">
      <div className="clay-card flex flex-col gap-5 rounded-2xl p-8 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="eyebrow">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-3 w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-ivory"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-gold px-6 py-3 font-sans text-[0.7rem] tracking-[0.26em] text-gold uppercase transition-colors hover:bg-gold/10">
          <Upload className="size-4" />
          {uploading ? "Uploading…" : "Add photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={uploading}
            onChange={(e) => {
              void handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading photos…</p>
      ) : (
        categories.map((c) => {
          const list = photos.filter((p) => p.category === c);
          return (
            <section key={c}>
              <h2 className="text-2xl text-ivory">
                {c} <span className="text-sm text-muted-foreground">({list.length})</span>
              </h2>
              {list.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No uploaded photos yet — the website shows the default photos for this category.
                </p>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                  {list.map((p) => (
                    <div key={p.id} className="group relative overflow-hidden rounded-lg border border-border">
                      <img src={p.url} alt="" className="aspect-square w-full object-cover" />
                      <button
                        onClick={() => handleDelete(p)}
                        aria-label="Delete photo"
                        className="absolute top-2 right-2 rounded-full bg-background/80 p-2 text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}

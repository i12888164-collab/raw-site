import { supabase } from "@/lib/supabaseClient";
import { SECTIONS } from "@/lib/sections";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import CatalogClient from "@/components/CatalogClient";
import Statement from "@/components/Statement";

export const revalidate = 0;

export default async function Page() {
  const meta = SECTIONS["raw-street"];
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("section", "raw-street")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="store-page" style={{ "--accent": meta.accent, background: meta.bg }}>
      <Hero slug="raw-street" />
      {meta.stats ? <StatsBar stats={meta.stats} accent={meta.accent} /> : null}
      <CatalogClient products={products || []} section="raw-street" />
      <Statement lines={meta.statement} ghostText={meta.ghostText} accent={meta.accent} />
    </div>
  );
}

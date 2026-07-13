import PortalHub from "@/components/PortalHub";
import FeaturedGrid from "@/components/FeaturedGrid";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function Home() {
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <>
      <PortalHub />
      <FeaturedGrid products={products || []} />
    </>
  );
}

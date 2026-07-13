import ProductDetail from "@/components/ProductDetail";

export default function Page({ params }) {
  return <ProductDetail section="game-topup" id={params.id} />;
}

import ProductDetail from "@/components/ProductDetail";

export default function Page({ params }) {
  return <ProductDetail section="sportswear" id={params.id} />;
}

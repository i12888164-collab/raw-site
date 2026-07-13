import ProductDetail from "@/components/ProductDetail";

export default function Page({ params }) {
  return <ProductDetail section="raw-street" id={params.id} />;
}

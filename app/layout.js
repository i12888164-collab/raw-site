import "./globals.css";
import GrainOverlay from "@/components/GrainOverlay";
import CustomCursor from "@/components/CustomCursor";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Наш магазин",
  description: "Raw Street · Донат Shop · Sport Line",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <GrainOverlay />
        <CustomCursor />
        <NavBar />
        <div className="page-shell">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

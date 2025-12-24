import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${inter.variable} ${jetbrainsMono.variable} app-layout`}>
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}


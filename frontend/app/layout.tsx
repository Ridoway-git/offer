import { Geist } from "next/font/google";
import "./globals.css";
import NavigationWrapper from "../components/NavigationWrapper";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Offer Bazar - Best Deals & Coupons in Bangladesh</title>
      </head>
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <NavigationWrapper />
        {children}
        <Footer />
      </body>
    </html>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Header from "../components/nav/Header";
import MobileNav from "../components/nav/MobileNav";
import Footer from "../components/nav/Footer";

interface ClientLayoutWrapperProps {
  type: 'header' | 'mobilenav' | 'footer';
}

export default function ClientLayoutWrapper({ type }: ClientLayoutWrapperProps) {
  const pathname = usePathname();

  // If path is under /admin, do not render main site elements
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  switch (type) {
    case 'header':
      return <Header />;
    case 'mobilenav':
      return <MobileNav />;
    case 'footer':
      return <Footer />;
    default:
      return null;
  }
}

import { PageTransition } from "@/components/motion/page-transition";

export default function StorefrontTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

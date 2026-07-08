import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { QuickViewModal } from "@/components/storefront/quick-view-modal";
import { WishlistSync } from "@/components/storefront/wishlist-sync";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
      <CartDrawer />
      <QuickViewModal />
      <WishlistSync />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCartStore, cartSubtotal } from "@/store/cart";
import { useRazorpayScript } from "@/lib/use-razorpay-script";
import { formatINR } from "@/lib/format";
import { brand } from "@/lib/brand";

type SavedAddress = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
};

export function CheckoutForm({
  addresses,
  isLoggedIn,
  userName,
  userEmail,
}: {
  addresses: SavedAddress[];
  isLoggedIn: boolean;
  userName?: string;
  userEmail?: string;
}) {
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);
  const clearCart = useCartStore((s) => s.clear);
  const scriptLoaded = useRazorpayScript();
  const router = useRouter();

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [selectedId, setSelectedId] = useState<string | null>(defaultAddress?.id ?? null);
  const [useNewAddress, setUseNewAddress] = useState(addresses.length === 0);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState(userName ?? "");
  const [guestEmail, setGuestEmail] = useState(userEmail ?? "");
  const [form, setForm] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const subtotal = cartSubtotal(items);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedId),
    [addresses, selectedId],
  );

  async function handlePlaceOrder() {
    if (!isLoggedIn && !guestEmail) {
      toast.error("Enter your email to continue.");
      return;
    }
    if (!fullName.trim()) {
      toast.error("Enter the recipient's full name.");
      return;
    }

    const shippingAddress = useNewAddress
      ? { ...form, label: "Shipping" }
      : selectedAddress
        ? {
            label: selectedAddress.label,
            line1: selectedAddress.line1,
            line2: selectedAddress.line2,
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
            phone: selectedAddress.phone,
          }
        : null;

    if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.pincode) {
      toast.error("Please provide a complete shipping address.");
      return;
    }

    if (!scriptLoaded) {
      toast.error("Payment gateway is still loading. Try again in a moment.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
          fullName,
          shippingAddress,
          guestEmail: isLoggedIn ? undefined : guestEmail,
          couponCode: couponCode ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not create order.");
        setSubmitting(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: brand.name,
        description: `Order ${data.orderNo}`,
        order_id: data.razorpayOrderId,
        prefill: { name: fullName, email: guestEmail || userEmail, contact: shippingAddress.phone },
        theme: { color: "#7a1f2e" },
        handler: async (response) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mongoOrderId: data.mongoOrderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          if (verifyRes.ok) {
            clearCart();
            router.push(`/order/${data.mongoOrderId}`);
          } else {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
      });
      razorpay.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-heading mb-3 text-lg font-semibold">Contact & Recipient</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            {!isLoggedIn && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="guestEmail">Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-heading mb-3 text-lg font-semibold">Shipping Address</h2>

          {addresses.length > 0 && (
            <div className="mb-3 flex flex-col gap-2">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className="border-border has-[:checked]:border-primary flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm"
                >
                  <input
                    type="radio"
                    name="address"
                    checked={!useNewAddress && selectedId === addr.id}
                    onChange={() => {
                      setSelectedId(addr.id);
                      setUseNewAddress(false);
                    }}
                    className="mt-1"
                  />
                  <span>
                    <strong>{addr.label}</strong> — {addr.line1}, {addr.city}, {addr.state} -{" "}
                    {addr.pincode} · {addr.phone}
                  </span>
                </label>
              ))}
              <button
                type="button"
                onClick={() => setUseNewAddress(true)}
                className="text-brand-secondary text-left text-sm font-medium underline"
              >
                + Use a new address
              </button>
            </div>
          )}

          {useNewAddress && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                placeholder="Address Line 1"
                className="sm:col-span-2"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
              />
              <Input
                placeholder="Address Line 2 (optional)"
                className="sm:col-span-2"
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
              />
              <Input
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <Input
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
              <Input
                placeholder="Pincode"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
              <Input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-border flex h-fit flex-col gap-4 rounded-2xl border p-5">
        <h2 className="font-heading text-lg font-semibold">Order Summary</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between">
              <span className="text-muted-foreground">
                {item.title} × {item.qty}
              </span>
              <span>{formatINR((item.salePrice ?? item.price) * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="border-border flex justify-between border-t pt-3 font-semibold">
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <p className="text-muted-foreground text-xs">
          Coupon discount and shipping are calculated at payment.
        </p>
        <Button size="lg" disabled={submitting || items.length === 0} onClick={handlePlaceOrder}>
          {submitting ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </div>
  );
}

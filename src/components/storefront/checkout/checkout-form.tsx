"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCartStore, cartSubtotal } from "@/store/cart";
import { useRazorpayScript } from "@/lib/use-razorpay-script";
import { formatINR } from "@/lib/format";
import { brand } from "@/lib/brand";

type DeliveryMethod = "delivery" | "pickup";
type PickupPaymentMethod = "online" | "pay_at_store";

type ShippingEstimate =
  | { status: "loading" }
  | { status: "ok"; rate: number }
  | { status: "fallback"; rate: number }
  | { status: "not_serviceable" }
  | { status: "error" };

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
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [pickupConfirmOpen, setPickupConfirmOpen] = useState(false);
  // Defaults to "online" so a customer who never touches this new choice gets exactly the
  // existing Pay Online Now behavior — nothing changes for them by omission.
  const [pickupPaymentMethod, setPickupPaymentMethod] = useState<PickupPaymentMethod>("online");
  const isPayAtStore = deliveryMethod === "pickup" && pickupPaymentMethod === "pay_at_store";

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

  const currentPincode = useNewAddress ? form.pincode : (selectedAddress?.pincode ?? "");
  const [shippingEstimate, setShippingEstimate] = useState<ShippingEstimate | null>(null);

  useEffect(() => {
    if (deliveryMethod !== "delivery" || !/^\d{6}$/.test(currentPincode)) {
      setShippingEstimate(null);
      return;
    }
    if (items.length === 0) return;

    setShippingEstimate({ status: "loading" });
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch("/api/shipping/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pincode: currentPincode,
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        }),
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("estimate failed"))))
        .then((data: ShippingEstimate) => setShippingEstimate(data))
        .catch((err) => {
          if (err.name !== "AbortError") setShippingEstimate({ status: "error" });
        });
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryMethod, currentPincode, items.length]);

  const shippingRate =
    shippingEstimate?.status === "ok" || shippingEstimate?.status === "fallback"
      ? shippingEstimate.rate
      : 0;
  const estimatedTotal = subtotal + shippingRate;
  const notServiceable =
    deliveryMethod === "delivery" && shippingEstimate?.status === "not_serviceable";

  async function handlePlaceOrder() {
    if (!isLoggedIn && !guestEmail) {
      toast.error("Enter your email to continue.");
      return;
    }
    if (!fullName.trim()) {
      toast.error("Enter the recipient's full name.");
      return;
    }

    // Pickup orders never collect an address in the UI — the Order document still requires
    // one at the schema level (used for the "who to hand the order to" record), so this sends
    // the store's own address. The server independently overrides this with the same value
    // for pickup orders regardless of what's sent here (never trusts the client for it).
    const shippingAddress =
      deliveryMethod === "pickup"
        ? { label: "Pickup", ...brand.storeAddress }
        : useNewAddress
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

    if (notServiceable) {
      toast.error("We can't deliver to this pincode. Try store pickup instead.");
      return;
    }

    if (isPayAtStore) {
      setSubmitting(true);
      try {
        const res = await fetch("/api/orders/pay-at-store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
            fullName,
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
        clearCart();
        router.push(`/order/${data.mongoOrderId}`);
      } catch {
        toast.error("Something went wrong. Please try again.");
        setSubmitting(false);
      }
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
          deliveryMethod,
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
        prefill: {
          name: fullName,
          email: guestEmail || userEmail,
          // Never the store's own number (shippingAddress.phone for pickup orders) — that's
          // not the buyer's contact, so leave it for Razorpay's own checkout to collect.
          contact: deliveryMethod === "pickup" ? undefined : shippingAddress.phone,
        },
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
          setSubmitting(false);
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            fetch("/api/razorpay/fail", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: data.razorpayOrderId,
                reason: "Checkout closed before completing payment",
              }),
            }).catch(() => {});
            toast.info("Payment cancelled. Your cart is still saved.");
          },
        },
      });
      razorpay.on("payment.failed", (response) => {
        setSubmitting(false);
        fetch("/api/razorpay/fail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayOrderId: data.razorpayOrderId,
            reason: response.error.description || response.error.reason,
          }),
        }).catch(() => {});
        toast.error(response.error.description || "Payment failed. Please try again.");
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

        {deliveryMethod === "delivery" && (
          <div>
            <h2 className="font-heading mb-3 text-lg font-semibold">Shipping Address</h2>

            {addresses.length > 0 && (
              <div className="mb-3 flex flex-col gap-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className="border-border has-checked:border-primary flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm"
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
        )}

        <div>
          <h2 className="font-heading mb-3 text-lg font-semibold">Delivery Method</h2>
          <div className="flex flex-col gap-2">
            <label className="border-border has-checked:border-primary flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm">
              <input
                type="radio"
                name="deliveryMethod"
                checked={deliveryMethod === "delivery"}
                onChange={() => setDeliveryMethod("delivery")}
                className="mt-1"
              />
              <span>
                <strong>Home Delivery</strong>
                <span className="text-muted-foreground block">
                  Shipped to your address via courier.
                </span>
              </span>
            </label>
            <label className="border-border has-checked:border-primary flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm">
              <input
                type="radio"
                name="deliveryMethod"
                checked={deliveryMethod === "pickup"}
                onChange={() => setPickupConfirmOpen(true)}
                className="mt-1"
              />
              <span>
                <strong>Pickup at Store</strong>
                <span className="text-muted-foreground block">
                  Collect your order in person from our store.
                </span>
              </span>
            </label>
          </div>
        </div>

        {deliveryMethod === "pickup" && (
          <div>
            <h2 className="font-heading mb-3 text-lg font-semibold">Payment Method</h2>
            <div className="flex flex-col gap-2">
              <label className="border-border has-checked:border-primary flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm">
                <input
                  type="radio"
                  name="pickupPaymentMethod"
                  checked={pickupPaymentMethod === "online"}
                  onChange={() => setPickupPaymentMethod("online")}
                  className="mt-1"
                />
                <span>
                  <strong>Pay Online Now</strong>
                  <span className="text-muted-foreground block">
                    Pay by card, UPI, or netbanking now via Razorpay.
                  </span>
                </span>
              </label>
              <label className="border-border has-checked:border-primary flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm">
                <input
                  type="radio"
                  name="pickupPaymentMethod"
                  checked={pickupPaymentMethod === "pay_at_store"}
                  onChange={() => setPickupPaymentMethod("pay_at_store")}
                  className="mt-1"
                />
                <span>
                  <strong>Pay at Store</strong>
                  <span className="text-muted-foreground block">
                    Skip online payment — pay in cash or UPI when you collect your order.
                  </span>
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        open={pickupConfirmOpen}
        onOpenChange={(open) => {
          if (!open) setPickupConfirmOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm store pickup?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll need to visit our store in person to collect this order after it&apos;s
              confirmed — it won&apos;t be shipped.
              <span className="text-foreground mt-3 block font-medium">{brand.name} Store</span>
              <span className="block">{brand.storeAddress.line1}</span>
              <span className="block">
                {brand.storeAddress.city}, {brand.storeAddress.state} - {brand.storeAddress.pincode}
              </span>
              <span className="block">{brand.storeAddress.phone}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDeliveryMethod("pickup");
                setPickupConfirmOpen(false);
              }}
            >
              Yes, I&apos;ll pick it up
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
        <div className="border-border flex justify-between border-t pt-3">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>

        {deliveryMethod === "pickup" && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>Free (store pickup)</span>
          </div>
        )}

        {deliveryMethod === "delivery" && shippingEstimate?.status === "loading" && (
          <p className="text-muted-foreground text-xs">Calculating shipping…</p>
        )}
        {deliveryMethod === "delivery" && shippingEstimate?.status === "ok" && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatINR(shippingEstimate.rate)}</span>
          </div>
        )}
        {deliveryMethod === "delivery" && shippingEstimate?.status === "fallback" && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping (estimated)</span>
            <span>{formatINR(shippingEstimate.rate)}</span>
          </div>
        )}
        {deliveryMethod === "delivery" && shippingEstimate?.status === "error" && (
          <p className="text-muted-foreground text-xs">
            Couldn&apos;t calculate shipping — it will be confirmed at payment.
          </p>
        )}
        {notServiceable && (
          <p className="text-destructive text-sm font-medium">
            Sorry, we can&apos;t currently deliver to this pincode. Try store pickup instead.
          </p>
        )}
        {deliveryMethod === "delivery" && !shippingEstimate && (
          <p className="text-muted-foreground text-xs">Enter your pincode to see shipping cost.</p>
        )}

        <div className="border-border flex justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>{formatINR(estimatedTotal)}</span>
        </div>
        {isPayAtStore ? (
          <p className="text-brand-secondary text-xs font-medium">
            No payment now — pay {formatINR(estimatedTotal)} in cash or UPI at pickup.
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">
            Coupon discount, if any, is applied at payment.
          </p>
        )}
        <Button
          size="lg"
          disabled={submitting || items.length === 0 || notServiceable}
          onClick={handlePlaceOrder}
        >
          {submitting ? "Processing..." : isPayAtStore ? "Place Order" : "Pay Now"}
        </Button>
      </div>
    </div>
  );
}
